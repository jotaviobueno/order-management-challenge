import { Request, Response, NextFunction } from "express";
import { AlsService } from "../utils/async-context";
import { JwtService } from "@/utils";
import {
  USER_ID_CONSTANT,
  EMAIL_CONSTANT,
  ACCESS_TOKEN_CONSTANT,
} from "@/config";
import { UnauthorizedException } from "../exceptions";

export class AuthMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async execute(
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedException("Token não fornecido");
      }

      const token = authHeader.substring(7);

      try {
        const decoded = this.jwtService.verify(token);
        req.user = decoded;

        AlsService.set(USER_ID_CONSTANT, decoded.sub);
        AlsService.set(EMAIL_CONSTANT, decoded.email);

        if (!AlsService.has(ACCESS_TOKEN_CONSTANT)) {
          AlsService.set(ACCESS_TOKEN_CONSTANT, token);
        }

        next();
      } catch (error) {
        throw new UnauthorizedException("Token inválido ou expirado");
      }
    } catch (error) {
      next(error);
    }
  }
}
