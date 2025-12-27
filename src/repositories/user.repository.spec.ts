import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserRepository } from "./user.repository";
import { User } from "../models/user";
import { CreateUserDto } from "../dtos/user.dto";

vi.mock("../models/user");

describe("UserRepository", () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("deve criar um novo usuário", async () => {
      const userData: CreateUserDto = {
        email: "test@test.com",
        password: "hashedPassword123",
      };

      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        ...userData,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: vi.fn().mockResolvedValue({
          _id: "507f1f77bcf86cd799439011",
          ...userData,
          deletedAt: null,
        }),
      };

      vi.mocked(User).mockImplementation(() => mockUser as any);

      await userRepository.create(userData);

      expect(User).toHaveBeenCalledWith({
        ...userData,
        deletedAt: null,
      });
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe("getByEmail", () => {
    it("deve buscar usuário por email", async () => {
      const email = "test@test.com";
      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        email,
        password: "hashedPassword",
      };

      const mockSelect = vi.fn().mockResolvedValue(mockUser);
      const mockFindOne = vi.fn().mockReturnValue({ select: mockSelect });
      User.findOne = mockFindOne;

      const result = await userRepository.getByEmail(email);

      expect(mockFindOne).toHaveBeenCalledWith({ email, deletedAt: null });
      expect(mockSelect).toHaveBeenCalledWith("+password");
      expect(result).toEqual(mockUser);
    });

    it("deve retornar null se usuário não existir", async () => {
      const mockSelect = vi.fn().mockResolvedValue(null);
      const mockFindOne = vi.fn().mockReturnValue({ select: mockSelect });
      User.findOne = mockFindOne;

      const result = await userRepository.getByEmail("nonexistent@test.com");

      expect(result).toBeNull();
    });
  });

  describe("getById", () => {
    it("deve buscar usuário por ID", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockUser = {
        _id: id,
        email: "test@test.com",
      };

      User.findById = vi.fn().mockResolvedValue(mockUser);

      const result = await userRepository.getById(id);

      expect(User.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockUser);
    });

    it("deve retornar null se usuário não existir", async () => {
      User.findById = vi.fn().mockResolvedValue(null);

      const result = await userRepository.getById("507f1f77bcf86cd799439011");

      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("deve retornar usuários paginados", async () => {
      const mockUsers = [
        { _id: "1", email: "user1@test.com" },
        { _id: "2", email: "user2@test.com" },
      ];

      const mockSort = vi.fn().mockResolvedValue(mockUsers);
      const mockLimit = vi.fn().mockReturnValue({ sort: mockSort });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFind = vi.fn().mockReturnValue({ skip: mockSkip });
      User.find = mockFind;
      User.countDocuments = vi.fn().mockResolvedValue(2);

      const result = await userRepository.findAll({ page: 1, limit: 10 });

      expect(mockFind).toHaveBeenCalledWith({ deletedAt: null });
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(User.countDocuments).toHaveBeenCalledWith({ deletedAt: null });
      expect(result.data).toEqual(mockUsers);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalItems).toBe(2);
    });

    it("deve calcular paginação corretamente", async () => {
      const mockSort = vi.fn().mockResolvedValue([]);
      const mockLimit = vi.fn().mockReturnValue({ sort: mockSort });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      User.find = vi.fn().mockReturnValue({ skip: mockSkip });
      User.countDocuments = vi.fn().mockResolvedValue(25);

      const result = await userRepository.findAll({ page: 2, limit: 10 });

      expect(result.pagination.currentPage).toBe(2);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });
  });

  describe("softDelete", () => {
    it("deve fazer soft delete do usuário", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockUser = {
        _id: id,
        email: "test@test.com",
        deletedAt: new Date(),
      };

      User.findByIdAndUpdate = vi.fn().mockResolvedValue(mockUser);

      const result = await userRepository.softDelete(id);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { deletedAt: expect.any(Date) },
        { new: true }
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe("existsByEmail", () => {
    it("deve retornar true se email existe", async () => {
      User.findOne = vi.fn().mockResolvedValue({ email: "test@test.com" });

      const result = await userRepository.existsByEmail("test@test.com");

      expect(result).toBe(true);
      expect(User.findOne).toHaveBeenCalledWith({
        email: "test@test.com",
        deletedAt: null,
      });
    });

    it("deve retornar false se email não existe", async () => {
      User.findOne = vi.fn().mockResolvedValue(null);

      const result = await userRepository.existsByEmail("nonexistent@test.com");

      expect(result).toBe(false);
    });
  });
});
