import { int, mysqlEnum, mysqlTable, text, mediumtext, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  phone: varchar("phone", { length: 20 }),
  passwordHash: varchar("passwordHash", { length: 255 }), // Özel üyelik sistemi için
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  emailVerified: boolean("emailVerified").default(false),
  // E-posta doğrulama alanları
  emailVerificationToken: varchar("emailVerificationToken", { length: 64 }),
  emailVerificationExpires: timestamp("emailVerificationExpires"),
  // Şifre sıfırlama alanları
  resetPasswordToken: varchar("resetPasswordToken", { length: 64 }),
  resetPasswordExpires: timestamp("resetPasswordExpires"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Airlines table - Havayolu şirketleri
 */
export const airlines = mysqlTable("airlines", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 3 }).notNull().unique(), // IATA kodu (THY, PC, XQ vb.)
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  contactAddress: text("contactAddress"),
  website: varchar("website", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Airline = typeof airlines.$inferSelect;
export type InsertAirline = typeof airlines.$inferInsert;

/**
 * Claims table - Tazminat talepleri
 */
export const claims = mysqlTable("claims", {
  id: int("id").autoincrement().primaryKey(),
  claimNumber: varchar("claimNumber", { length: 20 }).notNull().unique(), // UCT-2024-000001
  userId: int("userId").notNull(),
  
  // Uçuş bilgileri
  flightNumber: varchar("flightNumber", { length: 20 }).notNull(),
  flightDate: timestamp("flightDate").notNull(),
  airlineId: int("airlineId"),
  departureAirport: varchar("departureAirport", { length: 10 }).notNull(), // IATA kodu
  arrivalAirport: varchar("arrivalAirport", { length: 10 }).notNull(),
  
  // Aktarmalı uçuş bilgileri
  isConnecting: boolean("isConnecting").default(false), // Aktarmalı uçuş mu?
  connectionAirport: varchar("connectionAirport", { length: 10 }), // Aktarma havalimanı IATA kodu
  flight2Number: varchar("flight2Number", { length: 20 }), // 2. uçuş numarası
  flight2Date: timestamp("flight2Date"), // 2. uçuş tarihi
  
  // Gecikme/İptal bilgileri
  disruptionType: mysqlEnum("disruptionType", ["delay", "cancellation", "denied_boarding", "downgrade"]).notNull(),
  delayDuration: int("delayDuration"), // dakika cinsinden
  
  // Yolcu bilgileri
  passengerName: varchar("passengerName", { length: 255 }).notNull(),
  passengerEmail: varchar("passengerEmail", { length: 320 }).notNull(),
  passengerPhone: varchar("passengerPhone", { length: 50 }),
  passengerIdNumber: varchar("passengerIdNumber", { length: 20 }), // TC Kimlik No
  bookingReference: varchar("bookingReference", { length: 50 }),
  
  // Tazminat bilgileri
  flightDistance: int("flightDistance"), // km
  compensationAmount: decimal("compensationAmount", { precision: 10, scale: 2 }), // Euro
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("25.00"), // %
  commissionAmount: decimal("commissionAmount", { precision: 10, scale: 2 }),
  netPayoutAmount: decimal("netPayoutAmount", { precision: 10, scale: 2 }),
  
  // Durum
  status: mysqlEnum("status", [
    "draft",           // Taslak
    "submitted",       // Gönderildi
    "under_review",    // İnceleniyor
    "documents_needed", // Belge bekleniyor
    "sent_to_airline", // Havayoluna gönderildi
    "airline_response", // Havayolu yanıtı
    "legal_action",    // Hukuki süreç
    "approved",        // Onaylandı
    "payment_pending", // Ödeme bekleniyor
    "paid",            // Ödendi
    "rejected",        // Reddedildi
    "closed"           // Kapatıldı
  ]).default("draft").notNull(),
  
  statusHistory: json("statusHistory").$type<Array<{
    status: string;
    date: string;
    note?: string;
    updatedBy?: number;
  }>>(),
  
  // Vekaletname ve İmza
  consentSignature: mediumtext("consentSignature"), // Base64 imza görseli (mediumtext: 16MB)
  consentSignedAt: timestamp("consentSignedAt"),
  consentIpAddress: varchar("consentIpAddress", { length: 45 }),
  
  // İmza atıldığı andaki sözleşme metni (versiyonlama için)
  signedAgreementContent: mediumtext("signedAgreementContent"), // JSON formatında sözleşme verileri
  
  // Ödeme bilgileri
  passengerIban: varchar("passengerIban", { length: 34 }), // IBAN numarası
  passengerBankName: varchar("passengerBankName", { length: 100 }), // Banka adı
  
  // Notlar
  internalNotes: text("internalNotes"),
  publicNotes: text("publicNotes"),
  rejectionReason: text("rejectionReason"),
  
  // Tarihler
  submittedAt: timestamp("submittedAt"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Claim = typeof claims.$inferSelect;
export type InsertClaim = typeof claims.$inferInsert;

/**
 * Passengers table - Talep yolcuları (bir talepte birden fazla yolcu olabilir)
 */
export const passengers = mysqlTable("passengers", {
  id: int("id").autoincrement().primaryKey(),
  claimId: int("claimId").notNull(),
  
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  
  // Bu yolcu birincil başvuru sahibi mi?
  isPrimary: boolean("isPrimary").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Passenger = typeof passengers.$inferSelect;
export type InsertPassenger = typeof passengers.$inferInsert;

/**
 * Documents table - Yüklenen belgeler
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  claimId: int("claimId").notNull(),
  userId: int("userId").notNull(),
  passengerId: int("passengerId"), // Hangi yolcuya ait (null ise genel belge)
  
  type: mysqlEnum("type", [
    "boarding_pass",   // Biniş kartı
    "ticket",          // Bilet
    "id_document",     // Kimlik belgesi (eski tip - geriye uyumluluk)
    "id_card",         // TC Kimlik Kartı
    "passport",        // Pasaport
    "booking_confirmation", // Rezervasyon onayı
    "delay_certificate", // Gecikme belgesi
    "expense_receipt", // Masraf makbuzu
    "correspondence",  // Yazışmalar
    "other"            // Diğer
  ]).notNull(),
  
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // S3 key
  fileUrl: varchar("fileUrl", { length: 1000 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"), // bytes
  
  // OCR ile çıkarılan veriler
  extractedData: json("extractedData").$type<{
    flightNumber?: string;
    passengerName?: string;
    flightDate?: string;
    departureAirport?: string;
    arrivalAirport?: string;
    bookingReference?: string;
    seatNumber?: string;
  }>(),
  
  isVerified: boolean("isVerified").default(false),
  verifiedBy: int("verifiedBy"),
  verifiedAt: timestamp("verifiedAt"),
  
  // Red durumu
  isRejected: boolean("isRejected").default(false),
  rejectedBy: int("rejectedBy"),
  rejectedAt: timestamp("rejectedAt"),
  rejectionReason: text("rejectionReason"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Payments table - Ödemeler
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  claimId: int("claimId").notNull(),
  userId: int("userId").notNull(),
  
  type: mysqlEnum("type", ["compensation", "refund", "expense"]).notNull(),
  
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR").notNull(),
  
  status: mysqlEnum("status", [
    "pending",
    "processing",
    "completed",
    "failed",
    "refunded"
  ]).default("pending").notNull(),
  
  // Ödeme detayları
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  bankName: varchar("bankName", { length: 255 }),
  iban: varchar("iban", { length: 50 }),
  accountHolder: varchar("accountHolder", { length: 255 }),
  
  transactionId: varchar("transactionId", { length: 100 }),
  paidAt: timestamp("paidAt"),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Notifications table - Bildirimler
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  claimId: int("claimId"),
  
  type: mysqlEnum("type", [
    "claim_submitted",
    "claim_status_update",
    "document_needed",
    "document_verified",
    "payment_received",
    "payment_sent",
    "general"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  
  emailSent: boolean("emailSent").default(false),
  emailSentAt: timestamp("emailSentAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Activity logs - Admin aktivite logları
 */
export const activityLogs = mysqlTable("activityLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  claimId: int("claimId"),
  
  action: varchar("action", { length: 100 }).notNull(),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;


/**
 * Blog posts table - Blog yazıları
 */
export const blogPosts = mysqlTable("blogPosts", {
  id: int("id").autoincrement().primaryKey(),
  
  // URL slug (benzersiz)
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  
  // İçerik
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt"), // Kısa özet
  content: mediumtext("content").notNull(), // Markdown içerik
  
  // SEO
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: varchar("metaDescription", { length: 500 }),
  
  // Kategori ve etiketler
  category: varchar("category", { length: 100 }),
  tags: json("tags").$type<string[]>(),
  
  // Görsel
  featuredImage: varchar("featuredImage", { length: 1000 }),
  
  // Yazar
  authorId: int("authorId").notNull(),
  authorName: varchar("authorName", { length: 255 }),
  
  // Okuma süresi (dakika)
  readingTime: int("readingTime").default(5),
  
  // Durum
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  
  // İstatistikler
  viewCount: int("viewCount").default(0),
  
  // Tarihler
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;


/**
 * Support tickets table - Destek talepleri
 */
export const supportTickets = mysqlTable("supportTickets", {
  id: int("id").autoincrement().primaryKey(),
  
  // Ticket numarası
  ticketNumber: varchar("ticketNumber", { length: 20 }).notNull().unique(), // TKT-2026-000001
  
  // Kullanıcı bilgileri
  userId: int("userId").notNull(),
  claimId: int("claimId"), // İlgili talep (opsiyonel)
  
  // Ticket içeriği
  subject: varchar("subject", { length: 500 }).notNull(),
  message: text("message").notNull(),
  category: mysqlEnum("category", ["general", "claim", "payment", "technical", "other"]).default("general").notNull(),
  
  // Durum
  status: mysqlEnum("status", ["open", "in_progress", "waiting_response", "resolved", "closed"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  
  // Admin yanıtı
  adminResponse: text("adminResponse"),
  respondedBy: int("respondedBy"),
  respondedAt: timestamp("respondedAt"),
  
  // Tarihler
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;
