import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Error as MongooseError } from "mongoose";
import { HttpException } from "./http.exception";
import { HttpStatus } from "./http-status.enum";

export class ErrorHandler {
  execute(error: Error, _req: Request, res: Response, _next: NextFunction): void {
    if (error instanceof HttpException) {
      res.status(error.statusCode).json({
        statusCode: error.statusCode,
        message: error.message,
        ...(error.details && { details: error.details }),
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      });
      return;
    }

    if (error instanceof ZodError) {
      res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Erro de validação",
        details: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    if (error instanceof MongooseError.ValidationError) {
      const errors = Object.values(error.errors).map((err) => ({
        path: err.path,
        message: err.message,
      }));

      res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Erro de validação",
        details: errors,
      });
      return;
    }

    if (error.name === "MongoServerError" && (error as any).code === 11000) {
      res.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: "Registro duplicado",
        error: "Este registro já existe no sistema",
      });
      return;
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Erro interno do servidor",
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
        stack: error.stack,
      }),
    });
  }
}
