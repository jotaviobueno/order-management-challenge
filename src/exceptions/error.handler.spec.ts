import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "./error.handler";
import { HttpException } from "./http.exception";
import { HttpStatus } from "./http-status.enum";
import { BadRequestException, NotFoundException } from "./index";
import { ZodError } from "zod";

describe("ErrorHandler", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn() as unknown as NextFunction;
    errorHandler = new ErrorHandler();
  });

  describe("execute", () => {
    it("deve tratar HttpException e retornar status correto", () => {
      const error = new BadRequestException("Invalid input");

      errorHandler.execute(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      const response = (mockResponse.json as any).mock.calls[0][0];
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.message).toBe("Invalid input");
      expect(response.details).toBeUndefined();
    });

    it("deve incluir details quando presentes", () => {
      const details = { field: "email", error: "invalid format" };
      const error = new BadRequestException("Validation failed", details);

      errorHandler.execute(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Validation failed",
        details,
      });
    });

    it("deve tratar ZodError e retornar 400", () => {
      const zodError = new ZodError([
        {
          code: "invalid_type",
          expected: "string",
          received: "number",
          path: ["email"],
          message: "Expected string, received number",
        },
      ]);

      errorHandler.execute(zodError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalled();
      const response = (mockResponse.json as any).mock.calls[0][0];
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.message).toBe("Erro de validação");
      expect(response.details).toBeDefined();
      expect(Array.isArray(response.details)).toBe(true);
    });

    it("deve formatar ZodError details corretamente", () => {
      const zodError = new ZodError([
        {
          code: "invalid_type",
          expected: "string",
          received: "number",
          path: ["user", "email"],
          message: "Invalid email",
        },
      ]);

      errorHandler.execute(zodError, mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as any).mock.calls[0][0];
      expect(response.details[0]).toEqual({
        path: "user.email",
        message: "Invalid email",
      });
    });

    it("deve tratar erro genérico e retornar 500", () => {
      const error = new Error("Something went wrong");

      errorHandler.execute(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Erro interno do servidor",
      });
    });

    it("deve tratar diferentes tipos de HttpException", () => {
      const exceptions = [
        { error: new BadRequestException("Bad request"), status: 400 },
        { error: new NotFoundException("Not found"), status: 404 },
        {
          error: new HttpException("Custom", HttpStatus.UNAUTHORIZED),
          status: 401,
        },
      ];

      exceptions.forEach(({ error, status }) => {
        mockResponse.status = vi.fn().mockReturnThis();
        mockResponse.json = vi.fn().mockReturnThis();

        errorHandler.execute(error, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(status);
      });
    });

    it("deve tratar múltiplos erros do Zod", () => {
      const zodError = new ZodError([
        {
          code: "invalid_type",
          expected: "string",
          received: "number",
          path: ["email"],
          message: "Invalid email",
        },
        {
          code: "too_small",
          minimum: 6,
          type: "string",
          inclusive: true,
          exact: false,
          path: ["password"],
          message: "Password too short",
        },
      ]);

      errorHandler.execute(zodError, mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as any).mock.calls[0][0];
      expect(response.details).toHaveLength(2);
      expect(response.details[0].path).toBe("email");
      expect(response.details[1].path).toBe("password");
    });

    it("não deve expor stack trace em erro genérico", () => {
      const error = new Error("Internal error");
      error.stack = "Stack trace here";

      errorHandler.execute(error, mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as any).mock.calls[0][0];
      expect(response.stack).toBeUndefined();
      expect(response.message).toBe("Erro interno do servidor");
    });

    it("deve chamar response.status e response.json na ordem correta", () => {
      const error = new BadRequestException("Test");
      const callOrder: string[] = [];

      mockResponse.status = vi.fn().mockImplementation(() => {
        callOrder.push("status");
        return mockResponse;
      });
      mockResponse.json = vi.fn().mockImplementation(() => {
        callOrder.push("json");
        return mockResponse;
      });

      errorHandler.execute(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(callOrder).toEqual(["status", "json"]);
    });
  });
});
