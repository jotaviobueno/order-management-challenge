import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export class ValidateMiddleware {
  static body(schema: z.ZodType<any>) {
    return async (
      req: Request,
      _res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        req.body = await schema.parseAsync(req.body);
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  static query(schema: z.ZodType<any>) {
    return async (
      req: Request,
      _res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        req.query = await schema.parseAsync(req.query);
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}
