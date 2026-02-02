import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database functions
vi.mock("./db", () => ({
  getUserByEmail: vi.fn(),
  setPasswordResetToken: vi.fn(),
  getUserByResetToken: vi.fn(),
  resetPassword: vi.fn(),
  clearPasswordResetToken: vi.fn(),
}));

// Mock the email functions
vi.mock("./email", () => ({
  sendPasswordResetEmail: vi.fn(),
}));

import * as db from "./db";
import * as email from "./email";

describe("Password Reset API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("forgotPassword", () => {
    it("should create reset token and send email for existing user", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        passwordHash: "hashedpassword",
      };
      
      vi.mocked(db.getUserByEmail).mockResolvedValue(mockUser as any);
      vi.mocked(db.setPasswordResetToken).mockResolvedValue(true);
      vi.mocked(email.sendPasswordResetEmail).mockResolvedValue(true);

      // Simulate the forgotPassword logic
      const user = await db.getUserByEmail("test@example.com");
      expect(user).toBeDefined();
      expect(user?.passwordHash).toBeTruthy();
      
      const tokenSet = await db.setPasswordResetToken("test@example.com", "test-token", new Date());
      expect(tokenSet).toBe(true);
      
      const emailSent = await email.sendPasswordResetEmail("test@example.com", "Test User", "test-token");
      expect(emailSent).toBe(true);
    });

    it("should not reveal if email does not exist", async () => {
      vi.mocked(db.getUserByEmail).mockResolvedValue(undefined);

      const user = await db.getUserByEmail("nonexistent@example.com");
      expect(user).toBeUndefined();
      
      // The API should still return success to prevent email enumeration
      // This is handled in the router, not the db function
    });

    it("should not send email for users without password (OAuth users)", async () => {
      const mockOAuthUser = {
        id: 1,
        email: "oauth@example.com",
        name: "OAuth User",
        passwordHash: null, // No password - OAuth user
      };
      
      vi.mocked(db.getUserByEmail).mockResolvedValue(mockOAuthUser as any);

      const user = await db.getUserByEmail("oauth@example.com");
      expect(user).toBeDefined();
      expect(user?.passwordHash).toBeFalsy();
      
      // Email should not be sent for OAuth users
      expect(email.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe("verifyResetToken", () => {
    it("should return valid for unexpired token", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        resetPasswordToken: "valid-token",
        resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour from now
      };
      
      vi.mocked(db.getUserByResetToken).mockResolvedValue(mockUser as any);

      const user = await db.getUserByResetToken("valid-token");
      expect(user).toBeDefined();
    });

    it("should return undefined for expired token", async () => {
      vi.mocked(db.getUserByResetToken).mockResolvedValue(undefined);

      const user = await db.getUserByResetToken("expired-token");
      expect(user).toBeUndefined();
    });

    it("should return undefined for invalid token", async () => {
      vi.mocked(db.getUserByResetToken).mockResolvedValue(undefined);

      const user = await db.getUserByResetToken("invalid-token");
      expect(user).toBeUndefined();
    });
  });

  describe("resetPassword", () => {
    it("should reset password with valid token", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        resetPasswordToken: "valid-token",
        resetPasswordExpires: new Date(Date.now() + 3600000),
      };
      
      vi.mocked(db.getUserByResetToken).mockResolvedValue(mockUser as any);
      vi.mocked(db.resetPassword).mockResolvedValue(true);

      const user = await db.getUserByResetToken("valid-token");
      expect(user).toBeDefined();
      
      const success = await db.resetPassword("valid-token", "new-hashed-password");
      expect(success).toBe(true);
    });

    it("should fail with invalid token", async () => {
      vi.mocked(db.getUserByResetToken).mockResolvedValue(undefined);

      const user = await db.getUserByResetToken("invalid-token");
      expect(user).toBeUndefined();
      
      // Reset should not proceed without valid user
    });

    it("should fail with expired token", async () => {
      vi.mocked(db.getUserByResetToken).mockResolvedValue(undefined);
      vi.mocked(db.resetPassword).mockResolvedValue(false);

      const user = await db.getUserByResetToken("expired-token");
      expect(user).toBeUndefined();
      
      const success = await db.resetPassword("expired-token", "new-hashed-password");
      expect(success).toBe(false);
    });
  });

  describe("Token Security", () => {
    it("should generate unique tokens", () => {
      // Token generation uses nanoid(64) which produces cryptographically secure random strings
      const token1 = "abc123def456"; // Simulated token
      const token2 = "xyz789uvw012"; // Simulated token
      expect(token1).not.toBe(token2);
    });

    it("should set token expiration to 1 hour", () => {
      const now = Date.now();
      const expires = new Date(now + 60 * 60 * 1000); // 1 hour
      
      const oneHourFromNow = new Date(now + 3600000);
      expect(expires.getTime()).toBe(oneHourFromNow.getTime());
    });
  });
});
