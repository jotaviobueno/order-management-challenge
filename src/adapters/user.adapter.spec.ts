import { describe, it, expect, beforeEach } from "vitest";
import { UserAdapter } from "./user.adapter";
import { IUser } from "../types/user.types";

describe("UserAdapter", () => {
  let userAdapter: UserAdapter;

  beforeEach(() => {
    userAdapter = new UserAdapter();
  });

  describe("toResponse", () => {
    it("deve converter IUser para IUserResponse", () => {
      const mockUser = {
        _id: { toString: () => "user-id-123" },
        email: "test@example.com",
        password: "hashed-password",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
        deletedAt: null,
      } as any as IUser;

      const result = userAdapter.toResponse(mockUser);

      expect(result).toEqual({
        id: "user-id-123",
        email: "test@example.com",
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it("deve excluir o campo password da resposta", () => {
      const mockUser = {
        _id: { toString: () => "user-id-456" },
        email: "user@test.com",
        password: "secret-password",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-20"),
        deletedAt: null,
      } as any as IUser;

      const result = userAdapter.toResponse(mockUser);

      expect(result).not.toHaveProperty("password");
      expect(result).not.toHaveProperty("deletedAt");
    });

    it("deve converter _id para string no campo id", () => {
      const mockObjectId = {
        toString: () => "507f1f77bcf86cd799439011",
      };

      const mockUser = {
        _id: mockObjectId,
        email: "mongo@test.com",
        password: "password",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any as IUser;

      const result = userAdapter.toResponse(mockUser);

      expect(result.id).toBe("507f1f77bcf86cd799439011");
      expect(typeof result.id).toBe("string");
    });
  });

  describe("toResponseList", () => {
    it("deve converter array de IUser para array de IUserResponse", () => {
      const mockUsers = [
        {
          _id: { toString: () => "user-1" },
          email: "user1@test.com",
          password: "pass1",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
          deletedAt: null,
        },
        {
          _id: { toString: () => "user-2" },
          email: "user2@test.com",
          password: "pass2",
          createdAt: new Date("2024-02-01"),
          updatedAt: new Date("2024-02-02"),
          deletedAt: null,
        },
      ] as any as IUser[];

      const result = userAdapter.toResponseList(mockUsers);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "user-1",
        email: "user1@test.com",
        createdAt: mockUsers[0].createdAt,
        updatedAt: mockUsers[0].updatedAt,
      });
      expect(result[1]).toEqual({
        id: "user-2",
        email: "user2@test.com",
        createdAt: mockUsers[1].createdAt,
        updatedAt: mockUsers[1].updatedAt,
      });
    });

    it("deve retornar array vazio quando receber array vazio", () => {
      const result = userAdapter.toResponseList([]);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("deve processar corretamente array com um único usuário", () => {
      const mockUser = {
        _id: { toString: () => "single-user-id" },
        email: "single@test.com",
        password: "password",
        createdAt: new Date("2024-03-01"),
        updatedAt: new Date("2024-03-02"),
        deletedAt: null,
      } as any as IUser;

      const result = userAdapter.toResponseList([mockUser]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("single-user-id");
      expect(result[0].email).toBe("single@test.com");
    });

    it("não deve incluir password em nenhum item da lista", () => {
      const mockUsers = [
        {
          _id: { toString: () => "user-1" },
          email: "user1@test.com",
          password: "secret1",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          _id: { toString: () => "user-2" },
          email: "user2@test.com",
          password: "secret2",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ] as any as IUser[];

      const result = userAdapter.toResponseList(mockUsers);

      result.forEach((user) => {
        expect(user).not.toHaveProperty("password");
        expect(user).not.toHaveProperty("deletedAt");
      });
    });
  });
});
