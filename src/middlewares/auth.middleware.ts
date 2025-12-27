import { Request, Response, NextFunction } from "express";
import { IAuthPayload } from "../types/auth.types";
import { AlsService } from "../utils/async-context";
import { JwtService } from "@/utils";
import {
  USER_ID_CONSTANT,
  EMAIL_CONSTANT,
  ACCESS_TOKEN_CONSTANT,
} from "@/config";

declare global {
  namespace Express {
    interface Request {
      user?: IAuthPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Token não fornecido" });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = JwtService.verify(token);
      req.user = decoded;

      AlsService.set(USER_ID_CONSTANT, decoded.userId);
      AlsService.set(EMAIL_CONSTANT, decoded.email);

      if (!AlsService.has(ACCESS_TOKEN_CONSTANT)) {
        AlsService.set(ACCESS_TOKEN_CONSTANT, token);
      }

      next();
    } catch (error) {
      res.status(401).json({ error: "Token inválido ou expirado" });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: "Erro na autenticação" });
    return;
  }
};
