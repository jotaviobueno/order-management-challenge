import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserService } from "./user.service";
import { UserRepository } from "../repositories/user.repository";
import { BcryptService } from "../utils/bcrypt";
import { JwtService } from "../utils/jwt";
import { MongoIdValidator } from "../utils/mongo-id.validator";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../exceptions";

vi.mock("../utils/bcrypt");
vi.mock("../utils/jwt");
vi.mock("../utils/mongo-id.validator");

describe("UserService", () => {
  let userService: UserService;
  let userRepository: UserRepository;
  let bcryptService: BcryptService;
  let jwtService: JwtService;

  beforeEach(() => {
    userRepository = {
      existsByEmail: vi.fn(),
      create: vi.fn(),
      getById: vi.fn(),
      findAll: vi.fn(),
      softDelete: vi.fn(),
    } as any;

    bcryptService = {
      hash: vi.fn(),
      compare: vi.fn(),
    } as any;

    jwtService = {
      generate: vi.fn(),
      verify: vi.fn(),
    } as any;

    userService = new UserService(userRepository, bcryptService, jwtService);
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("deve criar um novo usuário", async () => {
      const userData = {
        email: "test@test.com",
        password: "password123",
      };

      const hashedPassword = "hashedPassword123";
      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        email: userData.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = "jwt.token.here";

      vi.spyOn(userRepository, "existsByEmail").mockResolvedValue(false);
      vi.spyOn(bcryptService, "hash").mockResolvedValue(hashedPassword);
      vi.spyOn(userRepository, "create").mockResolvedValue(mockUser as any);
      vi.spyOn(jwtService, "generate").mockReturnValue(mockToken);

      const result = await userService.create(userData);

      expect(userRepository.existsByEmail).toHaveBeenCalledWith(userData.email);
      expect(bcryptService.hash).toHaveBeenCalledWith(userData.password);
      expect(userRepository.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword,
      });
      expect(jwtService.generate).toHaveBeenCalledWith({
        sub: mockUser._id.toString(),
        email: mockUser.email,
      });
      expect(result.token).toBe(mockToken);
      expect(result.user.email).toBe(userData.email);
      expect(result.user.id).toBe(mockUser._id.toString());
    });

    it("deve lançar ConflictException se email já existe", async () => {
      const userData = {
        email: "existing@test.com",
        password: "password123",
      };

      vi.spyOn(userRepository, "existsByEmail").mockResolvedValue(true);

      await expect(userService.create(userData)).rejects.toThrow(
        ConflictException
      );
      await expect(userService.create(userData)).rejects.toThrow(
        "Email já cadastrado"
      );
    });

    it("não deve chamar create se email já existe", async () => {
      const userData = {
        email: "existing@test.com",
        password: "password123",
      };

      vi.spyOn(userRepository, "existsByEmail").mockResolvedValue(true);
      const createSpy = vi.spyOn(userRepository, "create");

      try {
        await userService.create(userData);
      } catch (error) {}

      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("deve buscar usuário por ID válido", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockUser = {
        _id: id,
        email: "test@test.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(MongoIdValidator, "isValid").mockReturnValue(true);
      vi.spyOn(userRepository, "getById").mockResolvedValue(mockUser as any);

      const result = await userService.findById(id);

      expect(MongoIdValidator.isValid).toHaveBeenCalledWith(id);
      expect(userRepository.getById).toHaveBeenCalledWith(id);
      expect(result.id).toBe(id);
      expect(result.email).toBe(mockUser.email);
    });

    it("deve lançar BadRequestException se ID for inválido", async () => {
      const invalidId = "invalid-id";

      vi.spyOn(MongoIdValidator, "isValid").mockReturnValue(false);

      await expect(userService.findById(invalidId)).rejects.toThrow(
        BadRequestException
      );
      await expect(userService.findById(invalidId)).rejects.toThrow(
        "ID inválido"
      );
    });

    it("deve lançar NotFoundException se usuário não existe", async () => {
      const id = "507f1f77bcf86cd799439011";

      vi.spyOn(MongoIdValidator, "isValid").mockReturnValue(true);
      vi.spyOn(userRepository, "getById").mockResolvedValue(null);

      await expect(userService.findById(id)).rejects.toThrow(NotFoundException);
      await expect(userService.findById(id)).rejects.toThrow(
        "Usuário não encontrado"
      );
    });
  });

  describe("findAll", () => {
    it("deve retornar lista paginada de usuários", async () => {
      const mockUsers = [
        {
          _id: "1",
          email: "user1@test.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: "2",
          email: "user2@test.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResult = {
        data: mockUsers,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      vi.spyOn(userRepository, "findAll").mockResolvedValue(mockResult as any);

      const result = await userService.findAll({ page: 1, limit: 10 });

      expect(userRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result.data).toHaveLength(2);
      expect(result.pagination.totalItems).toBe(2);
    });

    it("deve retornar lista vazia se não houver usuários", async () => {
      const mockResult = {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      vi.spyOn(userRepository, "findAll").mockResolvedValue(mockResult as any);

      const result = await userService.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(0);
      expect(result.pagination.totalItems).toBe(0);
    });
  });

  describe("softDelete", () => {
    it("deve deletar usuário existente", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockUser = {
        _id: id,
        email: "test@test.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(MongoIdValidator, "isValid").mockReturnValue(true);
      vi.spyOn(userRepository, "getById").mockResolvedValue(mockUser as any);
      vi.spyOn(userRepository, "softDelete").mockResolvedValue(mockUser as any);

      await userService.softDelete(id);

      expect(userRepository.softDelete).toHaveBeenCalledWith(id);
    });

    it("deve lançar NotFoundException se usuário não existe", async () => {
      const id = "507f1f77bcf86cd799439011";

      vi.spyOn(MongoIdValidator, "isValid").mockReturnValue(true);
      vi.spyOn(userRepository, "getById").mockResolvedValue(null);

      await expect(userService.softDelete(id)).rejects.toThrow(
        NotFoundException
      );
    });

    it("deve lançar NotFoundException se soft delete falhar", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockUser = {
        _id: id,
        email: "test@test.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(MongoIdValidator, "isValid").mockReturnValue(true);
      vi.spyOn(userRepository, "getById").mockResolvedValue(mockUser as any);
      vi.spyOn(userRepository, "softDelete").mockResolvedValue(null);

      await expect(userService.softDelete(id)).rejects.toThrow(
        NotFoundException
      );
      await expect(userService.softDelete(id)).rejects.toThrow(
        "Usuário não encontrado"
      );
    });
  });
});
