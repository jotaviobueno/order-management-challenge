import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { ValidateMiddleware } from "./validate.middleware";
import { z } from "zod";

describe("ValidateMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: vi.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    mockNext = vi.fn();
  });

  describe("body", () => {
    it("deve validar body com sucesso", async () => {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
      });

      mockRequest.body = {
        email: "test@test.com",
        password: "password123",
      };

      const middleware = ValidateMiddleware.body(schema);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.body.email).toBe("test@test.com");
      expect(mockRequest.body.password).toBe("password123");
    });

    it("deve passar erro para next se validação falhar", async () => {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
      });

      mockRequest.body = {
        email: "invalid-email",
        password: "123",
      };

      const middleware = ValidateMiddleware.body(schema);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as any).mock.calls[0][0];
      expect(error).toBeDefined();
      expect(error.issues).toBeDefined();
    });

    it("deve aplicar transformações do schema", async () => {
      const schema = z.object({
        age: z.coerce.number(),
      });

      mockRequest.body = {
        age: "25",
      };

      const middleware = ValidateMiddleware.body(schema);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.body.age).toBe(25);
      expect(typeof mockRequest.body.age).toBe("number");
    });

    it("deve aplicar valores default do schema", async () => {
      const schema = z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
      });

      mockRequest.body = {};

      const middleware = ValidateMiddleware.body(schema);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.body.page).toBe(1);
      expect(mockRequest.body.limit).toBe(10);
    });
  });

  describe("query", () => {
    it("deve validar query params com sucesso", async () => {
      const schema = z.object({
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(10),
      });

      mockRequest.query = {
        page: "2",
        limit: "20",
      };

      const middleware = ValidateMiddleware.query(schema);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.query.page).toBe(2);
      expect(mockRequest.query.limit).toBe(20);
    });

    it("deve passar erro para next se validação falhar", async () => {
      const schema = z.object({
        page: z.coerce.number().positive(),
      });

      mockRequest.query = {
        page: "-1",
      };

      const middleware = ValidateMiddleware.query(schema);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as any).mock.calls[0][0];
      expect(error).toBeDefined();
      expect(error.issues).toBeDefined();
    });

    it("deve aplicar valores default para query vazia", async () => {
      const schema = z.object({
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(10),
      });

      mockRequest.query = {};

      const middleware = ValidateMiddleware.query(schema);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.query.page).toBe(1);
      expect(mockRequest.query.limit).toBe(10);
    });

    it("deve validar tipos complexos em query", async () => {
      const schema = z.object({
        status: z.enum(["ACTIVE", "INACTIVE"]),
        page: z.coerce.number(),
      });

      mockRequest.query = {
        status: "ACTIVE",
        page: "1",
      };

      const middleware = ValidateMiddleware.query(schema);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.query.status).toBe("ACTIVE");
    });
  });
});
