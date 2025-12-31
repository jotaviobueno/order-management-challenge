import { describe, it, expect } from "vitest";
import { HttpException } from "./http.exception";
import { HttpStatus } from "./http-status.enum";
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from "./index";

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

  describe("BadRequestException", () => {
    it("deve criar exceção com status 400", () => {
      const exception = new BadRequestException("Invalid input");

      expect(exception.message).toBe("Invalid input");
      expect(exception.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(exception).toBeInstanceOf(HttpException);
    });

    it("deve suportar details", () => {
      const details = { field: "age", min: 18 };
      const exception = new BadRequestException("Validation failed", details);

      expect(exception.details).toEqual(details);
    });
  });

  describe("UnauthorizedException", () => {
    it("deve criar exceção com status 401", () => {
      const exception = new UnauthorizedException("Not authenticated");

      expect(exception.message).toBe("Not authenticated");
      expect(exception.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(exception).toBeInstanceOf(HttpException);
    });

    it("deve usar mensagem padrão se não fornecida", () => {
      const exception = new UnauthorizedException();

      expect(exception.message).toBe("Unauthorized");
    });
  });

  describe("ForbiddenException", () => {
    it("deve criar exceção com status 403", () => {
      const exception = new ForbiddenException("Access denied");

      expect(exception.message).toBe("Access denied");
      expect(exception.statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(exception).toBeInstanceOf(HttpException);
    });

    it("deve usar mensagem padrão se não fornecida", () => {
      const exception = new ForbiddenException();

      expect(exception.message).toBe("Forbidden");
    });
  });

  describe("NotFoundException", () => {
    it("deve criar exceção com status 404", () => {
      const exception = new NotFoundException("Resource not found");

      expect(exception.message).toBe("Resource not found");
      expect(exception.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(exception).toBeInstanceOf(HttpException);
    });

    it("deve usar mensagem padrão se não fornecida", () => {
      const exception = new NotFoundException();

      expect(exception.message).toBe("Not Found");
    });
  });

  describe("ConflictException", () => {
    it("deve criar exceção com status 409", () => {
      const exception = new ConflictException("Resource already exists");

      expect(exception.message).toBe("Resource already exists");
      expect(exception.statusCode).toBe(HttpStatus.CONFLICT);
      expect(exception).toBeInstanceOf(HttpException);
    });

    it("deve usar mensagem padrão se não fornecida", () => {
      const exception = new ConflictException();

      expect(exception.message).toBe("Conflict");
    });
  });

  describe("InternalServerErrorException", () => {
    it("deve criar exceção com status 500", () => {
      const exception = new InternalServerErrorException("Server error");

      expect(exception.message).toBe("Server error");
      expect(exception.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(exception).toBeInstanceOf(HttpException);
    });

    it("deve usar mensagem padrão se não fornecida", () => {
      const exception = new InternalServerErrorException();

      expect(exception.message).toBe("Internal Server Error");
    });
  });

  describe("serialização", () => {
    it("deve ter propriedades acessíveis", () => {
      const exception = new BadRequestException("Test error");

      expect(exception.message).toBe("Test error");
      expect(exception.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it("deve incluir details quando fornecido", () => {
      const details = { field: "test" };
      const exception = new BadRequestException("Error", details);

      expect(exception.details).toEqual(details);
    });
  });

  describe("casos de uso comuns", () => {
    it("deve criar exceções com mensagens personalizadas", () => {
      const exceptions = [
        new BadRequestException("ID inválido"),
        new UnauthorizedException("Token expirado"),
        new ForbiddenException("Sem permissão"),
        new NotFoundException("Usuário não encontrado"),
        new ConflictException("Email já cadastrado"),
        new InternalServerErrorException("Falha no banco de dados"),
      ];

      exceptions.forEach((exception) => {
        expect(exception.message).toBeTruthy();
        expect(exception.statusCode).toBeGreaterThan(0);
        expect(exception).toBeInstanceOf(HttpException);
      });
    });

    it("deve permitir captura por tipo de exceção", () => {
      try {
        throw new NotFoundException("User not found");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error).toBeInstanceOf(HttpException);
        expect(error).toBeInstanceOf(Error);

        if (error instanceof NotFoundException) {
          expect(error.statusCode).toBe(404);
        }
      }
    });
  });
});
