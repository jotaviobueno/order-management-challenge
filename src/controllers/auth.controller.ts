import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { LoginUserDTO } from "../dtos/auth.dto";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: LoginUserDTO = req.body;
      const result = await this.authService.login(data);

      res.status(200).json({
        message: "Login realizado com sucesso",
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          error: error.message,
        });
      } else {
        res.status(500).json({
          error: "Erro ao realizar login",
        });
      }
    }
  };
}
