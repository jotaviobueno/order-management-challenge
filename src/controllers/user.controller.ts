import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { CreateUserDTO } from "../dtos/user.dto";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: CreateUserDTO = req.body;
      const result = await this.userService.create(data);

      res.status(201).json({
        message: "Usuário criado com sucesso",
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          error: error.message,
        });
      } else {
        res.status(500).json({
          error: "Erro ao criar usuário",
        });
      }
    }
  };

  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);

      res.status(200).json({
        data: user,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({
          error: error.message,
        });
      } else {
        res.status(500).json({
          error: "Erro ao buscar usuário",
        });
      }
    }
  };

  findAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.findAll();

      res.status(200).json({
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        error: "Erro ao buscar usuários",
      });
    }
  };

  softDelete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.userService.softDelete(id);

      res.status(200).json({
        message: "Usuário deletado com sucesso",
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({
          error: error.message,
        });
      } else {
        res.status(500).json({
          error: "Erro ao deletar usuário",
        });
      }
    }
  };
}
