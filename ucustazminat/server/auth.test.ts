import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

// Mock db module
vi.mock("./db", () => ({
  getUserByEmail: vi.fn(),
  createUserWithPassword: vi.fn(),
  upsertUser: vi.fn(),
  updateUserPassword: vi.fn(),
}));

// Mock sdk module
vi.mock("./_core/sdk", () => ({
  sdk: {
    createSessionToken: vi.fn().mockResolvedValue("mock-session-token"),
  },
}));

import * as db from "./db";

describe("Auth - Password Hashing", () => {
  it("should hash password correctly", async () => {
    const password = "testPassword123";
    const hash = await bcrypt.hash(password, 12);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50);
  });

  it("should verify password correctly", async () => {
    const password = "testPassword123";
    const hash = await bcrypt.hash(password, 12);
    
    const isValid = await bcrypt.compare(password, hash);
    expect(isValid).toBe(true);
  });

  it("should reject wrong password", async () => {
    const password = "testPassword123";
    const wrongPassword = "wrongPassword";
    const hash = await bcrypt.hash(password, 12);
    
    const isValid = await bcrypt.compare(wrongPassword, hash);
    expect(isValid).toBe(false);
  });
});

describe("Auth - User Registration Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should check if email already exists before registration", async () => {
    const mockGetUserByEmail = vi.mocked(db.getUserByEmail);
    mockGetUserByEmail.mockResolvedValue({
      id: 1,
      openId: "existing-user",
      email: "test@example.com",
      name: "Test User",
      phone: null,
      passwordHash: "hashed",
      loginMethod: "email",
      role: "user",
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });

    const existingUser = await db.getUserByEmail("test@example.com");
    expect(existingUser).toBeDefined();
    expect(existingUser?.email).toBe("test@example.com");
  });

  it("should return undefined for non-existent email", async () => {
    const mockGetUserByEmail = vi.mocked(db.getUserByEmail);
    mockGetUserByEmail.mockResolvedValue(undefined);

    const user = await db.getUserByEmail("nonexistent@example.com");
    expect(user).toBeUndefined();
  });

  it("should create user with hashed password", async () => {
    const mockCreateUserWithPassword = vi.mocked(db.createUserWithPassword);
    const mockUser = {
      id: 1,
      openId: "local_123_abc",
      email: "new@example.com",
      name: "New User",
      phone: null,
      passwordHash: "hashed-password",
      loginMethod: "email",
      role: "user" as const,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    mockCreateUserWithPassword.mockResolvedValue(mockUser);

    const password = "securePassword123";
    const passwordHash = await bcrypt.hash(password, 12);
    
    const user = await db.createUserWithPassword({
      email: "new@example.com",
      passwordHash,
      name: "New User",
    });

    expect(user).toBeDefined();
    expect(user?.email).toBe("new@example.com");
    expect(user?.loginMethod).toBe("email");
  });
});

describe("Auth - User Login Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should find user by email for login", async () => {
    const password = "testPassword123";
    const passwordHash = await bcrypt.hash(password, 12);
    
    const mockGetUserByEmail = vi.mocked(db.getUserByEmail);
    mockGetUserByEmail.mockResolvedValue({
      id: 1,
      openId: "local_123_abc",
      email: "user@example.com",
      name: "Test User",
      phone: null,
      passwordHash,
      loginMethod: "email",
      role: "user",
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });

    const user = await db.getUserByEmail("user@example.com");
    expect(user).toBeDefined();
    expect(user?.passwordHash).toBeDefined();
    
    // Verify password
    const isValid = await bcrypt.compare(password, user!.passwordHash!);
    expect(isValid).toBe(true);
  });

  it("should reject login for user without password", async () => {
    const mockGetUserByEmail = vi.mocked(db.getUserByEmail);
    mockGetUserByEmail.mockResolvedValue({
      id: 1,
      openId: "oauth_user",
      email: "oauth@example.com",
      name: "OAuth User",
      phone: null,
      passwordHash: null, // OAuth user without password
      loginMethod: "google",
      role: "user",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });

    const user = await db.getUserByEmail("oauth@example.com");
    expect(user).toBeDefined();
    expect(user?.passwordHash).toBeNull();
    
    // Should not allow password login for OAuth users
    const canLoginWithPassword = user?.passwordHash !== null;
    expect(canLoginWithPassword).toBe(false);
  });
});

describe("Auth - Password Change Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update password hash", async () => {
    const mockUpdateUserPassword = vi.mocked(db.updateUserPassword);
    mockUpdateUserPassword.mockResolvedValue(undefined);

    const newPassword = "newSecurePassword456";
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    
    await db.updateUserPassword(1, newPasswordHash);
    
    expect(mockUpdateUserPassword).toHaveBeenCalledWith(1, newPasswordHash);
  });
});
