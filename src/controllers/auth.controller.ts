import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { LoginUserDto } from "../dtos/auth.dto";
import { HttpStatus } from "../exceptions";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: LoginUserDto = req.body;
      const result = await this.authService.login(data);

      res.status(HttpStatus.OK).json({
        message: "Login realizado com sucesso",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
