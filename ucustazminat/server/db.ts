import { eq, desc, and, sql, like, or, gte, lte, gt, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, User,
  airlines, InsertAirline, Airline,
  claims, InsertClaim, Claim,
  documents, InsertDocument, Document,
  payments, InsertPayment, Payment,
  notifications, InsertNotification,
  activityLogs, InsertActivityLog,
  passengers, InsertPassenger, Passenger
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER FUNCTIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserWithPassword(data: {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Generate unique openId for local users
  const openId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  const result = await db.insert(users).values({
    openId,
    email: data.email.toLowerCase(),
    passwordHash: data.passwordHash,
    name: data.name,
    phone: data.phone || null,
    loginMethod: 'email',
    role: 'user',
    emailVerified: false,
    lastSignedIn: new Date(),
  });
  
  return getUserByEmail(data.email);
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

// Kullanıcı listesi - Admin için
export async function getAllUsers(options?: {
  search?: string;
  role?: 'user' | 'admin';
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { users: [], total: 0 };
  
  let query = db.select().from(users);
  let countQuery = db.select({ count: sql<number>`count(*)` }).from(users);
  
  const conditions = [];
  
  if (options?.search) {
    const searchTerm = `%${options.search}%`;
    conditions.push(
      or(
        like(users.name, searchTerm),
        like(users.email, searchTerm),
        like(users.phone, searchTerm)
      )
    );
  }
  
  if (options?.role) {
    conditions.push(eq(users.role, options.role));
  }
  
  if (conditions.length > 0) {
    const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions);
    query = query.where(whereCondition!) as typeof query;
    countQuery = countQuery.where(whereCondition!) as typeof countQuery;
  }
  
  const [countResult] = await countQuery;
  const total = countResult?.count || 0;
  
  const result = await query
    .orderBy(desc(users.createdAt))
    .limit(options?.limit || 50)
    .offset(options?.offset || 0);
  
  return { users: result, total };
}

// Kullanıcı rolünü güncelle
export async function updateUserRole(userId: number, role: 'user' | 'admin') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// Kullanıcı bilgilerini güncelle
export async function updateUser(userId: number, data: {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'user' | 'admin';
  emailVerified?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email.toLowerCase();
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.emailVerified !== undefined) updateData.emailVerified = data.emailVerified;
  
  if (Object.keys(updateData).length > 0) {
    await db.update(users).set(updateData).where(eq(users.id, userId));
  }
}

// Kullanıcı sil
export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Önce kullanıcının taleplerini kontrol et
  const userClaims = await db.select({ count: sql<number>`count(*)` })
    .from(claims)
    .where(eq(claims.userId, userId));
  
  if (userClaims[0]?.count > 0) {
    throw new Error("Bu kullanıcının aktif talepleri var. Önce talepleri silin veya başka bir kullanıcıya aktarın.");
  }
  
  await db.delete(users).where(eq(users.id, userId));
}

// Kullanıcı istatistikleri
export async function getUserStats() {
  const db = await getDb();
  if (!db) return { total: 0, admins: 0, users: 0, thisMonth: 0 };
  
  const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [adminResult] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, 'admin'));
  const [userResult] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, 'user'));
  
  // Bu ay kayıt olanlar
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const [thisMonthResult] = await db.select({ count: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.createdAt, startOfMonth));
  
  return {
    total: totalResult?.count || 0,
    admins: adminResult?.count || 0,
    users: userResult?.count || 0,
    thisMonth: thisMonthResult?.count || 0,
  };
}

// ============ AIRLINE FUNCTIONS ============

export async function getAllAirlines() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(airlines).orderBy(airlines.name);
}

export async function getActiveAirlines() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(airlines).where(eq(airlines.isActive, true)).orderBy(airlines.name);
}

export async function getAirlineByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(airlines).where(eq(airlines.code, code.toUpperCase())).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAirlineById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(airlines).where(eq(airlines.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAirline(data: InsertAirline) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(airlines).values(data);
  return result[0].insertId;
}

export async function updateAirline(id: number, data: Partial<InsertAirline>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(airlines).set(data).where(eq(airlines.id, id));
}

export async function deleteAirline(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(airlines).where(eq(airlines.id, id));
}

// ============ CLAIM FUNCTIONS ============

export async function generateClaimNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Retry mekanizması ile benzersiz numara üret
  for (let attempt = 0; attempt < 5; attempt++) {
    // En son claim numarasını bul ve bir sonrakini üret
    const result = await db.select({ claimNumber: claims.claimNumber })
      .from(claims)
      .where(like(claims.claimNumber, `UCT-${year}-%`))
      .orderBy(desc(claims.claimNumber))
      .limit(1);
    
    let nextNumber = 1;
    if (result.length > 0 && result[0].claimNumber) {
      const lastNumber = parseInt(result[0].claimNumber.split('-')[2], 10);
      nextNumber = lastNumber + 1;
    }
    
    // Benzersizlik için rastgele suffix ekle
    const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase();
    const claimNumber = `UCT-${year}-${nextNumber.toString().padStart(6, '0')}${attempt > 0 ? randomSuffix : ''}`;
    
    // Numaranın benzersiz olduğunu kontrol et
    const existing = await db.select({ id: claims.id })
      .from(claims)
      .where(eq(claims.claimNumber, claimNumber))
      .limit(1);
    
    if (existing.length === 0) {
      return claimNumber;
    }
    
    console.log(`[Database] Claim number ${claimNumber} already exists, retrying...`);
  }
  
  // Son çare: timestamp bazlı numara
  const timestamp = Date.now().toString(36).toUpperCase();
  return `UCT-${year}-${timestamp}`;
}

export async function createClaim(data: Omit<InsertClaim, 'claimNumber'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Tarihleri MySQL uyumlu formata çevir (YYYY-MM-DD HH:mm:ss)
  const formatDateForMySQL = (date: Date | string | null | undefined): string | null => {
    if (!date) return null;
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 19).replace('T', ' ');
  };
  
  try {
    const claimNumber = await generateClaimNumber();
    
    // Status history JSON olarak hazırla
    const statusHistory = JSON.stringify([{
      status: data.status || 'draft',
      date: new Date().toISOString(),
      note: 'Talep oluşturuldu'
    }]);
    
    // Tarihleri MySQL formatına çevir
    const flightDateFormatted = formatDateForMySQL(data.flightDate);
    const consentSignedAtFormatted = formatDateForMySQL(data.consentSignedAt);
    const submittedAtFormatted = formatDateForMySQL(data.submittedAt);
    
    console.log('[Database] Creating claim:', claimNumber);
    console.log('[Database] Dates:', { flightDateFormatted, consentSignedAtFormatted, submittedAtFormatted });
    
    // Aktarmalı uçuş tarihi formatı
    const flight2DateFormatted = formatDateForMySQL(data.flight2Date);
    
    // Raw SQL kullan - Drizzle ORM sorun çıkarıyor
    const result = await db.execute(sql`
      INSERT INTO claims (
        claimNumber, userId, flightNumber, flightDate, airlineId,
        departureAirport, arrivalAirport, 
        isConnecting, connectionAirport, flight2Number, flight2Date,
        disruptionType, delayDuration,
        passengerName, passengerEmail, passengerPhone, passengerIdNumber,
        bookingReference, passengerIban, passengerBankName,
        flightDistance, compensationAmount, commissionRate, commissionAmount,
        netPayoutAmount, status, statusHistory, consentSignature,
        consentSignedAt, consentIpAddress, submittedAt, signedAgreementContent
      ) VALUES (
        ${claimNumber}, ${data.userId}, ${data.flightNumber}, ${flightDateFormatted},
        ${data.airlineId || null}, ${data.departureAirport}, ${data.arrivalAirport},
        ${data.isConnecting || false}, ${data.connectionAirport || null}, 
        ${data.flight2Number || null}, ${flight2DateFormatted},
        ${data.disruptionType}, ${data.delayDuration || null}, ${data.passengerName},
        ${data.passengerEmail}, ${data.passengerPhone || null}, ${data.passengerIdNumber || null},
        ${data.bookingReference || null}, ${data.passengerIban || null}, ${data.passengerBankName || null},
        ${data.flightDistance || null}, ${data.compensationAmount || null},
        ${data.commissionRate || null}, ${data.commissionAmount || null},
        ${data.netPayoutAmount || null}, ${data.status || 'draft'}, ${statusHistory},
        ${data.consentSignature || null}, ${consentSignedAtFormatted},
        ${data.consentIpAddress || null}, ${submittedAtFormatted}, ${data.signedAgreementContent || null}
      )
    `);
    
    const insertId = (result as any)[0]?.insertId || (result as any).insertId;
    console.log('[Database] Claim created successfully:', claimNumber, 'ID:', insertId);
    return { id: insertId, claimNumber };
  } catch (error) {
    console.error('[Database] Failed to create claim:', error);
    throw error;
  }
}

export async function getClaimById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(claims).where(eq(claims.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getClaimByNumber(claimNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(claims).where(eq(claims.claimNumber, claimNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserClaims(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(claims).where(eq(claims.userId, userId)).orderBy(desc(claims.createdAt));
}

export async function getAllClaims(filters?: {
  status?: string;
  airlineId?: number;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { claims: [], total: 0 };
  
  const conditions = [];
  
  if (filters?.status) {
    conditions.push(eq(claims.status, filters.status as any));
  }
  if (filters?.airlineId) {
    conditions.push(eq(claims.airlineId, filters.airlineId));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(claims.claimNumber, `%${filters.search}%`),
        like(claims.passengerName, `%${filters.search}%`),
        like(claims.flightNumber, `%${filters.search}%`)
      )
    );
  }
  if (filters?.startDate) {
    conditions.push(gte(claims.createdAt, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(claims.createdAt, filters.endDate));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  const [claimsList, totalResult] = await Promise.all([
    db.select()
      .from(claims)
      .where(whereClause)
      .orderBy(desc(claims.createdAt))
      .limit(filters?.limit || 50)
      .offset(filters?.offset || 0),
    db.select({ count: count() }).from(claims).where(whereClause)
  ]);
  
  return { claims: claimsList, total: totalResult[0]?.count || 0 };
}

export async function updateClaim(id: number, data: Partial<InsertClaim>, updatedBy?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get current claim for status history
  const current = await getClaimById(id);
  if (!current) throw new Error("Claim not found");
  
  // If status is changing, update history
  if (data.status && data.status !== current.status) {
    const history = current.statusHistory || [];
    history.push({
      status: data.status,
      date: new Date().toISOString(),
      note: data.publicNotes || undefined,
      updatedBy
    });
    data.statusHistory = history;
  }
  
  await db.update(claims).set(data).where(eq(claims.id, id));
}

export async function updateClaimStatus(id: number, status: string, note?: string, updatedBy?: number) {
  return updateClaim(id, { status: status as any, publicNotes: note }, updatedBy);
}

// ============ DOCUMENT FUNCTIONS ============

export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(documents).values(data);
  return result[0].insertId;
}

export async function getClaimDocuments(claimId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.claimId, claimId)).orderBy(desc(documents.createdAt));
}

export async function getDocumentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDocument(id: number, data: Partial<InsertDocument>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(documents).set(data).where(eq(documents.id, id));
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(documents).where(eq(documents.id, id));
}

// ============ PAYMENT FUNCTIONS ============

export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(payments).values(data);
  return result[0].insertId;
}

export async function getClaimPayments(claimId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.claimId, claimId)).orderBy(desc(payments.createdAt));
}

export async function updatePayment(id: number, data: Partial<InsertPayment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(payments).set(data).where(eq(payments.id, id));
}

// ============ NOTIFICATION FUNCTIONS ============

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(data);
  return result[0].insertId;
}

export async function getUserNotifications(userId: number, unreadOnly = false) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(notifications.userId, userId)];
  if (unreadOnly) {
    conditions.push(eq(notifications.isRead, false));
  }
  
  return db.select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true, readAt: new Date() }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

// ============ ACTIVITY LOG FUNCTIONS ============

export async function logActivity(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(activityLogs).values(data);
  } catch (error) {
    console.error("[Database] Failed to log activity:", error);
  }
}

// ============ STATISTICS FUNCTIONS ============

export async function getClaimStatistics() {
  const db = await getDb();
  if (!db) return null;
  
  try {
    // Toplam talep sayısı
    const totalClaims = await db.select({ count: count() }).from(claims);
    
    // Durum dağılımı
    const statusCounts = await db.select({ 
      status: claims.status, 
      count: count() 
    }).from(claims).groupBy(claims.status);
    
    // Toplam tazminat (ödenen)
    const totalCompensation = await db.select({ 
      total: sql<string>`COALESCE(SUM(${claims.compensationAmount}), 0)` 
    }).from(claims).where(eq(claims.status, 'paid'));
    
    // Aylık istatistikler - basitleştirilmiş sorgu
    let monthlyStats: Array<{ month: string; count: number; compensation: string }> = [];
    try {
      const monthlyResult = await db.execute(
        sql`SELECT 
          DATE_FORMAT(createdAt, '%Y-%m') as month,
          COUNT(*) as count,
          COALESCE(SUM(compensationAmount), 0) as compensation
        FROM claims 
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
        ORDER BY month DESC
        LIMIT 12`
      );
      // mysql2 execute returns [rows, fields] tuple
      const rows = monthlyResult as unknown as [any[], any];
      monthlyStats = Array.isArray(rows[0]) ? rows[0] : [];
    } catch (monthlyError) {
      console.error('Monthly stats query failed:', monthlyError);
      // Aylık istatistikler başarısız olursa boş dizi dön
    }
    
    return {
      totalClaims: totalClaims[0]?.count || 0,
      statusBreakdown: statusCounts.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {} as Record<string, number>),
      totalCompensation: parseFloat(totalCompensation[0]?.total || '0'),
      monthlyStats: monthlyStats.map(m => ({
        month: m.month,
        count: Number(m.count),
        compensation: parseFloat(String(m.compensation) || '0')
      }))
    };
  } catch (error) {
    console.error('getClaimStatistics error:', error);
    return {
      totalClaims: 0,
      statusBreakdown: {},
      totalCompensation: 0,
      monthlyStats: []
    };
  }
}

export async function getAirlineStatistics() {
  const db = await getDb();
  if (!db) return [];
  
  const stats = await db.select({
    airlineId: claims.airlineId,
    totalClaims: count(),
    totalCompensation: sql<string>`COALESCE(SUM(${claims.compensationAmount}), 0)`,
    approvedClaims: sql<number>`SUM(CASE WHEN ${claims.status} = 'paid' THEN 1 ELSE 0 END)`,
    rejectedClaims: sql<number>`SUM(CASE WHEN ${claims.status} = 'rejected' THEN 1 ELSE 0 END)`
  }).from(claims).groupBy(claims.airlineId);
  
  return stats.map(s => ({
    airlineId: s.airlineId,
    totalClaims: s.totalClaims,
    totalCompensation: parseFloat(s.totalCompensation || '0'),
    approvedClaims: s.approvedClaims || 0,
    rejectedClaims: s.rejectedClaims || 0,
    successRate: s.totalClaims > 0 ? ((s.approvedClaims || 0) / s.totalClaims * 100).toFixed(1) : '0'
  }));
}

// ============ PASSENGER FUNCTIONS ============

export async function createPassenger(data: InsertPassenger): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(passengers).values(data);
  return result[0].insertId;
}

export async function createPassengers(passengersData: InsertPassenger[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (passengersData.length === 0) return;
  
  await db.insert(passengers).values(passengersData);
}

export async function getClaimPassengers(claimId: number): Promise<Passenger[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(passengers).where(eq(passengers.claimId, claimId)).orderBy(desc(passengers.isPrimary));
}

export async function updatePassenger(id: number, data: Partial<InsertPassenger>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(passengers).set(data).where(eq(passengers.id, id));
}

export async function deletePassenger(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(passengers).where(eq(passengers.id, id));
}

// ============ DOCUMENT REJECT FUNCTIONS ============

export async function rejectDocument(id: number, rejectedBy: number, reason: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(documents).set({
    isRejected: true,
    rejectedBy,
    rejectedAt: new Date(),
    rejectionReason: reason,
    isVerified: false, // Reddedilince doğrulama kalkar
    verifiedBy: null,
    verifiedAt: null,
  }).where(eq(documents.id, id));
}

export async function clearDocumentRejection(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(documents).set({
    isRejected: false,
    rejectedBy: null,
    rejectedAt: null,
    rejectionReason: null,
  }).where(eq(documents.id, id));
}


// ============ BLOG FUNCTIONS ============

import { blogPosts, InsertBlogPost, BlogPost } from "../drizzle/schema";

export async function getAllBlogPosts(filters?: {
  status?: 'draft' | 'published' | 'archived';
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { posts: [], total: 0 };
  
  const conditions = [];
  
  if (filters?.status) {
    conditions.push(eq(blogPosts.status, filters.status));
  }
  if (filters?.category) {
    conditions.push(eq(blogPosts.category, filters.category));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(blogPosts.title, `%${filters.search}%`),
        like(blogPosts.slug, `%${filters.search}%`)
      )
    );
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  // Total count
  const countResult = await db.select({ count: count() })
    .from(blogPosts)
    .where(whereClause);
  const total = countResult[0]?.count || 0;
  
  // Get posts
  let query = db.select().from(blogPosts);
  if (whereClause) {
    query = query.where(whereClause) as any;
  }
  
  const posts = await query
    .orderBy(desc(blogPosts.createdAt))
    .limit(filters?.limit || 50)
    .offset(filters?.offset || 0);
  
  return { posts, total };
}

export async function getPublishedBlogPosts(limit?: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(blogPosts)
    .where(eq(blogPosts.status, 'published'))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit || 50);
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getBlogPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createBlogPost(data: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(blogPosts).values(data);
  return result[0].insertId;
}

export async function updateBlogPost(id: number, data: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

export async function incrementBlogPostViewCount(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(blogPosts)
    .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
    .where(eq(blogPosts.id, id));
}

// Slug oluşturma yardımcı fonksiyonu
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}


// ============ SUPPORT TICKET FUNCTIONS ============

import { supportTickets, InsertSupportTicket, SupportTicket } from "../drizzle/schema";

// Ticket numarası oluşturma
export async function generateTicketNumber(): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const year = new Date().getFullYear();
  const prefix = `TKT-${year}-`;
  
  // En son ticket numarasını bul
  const lastTicket = await db.select({ ticketNumber: supportTickets.ticketNumber })
    .from(supportTickets)
    .where(sql`${supportTickets.ticketNumber} LIKE ${prefix + '%'}`)
    .orderBy(desc(supportTickets.id))
    .limit(1);
  
  let nextNumber = 1;
  if (lastTicket.length > 0) {
    const lastNum = parseInt(lastTicket[0].ticketNumber.split('-')[2], 10);
    nextNumber = lastNum + 1;
  }
  
  return `${prefix}${String(nextNumber).padStart(6, '0')}`;
}

export async function createSupportTicket(data: Omit<InsertSupportTicket, 'ticketNumber'>): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const ticketNumber = await generateTicketNumber();
  const result = await db.insert(supportTickets).values({
    ...data,
    ticketNumber,
  });
  
  return result[0].insertId;
}

export async function getUserTickets(userId: number): Promise<SupportTicket[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(supportTickets)
    .where(eq(supportTickets.userId, userId))
    .orderBy(desc(supportTickets.createdAt));
}

export async function getAllTickets(filters?: {
  status?: string;
  priority?: string;
  category?: string;
}): Promise<SupportTicket[]> {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(supportTickets);
  
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(supportTickets.status, filters.status as any));
  }
  if (filters?.priority) {
    conditions.push(eq(supportTickets.priority, filters.priority as any));
  }
  if (filters?.category) {
    conditions.push(eq(supportTickets.category, filters.category as any));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return query.orderBy(desc(supportTickets.createdAt));
}

export async function getTicketById(id: number): Promise<SupportTicket | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(supportTickets)
    .where(eq(supportTickets.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTicket(id: number, data: Partial<InsertSupportTicket>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(supportTickets).set(data).where(eq(supportTickets.id, id));
}

export async function respondToTicket(id: number, response: string, respondedBy: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(supportTickets).set({
    adminResponse: response,
    respondedBy,
    respondedAt: new Date(),
    status: 'waiting_response',
  }).where(eq(supportTickets.id, id));
}

export async function resolveTicket(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(supportTickets).set({
    status: 'resolved',
    resolvedAt: new Date(),
  }).where(eq(supportTickets.id, id));
}


// ==================== ŞİFRE SIFIRLAMA FONKSİYONLARI ====================

export async function setPasswordResetToken(email: string, token: string, expires: Date): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.update(users)
    .set({
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    })
    .where(eq(users.email, email));
  
  return (result as any).affectedRows > 0;
}

export async function getUserByResetToken(token: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(users)
    .where(
      and(
        eq(users.resetPasswordToken, token),
        gt(users.resetPasswordExpires, new Date())
      )
    )
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function resetPassword(token: string, newPasswordHash: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Önce token'ı doğrula
  const user = await getUserByResetToken(token);
  if (!user) return false;
  
  // Şifreyi güncelle ve token'ı temizle
  await db.update(users)
    .set({
      passwordHash: newPasswordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    })
    .where(eq(users.id, user.id));
  
  return true;
}

export async function clearPasswordResetToken(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users)
    .set({
      resetPasswordToken: null,
      resetPasswordExpires: null,
    })
    .where(eq(users.id, userId));
}


// ============ E-POSTA DOĞRULAMA FONKSİYONLARI ============

export async function setEmailVerificationToken(email: string, token: string, expires: Date): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users)
    .set({
      emailVerificationToken: token,
      emailVerificationExpires: expires,
    })
    .where(eq(users.email, email));
  
  return true;
}

export async function getUserByVerificationToken(token: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(users)
    .where(
      and(
        eq(users.emailVerificationToken, token),
        gt(users.emailVerificationExpires, new Date())
      )
    )
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function verifyUserEmail(token: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Önce token'ı doğrula
  const user = await getUserByVerificationToken(token);
  if (!user) return false;
  
  // E-postayı doğrula ve token'ı temizle
  await db.update(users)
    .set({
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    })
    .where(eq(users.id, user.id));
  
  return true;
}

export async function isEmailVerified(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select({ emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return result.length > 0 && result[0].emailVerified === true;
}
