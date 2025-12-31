import { describe, it, expect } from "vitest";
import { HttpException } from "./http.exception";
import { HttpStatus } from "./http-status.enum";

describe("HttpException", () => {
  describe("base HttpException", () => {
    it("deve criar exceção com mensagem e status code", () => {
      const exception = new HttpException("Test error", HttpStatus.BAD_REQUEST);

      expect(exception.message).toBe("Test error");
      expect(exception.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.details).toBeUndefined();
    });

    it("deve criar exceção com details opcionais", () => {
      const details = { field: "email", error: "invalid" };
      const exception = new HttpException("Validation error", HttpStatus.BAD_REQUEST, details);

      expect(exception.details).toEqual(details);
    });

    it("deve herdar de Error", () => {
      const exception = new HttpException("Test", HttpStatus.BAD_REQUEST);

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(HttpException);
    });

    it("deve ter stack trace", () => {
      const exception = new HttpException("Test", HttpStatus.BAD_REQUEST);

      expect(exception.stack).toBeDefined();
    });
  });

  describe("diferentes status codes", () => {
    it("deve criar exceção com status 400 (BAD_REQUEST)", () => {
      const exception = new HttpException("Invalid input", HttpStatus.BAD_REQUEST);

      expect(exception.message).toBe("Invalid input");
      expect(exception.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(exception).toBeInstanceOf(HttpException);
    });

    it("deve criar exceção com status 401 (UNAUTHORIZED)", () => {
      const exception = new HttpException("Not authenticated", HttpStatus.UNAUTHORIZED);

      expect(exception.message).toBe("Not authenticated");
      expect(exception.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(exception).toBeInstanceOf(HttpException);
    });

    it("deve criar exceção com status 403 (FORBIDDEN)", () => {
      const exception = new HttpException("Access denied", HttpStatus.FORBIDDEN);

      expect(exception.message).toBe("Access denied");
      expect(exception.statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(exception).toBeInstanceOf(HttpException);
    });

    it("deve criar exceção com status 404 (NOT_FOUND)", () => {
      const exception = new HttpException("Resource not found", HttpStatus.NOT_FOUND);

      expect(exception.message).toBe("Resource not found");
      expect(exception.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(exception).toBeInstanceOf(HttpException);
    });

    it("deve criar exceção com status 409 (CONFLICT)", () => {
      const exception = new HttpException("Resource already exists", HttpStatus.CONFLICT);

      expect(exception.message).toBe("Resource already exists");
      expect(exception.statusCode).toBe(HttpStatus.CONFLICT);
      expect(exception).toBeInstanceOf(HttpException);
    });

    it("deve criar exceção com status 500 (INTERNAL_SERVER_ERROR)", () => {
      const exception = new HttpException("Server error", HttpStatus.INTERNAL_SERVER_ERROR);

      expect(exception.message).toBe("Server error");
      expect(exception.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(exception).toBeInstanceOf(HttpException);
    });
  });

  describe("serialização", () => {
    it("deve ter propriedades acessíveis", () => {
      const exception = new HttpException("Test error", HttpStatus.BAD_REQUEST);

      expect(exception.message).toBe("Test error");
      expect(exception.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it("deve incluir details quando fornecido", () => {
      const details = { field: "test" };
      const exception = new HttpException("Error", HttpStatus.BAD_REQUEST, details);

      expect(exception.details).toEqual(details);
    });
  });

  describe("casos de uso comuns", () => {
    it("deve criar exceções com mensagens personalizadas", () => {
      const exceptions = [
        new HttpException("ID inválido", HttpStatus.BAD_REQUEST),
        new HttpException("Token expirado", HttpStatus.UNAUTHORIZED),
        new HttpException("Sem permissão", HttpStatus.FORBIDDEN),
        new HttpException("Usuário não encontrado", HttpStatus.NOT_FOUND),
        new HttpException("Email já cadastrado", HttpStatus.CONFLICT),
        new HttpException("Falha no banco de dados", HttpStatus.INTERNAL_SERVER_ERROR),
      ];

      exceptions.forEach((exception) => {
        expect(exception.message).toBeTruthy();
        expect(exception.statusCode).toBeGreaterThan(0);
        expect(exception).toBeInstanceOf(HttpException);
      });
    });

    it("deve permitir captura por tipo de exceção", () => {
      try {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error).toBeInstanceOf(Error);

        if (error instanceof HttpException) {
          expect(error.statusCode).toBe(404);
        }
      }
    });
  });
});
