import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { calculateCompensation, calculateDistance, checkEligibility } from "./utils/compensation";
import { getFlightInfo, analyzeFlightDelay } from "./utils/flightApi";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { sendClaimCreatedEmail, sendStatusUpdateEmail } from "./email";
import bcrypt from "bcryptjs";
import { sdk } from "./_core/sdk";

// Admin procedure - only allows admin users
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Bu işlem için yetkiniz yok' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    // Kayıt ol (Register)
    register: publicProcedure
      .input(z.object({
        email: z.string().email("İşlevsel bir e-posta adresi girin"),
        password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
        name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // E-posta zaten kayıtlı mı kontrol et
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Bu e-posta adresi zaten kayıtlı",
          });
        }
        
        // Şifreyi hash'le
        const passwordHash = await bcrypt.hash(input.password, 12);
        
        // Kullanıcıyı oluştur
        const user = await db.createUserWithPassword({
          email: input.email,
          passwordHash,
          name: input.name,
          phone: input.phone,
        });
        
        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Kullanıcı oluşturulamadı",
          });
        }
        
        // E-posta doğrulama token'ı oluştur ve gönder
        try {
          const verificationToken = nanoid(64);
          const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat
          await db.setEmailVerificationToken(input.email, verificationToken, verificationExpires);
          
          const { sendEmailVerificationEmail } = await import("./email");
          await sendEmailVerificationEmail(input.email, input.name, verificationToken);
        } catch (emailError) {
          console.error('[Auth] Failed to send verification email:', emailError);
          // E-posta gönderilemese bile kayıt başarılı sayılır
        }
        
        // Session oluştur ve cookie ayarla
        const sessionToken = await sdk.createSessionToken(user.openId, {
          expiresInMs: ONE_YEAR_MS,
          name: user.name || "",
        });
        
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });
        
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
      }),
    
    // Giriş yap (Login)
    login: publicProcedure
      .input(z.object({
        email: z.string().email("İşlevsel bir e-posta adresi girin"),
        password: z.string().min(1, "Şifre gereklidir"),
      }))
      .mutation(async ({ input, ctx }) => {
        // Kullanıcıyı bul
        const user = await db.getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "E-posta veya şifre hatalı",
          });
        }
        
        // Şifreyi doğrula
        const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValidPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "E-posta veya şifre hatalı",
          });
        }
        
        // Son giriş zamanını güncelle
        await db.upsertUser({
          openId: user.openId,
          lastSignedIn: new Date(),
        });
        
        // Session oluştur ve cookie ayarla
        const sessionToken = await sdk.createSessionToken(user.openId, {
          expiresInMs: ONE_YEAR_MS,
          name: user.name || "",
        });
        
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });
        
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      }),
    
    // Çıkış yap (Logout)
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    
    // Şifre değiştir
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string().min(1, "Mevcut şifre gereklidir"),
        newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalıdır"),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = ctx.user;
        
        if (!user.passwordHash) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Bu hesap için şifre değiştirme desteklenmiyor",
          });
        }
        
        // Mevcut şifreyi doğrula
        const isValidPassword = await bcrypt.compare(input.currentPassword, user.passwordHash);
        if (!isValidPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Mevcut şifre hatalı",
          });
        }
        
        // Yeni şifreyi hash'le ve kaydet
        const newPasswordHash = await bcrypt.hash(input.newPassword, 12);
        await db.updateUserPassword(user.id, newPasswordHash);
        
        return { success: true };
      }),
    
    // Şifremi Unuttum - Token oluştur ve e-posta gönder
    forgotPassword: publicProcedure
      .input(z.object({
        email: z.string().email("İşlevsel bir e-posta adresi girin"),
      }))
      .mutation(async ({ input }) => {
        const user = await db.getUserByEmail(input.email);
        
        // Güvenlik: Kullanıcı bulunamasa bile aynı mesajı dön
        if (!user) {
          return { success: true, message: "Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama linki gönderilecektir." };
        }
        
        // Sadece şifreli hesaplar için
        if (!user.passwordHash) {
          return { success: true, message: "Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama linki gönderilecektir." };
        }
        
        // Token oluştur (64 karakter)
        const token = nanoid(64);
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 saat geçerli
        
        // Token'u veritabanına kaydet
        await db.setPasswordResetToken(input.email, token, expires);
        
        // E-posta gönder
        const { sendPasswordResetEmail } = await import("./email");
        await sendPasswordResetEmail(input.email, user.name || "Kullanıcı", token);
        
        return { success: true, message: "Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama linki gönderilecektir." };
      }),
    
    // Token doğrula
    verifyResetToken: publicProcedure
      .input(z.object({
        token: z.string().min(1, "Token gereklidir"),
      }))
      .query(async ({ input }) => {
        const user = await db.getUserByResetToken(input.token);
        return { valid: !!user };
      }),
    
    // Şifre sıfırla
    resetPassword: publicProcedure
      .input(z.object({
        token: z.string().min(1, "Token gereklidir"),
        newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalıdır"),
      }))
      .mutation(async ({ input }) => {
        // Token'u doğrula
        const user = await db.getUserByResetToken(input.token);
        if (!user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Şifre sıfırlama linki geçersiz veya süresi dolmuş",
          });
        }
        
        // Yeni şifreyi hash'le
        const newPasswordHash = await bcrypt.hash(input.newPassword, 12);
        
        // Şifreyi güncelle ve token'ı temizle
        const success = await db.resetPassword(input.token, newPasswordHash);
        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Şifre sıfırlanırken bir hata oluştu",
          });
        }
        
        return { success: true, message: "Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz." };
      }),
    
    // E-posta doğrulama - Token gönder
    sendVerificationEmail: protectedProcedure
      .mutation(async ({ ctx }) => {
        const user = ctx.user;
        
        if (user.emailVerified) {
          return { success: true, message: "E-posta adresiniz zaten doğrulanmış." };
        }
        
        if (!user.email) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "E-posta adresi bulunamadı",
          });
        }
        
        // Token oluştur (64 karakter)
        const token = nanoid(64);
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat geçerli
        
        // Token'u veritabanına kaydet
        await db.setEmailVerificationToken(user.email, token, expires);
        
        // E-posta gönder
        const { sendEmailVerificationEmail } = await import("./email");
        await sendEmailVerificationEmail(user.email, user.name || "Kullanıcı", token);
        
        return { success: true, message: "Doğrulama e-postası gönderildi. Lütfen gelen kutunuzu kontrol edin." };
      }),
    
    // E-posta doğrula
    verifyEmail: publicProcedure
      .input(z.object({
        token: z.string().min(1, "Token gereklidir"),
      }))
      .mutation(async ({ input }) => {
        const success = await db.verifyUserEmail(input.token);
        
        if (!success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Doğrulama linki geçersiz veya süresi dolmuş",
          });
        }
        
        return { success: true, message: "E-posta adresiniz başarıyla doğrulandı!" };
      }),
    
    // E-posta doğrulama durumu kontrol
    checkEmailVerification: protectedProcedure
      .query(async ({ ctx }) => {
        return {
          verified: ctx.user.emailVerified === true,
          email: ctx.user.email,
        };
      }),
  }),

  // ============ AIRLINES ============
  airlines: router({
    list: publicProcedure.query(async () => {
      return db.getActiveAirlines();
    }),
    
    getByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        return db.getAirlineByCode(input.code);
      }),
    
    // Admin operations
    listAll: adminProcedure.query(async () => {
      return db.getAllAirlines();
    }),
    
    create: adminProcedure
      .input(z.object({
        code: z.string().min(2).max(3),
        name: z.string().min(1),
        country: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        contactAddress: z.string().optional(),
        website: z.string().url().optional(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createAirline(input);
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().min(2).max(3).optional(),
        name: z.string().min(1).optional(),
        country: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        contactAddress: z.string().optional(),
        website: z.string().url().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateAirline(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAirline(input.id);
        return { success: true };
      }),
  }),

  // ============ FLIGHT API ============
  flight: router({
    // Otomatik uçuş bilgisi sorgulama
    lookup: publicProcedure
      .input(z.object({
        flightNumber: z.string().min(2),
        flightDate: z.string(),
      }))
      .mutation(async ({ input }) => {
        const result = await getFlightInfo(input.flightNumber, input.flightDate);
        
        if (!result.success || !result.data) {
          return {
            found: false,
            error: result.error || 'Uçuş bulunamadı',
          };
        }
        
        const analysis = analyzeFlightDelay(result.data);
        const distance = calculateDistance(analysis.departureAirport, analysis.arrivalAirport);
        
        // Uygunluk kontrolü
        let disruptionType: "delay" | "cancellation" | "denied_boarding" | "downgrade" = 'delay';
        if (analysis.isCancelled) {
          disruptionType = 'cancellation';
        }
        
        const eligibility = checkEligibility({
          disruptionType,
          delayDuration: analysis.delayMinutes,
          distance,
        });
        
        let compensation = null;
        if (eligibility.eligible) {
          const comp = calculateCompensation(distance, disruptionType);
          compensation = {
            amount: comp.amount,
            currency: 'EUR',
            commissionRate: 25,
            netAmount: comp.amount * 0.75,
          };
        }
        
        return {
          found: true,
          flightData: {
            flightNumber: analysis.flightNumber,
            flightDate: result.data.flight_date,
            departureAirport: analysis.departureAirport,
            arrivalAirport: analysis.arrivalAirport,
            airlineName: analysis.airlineName,
            airlineCode: analysis.airlineCode,
            scheduledDeparture: analysis.scheduledDeparture,
            actualDeparture: analysis.actualDeparture,
            scheduledArrival: analysis.scheduledArrival,
            actualArrival: analysis.actualArrival,
            status: result.data.flight_status,
          },
          delay: {
            hasDelay: analysis.hasDelay,
            delayMinutes: analysis.delayMinutes,
            isCancelled: analysis.isCancelled,
          },
          eligibility: {
            eligible: eligibility.eligible,
            reason: eligibility.reason,
            distance,
            disruptionType,
          },
          compensation,
        };
      }),
  }),

  // ============ COMPENSATION CALCULATOR ============
  calculator: router({
    // Uçuş numarasından mesafe ve tazminat hesaplama
    getFlightDistance: publicProcedure
      .input(z.object({
        flightNumber: z.string().min(2),
        flightDate: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Uçuş bilgilerini API'den çek
        const flightResult = await getFlightInfo(input.flightNumber, input.flightDate);
        
        if (!flightResult.success || !flightResult.data) {
          return {
            success: false,
            error: flightResult.error || 'Uçuş bilgisi bulunamadı',
          };
        }
        
        const flightData = flightResult.data;
        const departureCode = flightData.departure.iata;
        const arrivalCode = flightData.arrival.iata;
        
        // Mesafe hesapla
        const distance = calculateDistance(departureCode, arrivalCode);
        
        if (!distance) {
          return {
            success: false,
            error: 'Havalimanları arası mesafe hesaplanamadı',
            departureAirport: departureCode,
            arrivalAirport: arrivalCode,
            airlineName: flightData.airline.name,
          };
        }
        
        // Tazminat hesapla
        const compensation = calculateCompensation(distance, 'delay', departureCode, arrivalCode);
        
        // Gecikme bilgisi
        const delayMinutes = flightData.departure.delay || flightData.arrival.delay || 0;
        const isCancelled = flightData.flight_status === 'cancelled';
        
        return {
          success: true,
          departureAirport: departureCode,
          departureAirportName: flightData.departure.airport,
          arrivalAirport: arrivalCode,
          arrivalAirportName: flightData.arrival.airport,
          airlineName: flightData.airline.name,
          airlineCode: flightData.airline.iata,
          distance,
          compensationAmount: compensation.amount,
          compensationCurrency: 'EUR',
          regulation: compensation.regulation || 'SHY-YOLCU',
          category: compensation.category,
          delayMinutes,
          isCancelled,
          flightStatus: flightData.flight_status,
          scheduledDeparture: flightData.departure.scheduled,
          actualDeparture: flightData.departure.actual,
        };
      }),

    check: publicProcedure
      .input(z.object({
        flightNumber: z.string().min(2),
        flightDate: z.string(),
        departureAirport: z.string().length(3),
        arrivalAirport: z.string().length(3),
        disruptionType: z.enum(["delay", "cancellation", "denied_boarding", "downgrade"]),
        delayDuration: z.number().optional(), // minutes
      }))
      .mutation(async ({ input }) => {
        const distance = calculateDistance(input.departureAirport, input.arrivalAirport);
        const eligibility = checkEligibility({
          disruptionType: input.disruptionType,
          delayDuration: input.delayDuration,
          distance,
        });
        
        if (!eligibility.eligible) {
          return {
            eligible: false,
            reason: eligibility.reason,
            distance,
          };
        }
        
        // Yurtiçi/yurtdışı kontrolü için departure ve arrival parametrelerini geç
        const compensation = calculateCompensation(distance, input.disruptionType, input.departureAirport, input.arrivalAirport);
        
        return {
          eligible: true,
          distance,
          compensationAmount: compensation.amount,
          compensationCurrency: "EUR",
          commissionRate: 25,
          netAmount: compensation.amount * 0.75,
          regulation: compensation.regulation || "SHY-YOLCU",
          category: compensation.category,
        };
      }),
  }),

  // ============ CLAIMS ============
  claims: router({
    // User's own claims
    myList: protectedProcedure.query(async ({ ctx }) => {
      const claims = await db.getUserClaims(ctx.user.id);
      // MySQL'de boolean değerler 0/1 olarak saklanır, JavaScript'te boolean'a dönüştür
      return claims.map(claim => ({
        ...claim,
        isConnecting: Boolean(claim.isConnecting),
      }));
    }),
    
    myClaimDetail: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const claim = await db.getClaimById(input.id);
        if (!claim || claim.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Talep bulunamadı' });
        }
        const documents = await db.getClaimDocuments(input.id);
        const payments = await db.getClaimPayments(input.id);
        const passengers = await db.getClaimPassengers(input.id);
        
        // İmza S3 URL'si ise, server-side'da base64'e dönüştür (CORS sorununu aşmak için)
        let signatureBase64: string | null = null;
        if (claim.consentSignature && claim.consentSignature.startsWith('http')) {
          try {
            const response = await fetch(claim.consentSignature);
            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const contentType = response.headers.get('content-type') || 'image/png';
              signatureBase64 = `data:${contentType};base64,${buffer.toString('base64')}`;
            }
          } catch (e) {
            console.error('İmza yüklenemedi:', e);
          }
        } else if (claim.consentSignature) {
          // Zaten base64 formatında
          signatureBase64 = claim.consentSignature;
        }
        
        return { 
          claim: { 
            ...claim, 
            isConnecting: Boolean(claim.isConnecting), // MySQL'de 0/1 olarak saklanır
            consentSignatureBase64: signatureBase64 
          }, 
          documents, payments, passengers 
        };
      }),
    
    create: protectedProcedure
      .input(z.object({
        flightNumber: z.string().min(2),
        flightDate: z.string(),
        departureAirport: z.string().length(3),
        arrivalAirport: z.string().length(3),
        // Aktarmalı uçuş bilgileri
        isConnecting: z.boolean().optional(),
        connectionAirport: z.string().length(3).optional(),
        flight2Number: z.string().optional(),
        flight2Date: z.string().optional(),
        // Sorun bilgileri
        disruptionType: z.enum(["delay", "cancellation", "denied_boarding", "downgrade"]),
        delayDuration: z.number().optional(),
        passengerName: z.string().min(2),
        passengerEmail: z.string().email(),
        passengerPhone: z.string().optional(),
        passengerIdNumber: z.string().optional(), // TC Kimlik No
        bookingReference: z.string().optional(),
        passengerIban: z.string().optional(), // IBAN numarası
        passengerBankName: z.string().optional(), // Banka adı
        consentSignature: z.string().optional(), // Base64 imza görseli
        signedAgreementContent: z.string().optional(), // İmza atıldığı andaki sözleşme metni (JSON)
        // Çoklu yolcu desteği
        passengers: z.array(z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email().optional(),
          phone: z.string().optional(),
        })).optional(),
        documents: z.array(z.object({
          type: z.string(),
          fileName: z.string(),
          fileData: z.string(), // Base64
          mimeType: z.string(),
          passengerIndex: z.number().optional(), // Hangi yolcuya ait
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Extract airline code from flight number
        const airlineCode = input.flightNumber.replace(/[0-9]/g, '').toUpperCase();
        const airline = await db.getAirlineByCode(airlineCode);
        
        // Calculate compensation - yolcu sayısına göre çarp
        const distance = calculateDistance(input.departureAirport, input.arrivalAirport);
        // Yurtiçi/yurtdışı kontrolü için departure ve arrival parametrelerini geç
        const compensationPerPassenger = calculateCompensation(distance, input.disruptionType, input.departureAirport, input.arrivalAirport);
        const passengerCount = input.passengers?.length || 1;
        const totalCompensation = compensationPerPassenger.amount * passengerCount;
        const commissionRate = 25;
        const commissionAmount = totalCompensation * (commissionRate / 100);
        const netPayout = totalCompensation - commissionAmount;
        
        // Get client IP for consent tracking
        const clientIp = ctx.req.headers['x-forwarded-for'] as string || ctx.req.socket?.remoteAddress || 'unknown';
        
        // İmzayı S3'e yükle (eğer varsa)
        let consentSignatureUrl: string | undefined;
        if (input.consentSignature) {
          try {
            // Base64'ten buffer'a çevir
            const base64Data = input.consentSignature.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            
            // S3'e yükle
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            const fileKey = `signatures/${ctx.user.id}/consent-${timestamp}-${randomSuffix}.png`;
            const { url } = await storagePut(fileKey, buffer, 'image/png');
            consentSignatureUrl = url;
          } catch (error) {
            console.error('Failed to upload consent signature to S3:', error);
            // S3 yükleme başarısız olursa, base64'ü doğrudan kaydet (fallback)
            consentSignatureUrl = input.consentSignature;
          }
        }

        const result = await db.createClaim({
          userId: ctx.user.id,
          flightNumber: input.flightNumber.toUpperCase(),
          flightDate: new Date(input.flightDate),
          airlineId: airline?.id,
          departureAirport: input.departureAirport.toUpperCase(),
          arrivalAirport: input.arrivalAirport.toUpperCase(),
          // Aktarmalı uçuş bilgileri
          isConnecting: input.isConnecting || false,
          connectionAirport: input.connectionAirport?.toUpperCase(),
          flight2Number: input.flight2Number?.toUpperCase(),
          flight2Date: input.flight2Date ? new Date(input.flight2Date) : undefined,
          // Sorun bilgileri
          disruptionType: input.disruptionType,
          delayDuration: input.delayDuration,
          passengerName: input.passengerName,
          passengerEmail: input.passengerEmail,
          passengerPhone: input.passengerPhone,
          passengerIdNumber: input.passengerIdNumber,
          bookingReference: input.bookingReference,
          passengerIban: input.passengerIban,
          passengerBankName: input.passengerBankName,
          flightDistance: distance,
          compensationAmount: totalCompensation.toString(),
          commissionRate: commissionRate.toString(),
          commissionAmount: commissionAmount.toString(),
          netPayoutAmount: netPayout.toString(),
          status: 'submitted',
          submittedAt: new Date(),
          consentSignature: consentSignatureUrl,
          consentSignedAt: input.consentSignature ? new Date() : undefined,
          consentIpAddress: input.consentSignature ? clientIp : undefined,
          signedAgreementContent: input.signedAgreementContent, // İmza atıldığı andaki sözleşme metni
        });
        
        // Yolcuları kaydet
        const passengerIdMap: Map<number, number> = new Map(); // index -> passengerId
        if (input.passengers && input.passengers.length > 0) {
          for (let i = 0; i < input.passengers.length; i++) {
            const p = input.passengers[i];
            const passengerId = await db.createPassenger({
              claimId: result.id,
              firstName: p.firstName,
              lastName: p.lastName,
              email: p.email,
              phone: p.phone,
              isPrimary: i === 0, // İlk yolcu birincil
            });
            passengerIdMap.set(i, passengerId);
          }
        }
        
        // Create notification
        await db.createNotification({
          userId: ctx.user.id,
          claimId: result.id,
          type: 'claim_submitted',
          title: 'Talebiniz Alındı',
          message: `${result.claimNumber} numaralı tazminat talebiniz başarıyla oluşturuldu. En kısa sürede incelenecektir.`,
        });
        
        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          claimId: result.id,
          action: 'claim_created',
          details: { claimNumber: result.claimNumber },
        });
        
        // Belgeleri kaydet
        if (input.documents && input.documents.length > 0) {
          for (const doc of input.documents) {
            try {
              const fileBuffer = Buffer.from(doc.fileData, 'base64');
              const fileKey = `claims/${result.id}/${doc.type}-${nanoid()}-${doc.fileName}`;
              const { url } = await storagePut(fileKey, fileBuffer, doc.mimeType);
              
              // Yolcu ID'sini bul (eğer belirtilmişse)
              const passengerId = doc.passengerIndex !== undefined 
                ? passengerIdMap.get(doc.passengerIndex) 
                : undefined;
              
              await db.createDocument({
                claimId: result.id,
                userId: ctx.user.id,
                passengerId,
                type: doc.type as any,
                fileName: doc.fileName,
                fileKey,
                fileUrl: url,
                mimeType: doc.mimeType,
                fileSize: fileBuffer.length,
              });
            } catch (error) {
              console.error('Belge yüklenirken hata:', error);
            }
          }
        }
        
        // E-posta bildirimi gönder
        try {
          await sendClaimCreatedEmail({
            to: input.passengerEmail,
            passengerName: input.passengerName,
            claimNumber: result.claimNumber,
            flightNumber: input.flightNumber.toUpperCase(),
            flightDate: new Date(input.flightDate).toLocaleDateString('tr-TR'),
            departureAirport: input.departureAirport.toUpperCase(),
            arrivalAirport: input.arrivalAirport.toUpperCase(),
            compensationAmount: totalCompensation,
          });
        } catch (emailError) {
          console.error('Failed to send claim created email:', emailError);
          // E-posta gönderimi başarısız olsa bile talep oluşturma devam eder
        }
        
        return result;
      }),
    
    // Admin operations
    listAll: adminProcedure
      .input(z.object({
        status: z.string().optional(),
        airlineId: z.number().optional(),
        search: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional())
      .query(async ({ input }) => {
        const result = await db.getAllClaims({
          ...input,
          startDate: input?.startDate ? new Date(input.startDate) : undefined,
          endDate: input?.endDate ? new Date(input.endDate) : undefined,
        });
        // MySQL'de boolean değerler 0/1 olarak saklanır, JavaScript'te boolean'a dönüştür
        return {
          ...result,
          claims: result.claims.map(claim => ({
            ...claim,
            isConnecting: Boolean(claim.isConnecting),
          })),
        };
      }),
    
    getDetail: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const claim = await db.getClaimById(input.id);
        if (!claim) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Talep bulunamadı' });
        }
        const documents = await db.getClaimDocuments(input.id);
        const payments = await db.getClaimPayments(input.id);
        const passengers = await db.getClaimPassengers(input.id);
        const airline = claim.airlineId ? await db.getAirlineById(claim.airlineId) : null;
        const user = await db.getUserById(claim.userId);
        
        // İmza S3 URL'si ise, server-side'da base64'e dönüştür (CORS sorununu aşmak için)
        let signatureBase64: string | null = null;
        if (claim.consentSignature && claim.consentSignature.startsWith('http')) {
          try {
            const response = await fetch(claim.consentSignature);
            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const contentType = response.headers.get('content-type') || 'image/png';
              signatureBase64 = `data:${contentType};base64,${buffer.toString('base64')}`;
            }
          } catch (e) {
            console.error('İmza yüklenemedi:', e);
          }
        } else if (claim.consentSignature) {
          // Zaten base64 formatında
          signatureBase64 = claim.consentSignature;
        }
        
        return { 
          claim: { 
            ...claim, 
            isConnecting: Boolean(claim.isConnecting), // MySQL'de 0/1 olarak saklanır
            consentSignatureBase64: signatureBase64 
          }, 
          documents, payments, passengers, airline, user 
        };
      }),
    
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum([
          "draft", "submitted", "under_review", "documents_needed",
          "sent_to_airline", "airline_response", "legal_action",
          "approved", "payment_pending", "paid", "rejected", "closed"
        ]),
        note: z.string().optional(),
        internalNote: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const claim = await db.getClaimById(input.id);
        if (!claim) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Talep bulunamadı' });
        }
        
        await db.updateClaim(input.id, {
          status: input.status,
          publicNotes: input.note,
          internalNotes: input.internalNote,
          resolvedAt: ['paid', 'rejected', 'closed'].includes(input.status) ? new Date() : undefined,
        }, ctx.user.id);
        
        // Create notification for user
        await db.createNotification({
          userId: claim.userId,
          claimId: input.id,
          type: 'claim_status_update',
          title: 'Talep Durumu Güncellendi',
          message: `${claim.claimNumber} numaralı talebinizin durumu güncellendi: ${getStatusLabel(input.status)}`,
        });
        
        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          claimId: input.id,
          action: 'status_updated',
          details: { oldStatus: claim.status, newStatus: input.status, note: input.note },
        });
        
        // E-posta bildirimi gönder
        try {
          await sendStatusUpdateEmail({
            to: claim.passengerEmail,
            passengerName: claim.passengerName,
            claimNumber: claim.claimNumber,
            oldStatus: claim.status,
            newStatus: input.status,
            note: input.note,
          });
        } catch (emailError) {
          console.error('Failed to send status update email:', emailError);
        }
        
        return { success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        internalNotes: z.string().optional(),
        publicNotes: z.string().optional(),
        rejectionReason: z.string().optional(),
        commissionRate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        
        // Recalculate commission if rate changed
        if (data.commissionRate) {
          const claim = await db.getClaimById(id);
          if (claim && claim.compensationAmount) {
            const rate = parseFloat(data.commissionRate);
            const compensation = parseFloat(claim.compensationAmount);
            (data as any).commissionAmount = (compensation * rate / 100).toString();
            (data as any).netPayoutAmount = (compensation - compensation * rate / 100).toString();
          }
        }
        
        await db.updateClaim(id, data, ctx.user.id);
        
        await db.logActivity({
          userId: ctx.user.id,
          claimId: id,
          action: 'claim_updated',
          details: data,
        });
        
        return { success: true };
      }),
  }),

  // ============ DOCUMENTS ============
  documents: router({
    upload: protectedProcedure
      .input(z.object({
        claimId: z.number(),
        type: z.enum([
          "boarding_pass", "ticket", "id_document", "booking_confirmation",
          "delay_certificate", "expense_receipt", "correspondence", "other"
        ]),
        fileName: z.string(),
        fileData: z.string(), // base64
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify claim belongs to user
        const claim = await db.getClaimById(input.claimId);
        if (!claim || claim.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Talep bulunamadı' });
        }
        
        // Upload to S3
        const fileBuffer = Buffer.from(input.fileData, 'base64');
        const fileKey = `claims/${input.claimId}/${input.type}-${nanoid()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);
        
        // Create document record
        const docId = await db.createDocument({
          claimId: input.claimId,
          userId: ctx.user.id,
          type: input.type,
          fileName: input.fileName,
          fileKey,
          fileUrl: url,
          mimeType: input.mimeType,
          fileSize: fileBuffer.length,
        });
        
        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          claimId: input.claimId,
          action: 'document_uploaded',
          details: { documentId: docId, type: input.type, fileName: input.fileName },
        });
        
        return { id: docId, url };
      }),
    
    list: protectedProcedure
      .input(z.object({ claimId: z.number() }))
      .query(async ({ ctx, input }) => {
        const claim = await db.getClaimById(input.claimId);
        if (!claim) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Talep bulunamadı' });
        }
        // Allow user to see their own documents, admin can see all
        if (claim.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Bu belgelere erişim yetkiniz yok' });
        }
        return db.getClaimDocuments(input.claimId);
      }),
    
    verify: adminProcedure
      .input(z.object({
        id: z.number(),
        extractedData: z.object({
          flightNumber: z.string().optional(),
          passengerName: z.string().optional(),
          flightDate: z.string().optional(),
          departureAirport: z.string().optional(),
          arrivalAirport: z.string().optional(),
          bookingReference: z.string().optional(),
          seatNumber: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateDocument(input.id, {
          isVerified: true,
          verifiedBy: ctx.user.id,
          verifiedAt: new Date(),
          extractedData: input.extractedData,
        });
        
        const doc = await db.getDocumentById(input.id);
        if (doc) {
          await db.createNotification({
            userId: doc.userId,
            claimId: doc.claimId,
            type: 'document_verified',
            title: 'Belge Doğrulandı',
            message: `Yüklediğiniz ${getDocumentTypeLabel(doc.type)} belgesi doğrulandı.`,
          });
        }
        
        return { success: true };
      }),
    
    reject: adminProcedure
      .input(z.object({
        id: z.number(),
        reason: z.string().min(5, 'Red açıklaması en az 5 karakter olmalıdır'),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.rejectDocument(input.id, ctx.user.id, input.reason);
        
        const doc = await db.getDocumentById(input.id);
        if (doc) {
          await db.createNotification({
            userId: doc.userId,
            claimId: doc.claimId,
            type: 'document_needed',
            title: 'Belge Reddedildi',
            message: `Yüklediğiniz ${getDocumentTypeLabel(doc.type)} belgesi reddedildi. Sebep: ${input.reason}`,
          });
          
          await db.logActivity({
            userId: ctx.user.id,
            claimId: doc.claimId,
            action: 'document_rejected',
            details: { documentId: input.id, reason: input.reason },
          });
        }
        
        return { success: true };
      }),
    
    clearRejection: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.clearDocumentRejection(input.id);
        
        await db.logActivity({
          userId: ctx.user.id,
          action: 'document_rejection_cleared',
          details: { documentId: input.id },
        });
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const doc = await db.getDocumentById(input.id);
        if (!doc) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Belge bulunamadı' });
        }
        if (doc.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Bu belgeyi silme yetkiniz yok' });
        }
        
        await db.deleteDocument(input.id);
        return { success: true };
      }),
  }),

  // ============ PAYMENTS ============
  payments: router({
    create: adminProcedure
      .input(z.object({
        claimId: z.number(),
        type: z.enum(["compensation", "refund", "expense"]),
        amount: z.string(),
        currency: z.string().default("EUR"),
        paymentMethod: z.string().optional(),
        bankName: z.string().optional(),
        iban: z.string().optional(),
        accountHolder: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const claim = await db.getClaimById(input.claimId);
        if (!claim) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Talep bulunamadı' });
        }
        
        const paymentId = await db.createPayment({
          claimId: input.claimId,
          userId: claim.userId,
          type: input.type,
          amount: input.amount,
          currency: input.currency,
          paymentMethod: input.paymentMethod,
          bankName: input.bankName,
          iban: input.iban,
          accountHolder: input.accountHolder,
          notes: input.notes,
          status: 'pending',
        });
        
        await db.logActivity({
          userId: ctx.user.id,
          claimId: input.claimId,
          action: 'payment_created',
          details: { paymentId, amount: input.amount, type: input.type },
        });
        
        return { id: paymentId };
      }),
    
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "processing", "completed", "failed", "refunded"]),
        transactionId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updatePayment(input.id, {
          status: input.status,
          transactionId: input.transactionId,
          paidAt: input.status === 'completed' ? new Date() : undefined,
        });
        
        return { success: true };
      }),
  }),

  // ============ NOTIFICATIONS ============
  notifications: router({
    myList: protectedProcedure
      .input(z.object({ unreadOnly: z.boolean().default(false) }).optional())
      .query(async ({ ctx, input }) => {
        return db.getUserNotifications(ctx.user.id, input?.unreadOnly);
      }),
    
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationRead(input.id);
        return { success: true };
      }),
    
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
    
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      const notifications = await db.getUserNotifications(ctx.user.id, true);
      return { count: notifications.length };
    }),
  }),

  // ============ ADMIN ============
  admin: router({
    claims: router({
      list: adminProcedure
        .input(z.object({
          status: z.string().optional(),
          search: z.string().optional(),
          page: z.number().default(1),
          limit: z.number().default(20),
        }).optional())
        .query(async ({ input }) => {
          const offset = ((input?.page || 1) - 1) * (input?.limit || 20);
          const result = await db.getAllClaims({
            status: input?.status,
            search: input?.search,
            limit: input?.limit || 20,
            offset,
          });
          return result;
        }),
    }),
  }),

  // ============ BLOG ============
  blog: router({
    // Public: Yayınlanmış yazıları listele
    list: publicProcedure
      .input(z.object({
        limit: z.number().default(10),
        category: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const posts = await db.getPublishedBlogPosts(input?.limit || 10);
        return posts;
      }),
    
    // Public: Slug ile yazı getir
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await db.getBlogPostBySlug(input.slug);
        if (!post) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Yazı bulunamadı' });
        }
        // Görüntülenme sayısını artır
        await db.incrementBlogPostViewCount(post.id);
        return post;
      }),
    
    // Admin: Tüm yazıları listele
    adminList: adminProcedure
      .input(z.object({
        status: z.enum(['draft', 'published', 'archived']).optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional())
      .query(async ({ input }) => {
        const offset = ((input?.page || 1) - 1) * (input?.limit || 20);
        return db.getAllBlogPosts({
          status: input?.status,
          search: input?.search,
          limit: input?.limit || 20,
          offset,
        });
      }),
    
    // Admin: ID ile yazı getir
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const post = await db.getBlogPostById(input.id);
        if (!post) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Yazı bulunamadı' });
        }
        return post;
      }),
    
    // Admin: Yeni yazı oluştur
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        slug: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string().min(1),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        featuredImage: z.string().optional(),
        readingTime: z.number().optional(),
        status: z.enum(['draft', 'published', 'archived']).default('draft'),
      }))
      .mutation(async ({ ctx, input }) => {
        const slug = input.slug || db.generateSlug(input.title);
        
        // Slug benzersizliğini kontrol et
        const existing = await db.getBlogPostBySlug(slug);
        if (existing) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Bu URL zaten kullanılıyor' });
        }
        
        const id = await db.createBlogPost({
          ...input,
          slug,
          authorId: ctx.user.id,
          authorName: ctx.user.name || 'Admin',
          publishedAt: input.status === 'published' ? new Date() : null,
        });
        
        return { id, slug };
      }),
    
    // Admin: Yazı güncelle
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        slug: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        featuredImage: z.string().optional(),
        readingTime: z.number().optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        
        // Eğer slug değiştiyse benzersizliği kontrol et
        if (data.slug) {
          const existing = await db.getBlogPostBySlug(data.slug);
          if (existing && existing.id !== id) {
            throw new TRPCError({ code: 'CONFLICT', message: 'Bu URL zaten kullanılıyor' });
          }
        }
        
        // Eğer yayınlanıyorsa publishedAt'i ayarla
        const updateData: any = { ...data };
        if (data.status === 'published') {
          const post = await db.getBlogPostById(id);
          if (post && !post.publishedAt) {
            updateData.publishedAt = new Date();
          }
        }
        
        await db.updateBlogPost(id, updateData);
        return { success: true };
      }),
    
    // Admin: Yazı sil
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteBlogPost(input.id);
        return { success: true };
      }),
  }),

  // ============ STATISTICS (Admin) ============
  stats: router({
    overview: adminProcedure.query(async () => {
      return db.getClaimStatistics();
    }),
    
    byAirline: adminProcedure.query(async () => {
      const stats = await db.getAirlineStatistics();
      const airlines = await db.getAllAirlines();
      
      return stats.map(s => ({
        ...s,
        airline: airlines.find(a => a.id === s.airlineId),
      }));
    }),
  }),

  // ============ SUPPORT TICKETS ============
  tickets: router({
    // Kullanıcı: Kendi ticketlarını listele
    myList: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserTickets(ctx.user.id);
    }),
    
    // Kullanıcı: Ticket oluştur
    create: protectedProcedure
      .input(z.object({
        subject: z.string().min(5, 'Konu en az 5 karakter olmalı'),
        message: z.string().min(10, 'Mesaj en az 10 karakter olmalı'),
        category: z.enum(['general', 'claim', 'payment', 'technical', 'other']).default('general'),
        claimId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createSupportTicket({
          ...input,
          userId: ctx.user.id,
        });
        
        // Admin'e bildirim gönder
        try {
          const { notifyOwner } = await import('./_core/notification');
          await notifyOwner({
            title: 'Yeni Destek Talebi',
            content: `Yeni bir destek talebi oluşturuldu.\n\nKonu: ${input.subject}\nKategori: ${input.category}\n\nMesaj: ${input.message.substring(0, 200)}...`,
          });
        } catch (e) {
          console.error('Failed to notify owner:', e);
        }
        
        return { id };
      }),
    
    // Kullanıcı: Ticket detayı
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const ticket = await db.getTicketById(input.id);
        if (!ticket) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Destek talebi bulunamadı' });
        }
        // Sadece kendi ticket'ını görebilir (admin değilse)
        if (ticket.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Bu destek talebine erişim yetkiniz yok' });
        }
        return ticket;
      }),
    
    // Admin: Tüm ticketları listele
    adminList: adminProcedure
      .input(z.object({
        status: z.string().optional(),
        priority: z.string().optional(),
        category: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getAllTickets(input);
      }),
    
    // Admin: Ticket'a yanıt ver
    respond: adminProcedure
      .input(z.object({
        id: z.number(),
        response: z.string().min(1, 'Yanıt boş olamaz'),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.respondToTicket(input.id, input.response, ctx.user.id);
        
        // Kullanıcıya e-posta gönder
        const ticket = await db.getTicketById(input.id);
        if (ticket) {
          const user = await db.getUserById(ticket.userId);
          if (user?.email) {
            try {
              const { sendEmail } = await import('./email');
              await sendEmail({
                to: user.email,
                subject: `Destek Talebinize Yanıt: ${ticket.subject}`,
                html: `
                  <h2>Destek Talebinize Yanıt Verildi</h2>
                  <p><strong>Ticket No:</strong> ${ticket.ticketNumber}</p>
                  <p><strong>Konu:</strong> ${ticket.subject}</p>
                  <hr/>
                  <h3>Yanıt:</h3>
                  <p>${input.response}</p>
                  <hr/>
                  <p>Panelimizden detayları görüntüleyebilirsiniz.</p>
                `,
              });
            } catch (e) {
              console.error('Failed to send email:', e);
            }
          }
        }
        
        return { success: true };
      }),
    
    // Admin: Ticket durumunu güncelle
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['open', 'in_progress', 'waiting_response', 'resolved', 'closed']),
      }))
      .mutation(async ({ input }) => {
        await db.updateTicket(input.id, { 
          status: input.status,
          resolvedAt: input.status === 'resolved' || input.status === 'closed' ? new Date() : undefined,
        });
        return { success: true };
      }),
  }),

  // ============ USERS (Admin) ============
  users: router({
    // Admin: Kullanıcı listesi
    list: adminProcedure
      .input(z.object({
        search: z.string().optional(),
        role: z.enum(['user', 'admin']).optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional())
      .query(async ({ input }) => {
        const offset = ((input?.page || 1) - 1) * (input?.limit || 20);
        const result = await db.getAllUsers({
          search: input?.search,
          role: input?.role,
          limit: input?.limit || 20,
          offset,
        });
        return result;
      }),
    
    // Admin: Kullanıcı istatistikleri
    stats: adminProcedure.query(async () => {
      return db.getUserStats();
    }),
    
    // Admin: Tek kullanıcı getir
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const user = await db.getUserById(input.id);
        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Kullanıcı bulunamadı' });
        }
        
        // Kullanıcının taleplerini de getir
        const userClaims = await db.getUserClaims(user.id);
        
        return {
          ...user,
          claims: userClaims,
          claimCount: userClaims.length,
        };
      }),
    
    // Admin: Kullanıcı güncelle
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        role: z.enum(['user', 'admin']).optional(),
        emailVerified: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        
        // Kendi rolünü düşüremez
        if (id === ctx.user.id && data.role && data.role !== ctx.user.role) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Kendi rolünüzü değiştiremezsiniz' });
        }
        
        // E-posta değiştiyse benzersizliği kontrol et
        if (data.email) {
          const existing = await db.getUserByEmail(data.email);
          if (existing && existing.id !== id) {
            throw new TRPCError({ code: 'CONFLICT', message: 'Bu e-posta adresi zaten kullanılıyor' });
          }
        }
        
        await db.updateUser(id, data);
        return { success: true };
      }),
    
    // Admin: Kullanıcı sil
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Kendini silemez
        if (input.id === ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Kendinizi silemezsiniz' });
        }
        
        try {
          await db.deleteUser(input.id);
          return { success: true };
        } catch (error: any) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
        }
      }),
    
    // Admin: Kullanıcı rolünü değiştir
    updateRole: adminProcedure
      .input(z.object({
        id: z.number(),
        role: z.enum(['user', 'admin']),
      }))
      .mutation(async ({ ctx, input }) => {
        // Kendi rolünü değiştiremez
        if (input.id === ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Kendi rolünüzü değiştiremezsiniz' });
        }
        
        await db.updateUserRole(input.id, input.role);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

// Helper functions
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Taslak',
    submitted: 'Gönderildi',
    under_review: 'İnceleniyor',
    documents_needed: 'Belge Bekleniyor',
    sent_to_airline: 'Havayoluna Gönderildi',
    airline_response: 'Havayolu Yanıtı',
    legal_action: 'Hukuki Süreç',
    approved: 'Onaylandı',
    payment_pending: 'Ödeme Bekleniyor',
    paid: 'Ödendi',
    rejected: 'Reddedildi',
    closed: 'Kapatıldı',
  };
  return labels[status] || status;
}

function getDocumentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    boarding_pass: 'Biniş Kartı',
    ticket: 'Bilet',
    id_document: 'Kimlik Belgesi',
    booking_confirmation: 'Rezervasyon Onayı',
    delay_certificate: 'Gecikme Belgesi',
    expense_receipt: 'Masraf Makbuzu',
    correspondence: 'Yazışma',
    other: 'Diğer',
  };
  return labels[type] || type;
}
