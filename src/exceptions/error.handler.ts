import { Request, Response } from "express";
import { ZodError } from "zod";
import { Error as MongooseError } from "mongoose";

export class ErrorHandler {
  static execute(error: Error, _: Request, res: Response): void {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Erro de validação",
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

      res.status(400).json({
        error: "Erro de validação",
        details: errors,
      });
      return;
    }

    if (error.name === "MongoServerError" && (error as any).code === 11000) {
      res.status(409).json({
        error: "Registro duplicado",
        message: "Este registro já existe no sistema",
      });
      return;
    }

    res.status(500).json({
      error: "Erro interno do servidor",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Algo deu errado",
    });
  }
}
