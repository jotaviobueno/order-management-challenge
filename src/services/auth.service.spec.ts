import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthService } from "./auth.service";
import { BcryptService } from "../utils/bcrypt";
import { JwtService } from "../utils/jwt";
import { HttpException } from "../exceptions";
import { UserAdapter } from "../adapters";
import { UserService } from "./user.service";

vi.mock("../utils/bcrypt");
vi.mock("../utils/jwt");

describe("AuthService", () => {
  let authService: AuthService;
  let userService: UserService;
  let bcryptService: BcryptService;
  let jwtService: JwtService;

  beforeEach(() => {
    userService = {
      findByEmail: vi.fn(),
    } as any;

    bcryptService = {
      hash: vi.fn(),
      compare: vi.fn(),
    } as any;

    jwtService = {
      generate: vi.fn(),
      verify: vi.fn(),
    } as any;

    const userAdapter = new UserAdapter();

    authService = new AuthService(userService, bcryptService, jwtService, userAdapter);
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

      vi.spyOn(userService, "findByEmail").mockResolvedValue(mockUser as any);
      vi.spyOn(bcryptService, "compare").mockResolvedValue(true);
      vi.spyOn(jwtService, "generate").mockReturnValue(mockToken);

      const result = await authService.login(loginData);

      expect(userService.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(bcryptService.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(jwtService.generate).toHaveBeenCalledWith({
        sub: mockUser._id.toString(),
        email: mockUser.email,
      });
      expect(result.token).toBe(mockToken);
      expect(result.user.id).toBe(mockUser._id.toString());
      expect(result.user.email).toBe(mockUser.email);
    });

    it("deve lançar HttpException se senha está incorreta", async () => {
      const loginData = {
        email: "test@test.com",
        password: "wrongpassword",
      };

      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        email: loginData.email,
        password: "hashedPassword",
      };

      vi.spyOn(userService, "findByEmail").mockResolvedValue(mockUser as any);
      vi.spyOn(bcryptService, "compare").mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow(HttpException);
      await expect(authService.login(loginData)).rejects.toThrow("Credenciais inválidas");
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

      vi.spyOn(userService, "findByEmail").mockResolvedValue(mockUser as any);
      vi.spyOn(bcryptService, "compare").mockResolvedValue(false);
      const generateSpy = vi.spyOn(jwtService, "generate");

      try {
        await authService.login(loginData);
      } catch (error) {}

      expect(generateSpy).not.toHaveBeenCalled();
    });
  });
});
