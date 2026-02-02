import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database functions
vi.mock("./db", () => ({
  getAllUsers: vi.fn(),
  getUserStats: vi.fn(),
  getUserById: vi.fn(),
  getUserByEmail: vi.fn(),
  getUserClaims: vi.fn(),
  updateUser: vi.fn(),
  updateUserRole: vi.fn(),
  deleteUser: vi.fn(),
}));

import * as db from "./db";

describe("Users Management API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllUsers", () => {
    it("should return paginated users list", async () => {
      const mockUsers = [
        { id: 1, name: "Test User 1", email: "test1@test.com", role: "user" },
        { id: 2, name: "Test User 2", email: "test2@test.com", role: "admin" },
      ];
      
      vi.mocked(db.getAllUsers).mockResolvedValue({
        users: mockUsers,
        total: 2,
      });

      const result = await db.getAllUsers({ limit: 20, offset: 0 });
      
      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(db.getAllUsers).toHaveBeenCalledWith({ limit: 20, offset: 0 });
    });

    it("should filter users by role", async () => {
      const mockAdmins = [
        { id: 2, name: "Admin User", email: "admin@test.com", role: "admin" },
      ];
      
      vi.mocked(db.getAllUsers).mockResolvedValue({
        users: mockAdmins,
        total: 1,
      });

      const result = await db.getAllUsers({ role: "admin", limit: 20, offset: 0 });
      
      expect(result.users).toHaveLength(1);
      expect(result.users[0].role).toBe("admin");
    });

    it("should search users by name or email", async () => {
      const mockUsers = [
        { id: 1, name: "John Doe", email: "john@test.com", role: "user" },
      ];
      
      vi.mocked(db.getAllUsers).mockResolvedValue({
        users: mockUsers,
        total: 1,
      });

      const result = await db.getAllUsers({ search: "john", limit: 20, offset: 0 });
      
      expect(result.users).toHaveLength(1);
      expect(result.users[0].name).toBe("John Doe");
    });
  });

  describe("getUserStats", () => {
    it("should return user statistics", async () => {
      const mockStats = {
        total: 100,
        admins: 5,
        users: 95,
        thisMonth: 10,
      };
      
      vi.mocked(db.getUserStats).mockResolvedValue(mockStats);

      const result = await db.getUserStats();
      
      expect(result.total).toBe(100);
      expect(result.admins).toBe(5);
      expect(result.users).toBe(95);
      expect(result.thisMonth).toBe(10);
    });
  });

  describe("getUserById", () => {
    it("should return user with claims", async () => {
      const mockUser = {
        id: 1,
        name: "Test User",
        email: "test@test.com",
        role: "user",
        createdAt: new Date(),
        lastSignedIn: new Date(),
      };
      
      const mockClaims = [
        { id: 1, claimNumber: "UCT-2026-000001", status: "submitted" },
      ];
      
      vi.mocked(db.getUserById).mockResolvedValue(mockUser as any);
      vi.mocked(db.getUserClaims).mockResolvedValue(mockClaims as any);

      const user = await db.getUserById(1);
      const claims = await db.getUserClaims(1);
      
      expect(user).toBeDefined();
      expect(user?.name).toBe("Test User");
      expect(claims).toHaveLength(1);
    });

    it("should return undefined for non-existent user", async () => {
      vi.mocked(db.getUserById).mockResolvedValue(undefined);

      const result = await db.getUserById(999);
      
      expect(result).toBeUndefined();
    });
  });

  describe("updateUser", () => {
    it("should update user information", async () => {
      vi.mocked(db.updateUser).mockResolvedValue(undefined);

      await db.updateUser(1, {
        name: "Updated Name",
        email: "updated@test.com",
        phone: "1234567890",
      });
      
      expect(db.updateUser).toHaveBeenCalledWith(1, {
        name: "Updated Name",
        email: "updated@test.com",
        phone: "1234567890",
      });
    });
  });

  describe("updateUserRole", () => {
    it("should update user role to admin", async () => {
      vi.mocked(db.updateUserRole).mockResolvedValue(undefined);

      await db.updateUserRole(1, "admin");
      
      expect(db.updateUserRole).toHaveBeenCalledWith(1, "admin");
    });

    it("should update user role to user", async () => {
      vi.mocked(db.updateUserRole).mockResolvedValue(undefined);

      await db.updateUserRole(1, "user");
      
      expect(db.updateUserRole).toHaveBeenCalledWith(1, "user");
    });
  });

  describe("deleteUser", () => {
    it("should delete user without claims", async () => {
      vi.mocked(db.deleteUser).mockResolvedValue(undefined);

      await db.deleteUser(1);
      
      expect(db.deleteUser).toHaveBeenCalledWith(1);
    });

    it("should throw error when deleting user with claims", async () => {
      vi.mocked(db.deleteUser).mockRejectedValue(
        new Error("Bu kullanıcının aktif talepleri var. Önce talepleri silin veya başka bir kullanıcıya aktarın.")
      );

      await expect(db.deleteUser(1)).rejects.toThrow(
        "Bu kullanıcının aktif talepleri var"
      );
    });
  });
});
