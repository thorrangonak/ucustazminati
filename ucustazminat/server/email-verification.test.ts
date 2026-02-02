import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db module
vi.mock("./db", () => ({
  setEmailVerificationToken: vi.fn(),
  getUserByVerificationToken: vi.fn(),
  verifyUserEmail: vi.fn(),
  isEmailVerified: vi.fn(),
}));

// Mock email module
vi.mock("./email", () => ({
  sendEmailVerificationEmail: vi.fn().mockResolvedValue(true),
}));

import * as db from "./db";

describe("Email Verification Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("setEmailVerificationToken", () => {
    it("should set verification token for existing user", async () => {
      const mockSetToken = vi.mocked(db.setEmailVerificationToken);
      mockSetToken.mockResolvedValue(true);

      const result = await db.setEmailVerificationToken(
        "test@example.com",
        "test-token-123",
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      );

      expect(result).toBe(true);
      expect(mockSetToken).toHaveBeenCalledWith(
        "test@example.com",
        "test-token-123",
        expect.any(Date)
      );
    });
  });

  describe("getUserByVerificationToken", () => {
    it("should return user for valid token", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        emailVerified: false,
        emailVerificationToken: "valid-token",
        emailVerificationExpires: new Date(Date.now() + 60 * 60 * 1000),
      };

      const mockGetUser = vi.mocked(db.getUserByVerificationToken);
      mockGetUser.mockResolvedValue(mockUser as any);

      const result = await db.getUserByVerificationToken("valid-token");

      expect(result).toEqual(mockUser);
      expect(mockGetUser).toHaveBeenCalledWith("valid-token");
    });

    it("should return undefined for invalid token", async () => {
      const mockGetUser = vi.mocked(db.getUserByVerificationToken);
      mockGetUser.mockResolvedValue(undefined);

      const result = await db.getUserByVerificationToken("invalid-token");

      expect(result).toBeUndefined();
    });

    it("should return undefined for expired token", async () => {
      const mockGetUser = vi.mocked(db.getUserByVerificationToken);
      mockGetUser.mockResolvedValue(undefined);

      const result = await db.getUserByVerificationToken("expired-token");

      expect(result).toBeUndefined();
    });
  });

  describe("verifyUserEmail", () => {
    it("should verify email for valid token", async () => {
      const mockVerify = vi.mocked(db.verifyUserEmail);
      mockVerify.mockResolvedValue(true);

      const result = await db.verifyUserEmail("valid-token");

      expect(result).toBe(true);
      expect(mockVerify).toHaveBeenCalledWith("valid-token");
    });

    it("should return false for invalid token", async () => {
      const mockVerify = vi.mocked(db.verifyUserEmail);
      mockVerify.mockResolvedValue(false);

      const result = await db.verifyUserEmail("invalid-token");

      expect(result).toBe(false);
    });
  });

  describe("isEmailVerified", () => {
    it("should return true for verified user", async () => {
      const mockIsVerified = vi.mocked(db.isEmailVerified);
      mockIsVerified.mockResolvedValue(true);

      const result = await db.isEmailVerified(1);

      expect(result).toBe(true);
      expect(mockIsVerified).toHaveBeenCalledWith(1);
    });

    it("should return false for unverified user", async () => {
      const mockIsVerified = vi.mocked(db.isEmailVerified);
      mockIsVerified.mockResolvedValue(false);

      const result = await db.isEmailVerified(2);

      expect(result).toBe(false);
    });
  });
});

describe("Email Verification Workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should complete full verification workflow", async () => {
    // 1. Set verification token
    const mockSetToken = vi.mocked(db.setEmailVerificationToken);
    mockSetToken.mockResolvedValue(true);

    const tokenSet = await db.setEmailVerificationToken(
      "newuser@example.com",
      "verification-token-abc",
      new Date(Date.now() + 24 * 60 * 60 * 1000)
    );
    expect(tokenSet).toBe(true);

    // 2. User clicks verification link
    const mockGetUser = vi.mocked(db.getUserByVerificationToken);
    mockGetUser.mockResolvedValue({
      id: 5,
      email: "newuser@example.com",
      emailVerified: false,
      emailVerificationToken: "verification-token-abc",
    } as any);

    const user = await db.getUserByVerificationToken("verification-token-abc");
    expect(user).toBeDefined();
    expect(user?.email).toBe("newuser@example.com");

    // 3. Verify email
    const mockVerify = vi.mocked(db.verifyUserEmail);
    mockVerify.mockResolvedValue(true);

    const verified = await db.verifyUserEmail("verification-token-abc");
    expect(verified).toBe(true);

    // 4. Check verification status
    const mockIsVerified = vi.mocked(db.isEmailVerified);
    mockIsVerified.mockResolvedValue(true);

    const isVerified = await db.isEmailVerified(5);
    expect(isVerified).toBe(true);
  });

  it("should handle verification token expiry", async () => {
    const mockGetUser = vi.mocked(db.getUserByVerificationToken);
    mockGetUser.mockResolvedValue(undefined); // Expired token returns undefined

    const user = await db.getUserByVerificationToken("expired-token");
    expect(user).toBeUndefined();

    const mockVerify = vi.mocked(db.verifyUserEmail);
    mockVerify.mockResolvedValue(false);

    const verified = await db.verifyUserEmail("expired-token");
    expect(verified).toBe(false);
  });

  it("should allow resending verification email", async () => {
    // User requests new verification email
    const mockSetToken = vi.mocked(db.setEmailVerificationToken);
    mockSetToken.mockResolvedValue(true);

    // First token
    await db.setEmailVerificationToken(
      "user@example.com",
      "first-token",
      new Date(Date.now() + 24 * 60 * 60 * 1000)
    );

    // Resend with new token
    await db.setEmailVerificationToken(
      "user@example.com",
      "second-token",
      new Date(Date.now() + 24 * 60 * 60 * 1000)
    );

    expect(mockSetToken).toHaveBeenCalledTimes(2);
    expect(mockSetToken).toHaveBeenLastCalledWith(
      "user@example.com",
      "second-token",
      expect.any(Date)
    );
  });
});
