import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Logger } from "../utils/logger";

export class ValidateMiddleware {
  private static logger = new Logger(ValidateMiddleware.name);

  static body(schema: z.ZodType<any>) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        this.logger.debug(
          `Validando body da requisição: ${req.method} ${req.originalUrl || req.url}`
        );
        req.body = await schema.parseAsync(req.body);
        this.logger.debug("Body validado com sucesso");
        next();
      } catch (error) {
        this.logger.warn(
          "Erro na validação do body",
          error instanceof Error ? error.stack : undefined
        );
        next(error);
      }
    };
  }

  static query(schema: z.ZodType<any>) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        this.logger.debug(
          `Validando query params da requisição: ${req.method} ${req.originalUrl || req.url}`
        );
        req.query = await schema.parseAsync(req.query);
        this.logger.debug("Query params validados com sucesso");
        next();
      } catch (error) {
        this.logger.warn(
          "Erro na validação dos query params",
          error instanceof Error ? error.stack : undefined
        );
        next(error);
      }
    };
  }
}
