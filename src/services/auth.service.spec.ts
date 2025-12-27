import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthService } from "./auth.service";
import { UserRepository } from "../repositories/user.repository";
import { BcryptService } from "../utils/bcrypt";
import { JwtService } from "../utils/jwt";
import { UnauthorizedException } from "../exceptions";

vi.mock("../utils/bcrypt");
vi.mock("../utils/jwt");

describe("AuthService", () => {
  let authService: AuthService;
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = {
      getByEmail: vi.fn(),
    } as any;

    authService = new AuthService();
    (authService as any).userRepository = userRepository;
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("deve realizar login com credenciais válidas", async () => {
      const loginData = {
        email: "test@test.com",
        password: "password123",
      };

      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        email: loginData.email,
        password: "hashedPassword",
      };

      const mockToken = "jwt.token.here";

      vi.spyOn(userRepository, "getByEmail").mockResolvedValue(mockUser as any);
      vi.spyOn(BcryptService, "compare").mockResolvedValue(true);
      vi.spyOn(JwtService, "generate").mockReturnValue(mockToken);

      const result = await authService.login(loginData);

      expect(userRepository.getByEmail).toHaveBeenCalledWith(loginData.email);
      expect(BcryptService.compare).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password
      );
      expect(JwtService.generate).toHaveBeenCalledWith({
        sub: mockUser._id.toString(),
        email: mockUser.email,
      });
      expect(result.token).toBe(mockToken);
    });

    it("deve lançar UnauthorizedException se usuário não existe", async () => {
      const loginData = {
        email: "nonexistent@test.com",
        password: "password123",
      };

      vi.spyOn(userRepository, "getByEmail").mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(authService.login(loginData)).rejects.toThrow(
        "Credenciais inválidas"
      );
    });

    it("deve lançar UnauthorizedException se senha está incorreta", async () => {
      const loginData = {
        email: "test@test.com",
        password: "wrongpassword",
      };

      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        email: loginData.email,
        password: "hashedPassword",
      };

      vi.spyOn(userRepository, "getByEmail").mockResolvedValue(mockUser as any);
      vi.spyOn(BcryptService, "compare").mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(authService.login(loginData)).rejects.toThrow(
        "Credenciais inválidas"
      );
    });

    it("não deve chamar JwtService.generate se senha for inválida", async () => {
      const loginData = {
        email: "test@test.com",
        password: "wrongpassword",
      };

      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        email: loginData.email,
        password: "hashedPassword",
      };

      vi.spyOn(userRepository, "getByEmail").mockResolvedValue(mockUser as any);
      vi.spyOn(BcryptService, "compare").mockResolvedValue(false);
      const generateSpy = vi.spyOn(JwtService, "generate");

      try {
        await authService.login(loginData);
      } catch (error) {}

      expect(generateSpy).not.toHaveBeenCalled();
    });
  });
});
