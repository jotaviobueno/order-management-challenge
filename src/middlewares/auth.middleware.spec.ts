import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { Request, Response } from "express";
import { AuthMiddleware } from "./auth.middleware";
import { AlsService } from "../utils/async-context";
import { UnauthorizedException } from "../exceptions";

vi.mock("../utils/jwt");
vi.mock("../utils/async-context");

describe("AuthMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: Mock;
  let mockJwtService: any;
  let authMiddleware: AuthMiddleware;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    mockNext = vi.fn();

    mockJwtService = {
      verify: vi.fn(),
      generate: vi.fn(),
    };

    authMiddleware = new AuthMiddleware(mockJwtService);
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("deve autenticar com token válido", async () => {
      const mockToken = "valid.jwt.token";
      const mockDecoded = {
        sub: "user-id-123",
        email: "test@test.com",
      };

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      mockJwtService.verify.mockReturnValue(mockDecoded);
      vi.spyOn(AlsService, "set");
      vi.spyOn(AlsService, "has").mockReturnValue(false);

      await authMiddleware.execute(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwtService.verify).toHaveBeenCalledWith(mockToken);
      expect(AlsService.set).toHaveBeenCalledWith("userId", mockDecoded.sub);
      expect(AlsService.set).toHaveBeenCalledWith("email", mockDecoded.email);
      expect(AlsService.set).toHaveBeenCalledWith("accessToken", mockToken);
      expect((mockRequest as any).user).toEqual(mockDecoded);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("deve lançar UnauthorizedException se authorization header não existir", async () => {
      mockRequest.headers = {};

      await authMiddleware.execute(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as any).mock.calls[0][0];
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toBe("Token não fornecido");
    });

    it("deve lançar UnauthorizedException se authorization header não começar com Bearer", async () => {
      mockRequest.headers = {
        authorization: "InvalidFormat token",
      };

      await authMiddleware.execute(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as any).mock.calls[0][0];
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toBe("Token não fornecido");
    });

    it("deve lançar UnauthorizedException se token for inválido", async () => {
      mockRequest.headers = {
        authorization: "Bearer invalid.token",
      };

      mockJwtService.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await authMiddleware.execute(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as any).mock.calls[0][0];
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toBe("Token inválido ou expirado");
    });

    it("deve lançar UnauthorizedException se token estiver expirado", async () => {
      mockRequest.headers = {
        authorization: "Bearer expired.token",
      };

      mockJwtService.verify.mockImplementation(() => {
        const error: any = new Error("jwt expired");
        error.name = "TokenExpiredError";
        throw error;
      });

      await authMiddleware.execute(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as any).mock.calls[0][0];
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toBe("Token inválido ou expirado");
    });

    it("não deve sobrescrever accessToken se já existir no ALS", async () => {
      const mockToken = "valid.jwt.token";
      const mockDecoded = {
        sub: "user-id-123",
        email: "test@test.com",
      };

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      mockJwtService.verify.mockReturnValue(mockDecoded);
      vi.spyOn(AlsService, "set");
      vi.spyOn(AlsService, "has").mockReturnValue(true);

      await authMiddleware.execute(mockRequest as Request, mockResponse as Response, mockNext);

      expect(AlsService.has).toHaveBeenCalledWith("accessToken");
      expect(AlsService.set).toHaveBeenCalledTimes(2);
      expect(AlsService.set).not.toHaveBeenCalledWith("accessToken", mockToken);
    });

    it("deve extrair token corretamente do Bearer header", async () => {
      const mockToken = "my.jwt.token.here";
      const mockDecoded = {
        sub: "user-id",
        email: "user@test.com",
      };

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      mockJwtService.verify.mockReturnValue(mockDecoded);
      const verifySpy = mockJwtService.verify;
      vi.spyOn(AlsService, "set");
      vi.spyOn(AlsService, "has").mockReturnValue(false);

      await authMiddleware.execute(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwtService.verify).toHaveBeenCalledWith(mockToken);
    });
  });
});
