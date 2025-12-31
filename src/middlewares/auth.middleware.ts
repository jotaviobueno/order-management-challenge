import { Request, Response, NextFunction } from "express";
import { AlsService } from "../utils/async-context";
import { JwtService } from "@/utils";
import { USER_ID_CONSTANT, EMAIL_CONSTANT, ACCESS_TOKEN_CONSTANT } from "@/config";
import { HttpException, HttpStatus } from "../exceptions";
import { Logger } from "../utils/logger";

export class AuthMiddleware {
  private logger = new Logger(AuthMiddleware.name);

  constructor(private readonly jwtService: JwtService) {}

  async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        this.logger.warn("Token não fornecido ou formato inválido");
        throw new HttpException("Token não fornecido", HttpStatus.UNAUTHORIZED);
      }

      const token = authHeader.substring(7);

      try {
        this.logger.debug("Validando token JWT");
        const decoded = this.jwtService.verify(token);
        req.user = decoded;

        this.logger.debug(`Usuário autenticado: ${decoded.sub}`);

        AlsService.set(USER_ID_CONSTANT, decoded.sub);
        AlsService.set(EMAIL_CONSTANT, decoded.email);

        if (!AlsService.has(ACCESS_TOKEN_CONSTANT)) {
          AlsService.set(ACCESS_TOKEN_CONSTANT, token);
        }

        next();
      } catch {
        this.logger.warn("Token inválido ou expirado");
        throw new HttpException("Token inválido ou expirado", HttpStatus.UNAUTHORIZED);
      }
    } catch (error) {
      this.logger.error("Erro na autenticação", error instanceof Error ? error.stack : undefined);
      next(error);
    }
  }
}
