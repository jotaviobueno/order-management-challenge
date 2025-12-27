import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { CreateUserDto, ListUsersQueryDto } from "../dtos/user.dto";
import { HttpStatus } from "../exceptions";

export class UserController {
  constructor(private readonly userService: UserService) {}

  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: CreateUserDto = req.body;
      const result = await this.userService.create(data);

      res.status(HttpStatus.CREATED).json({
        message: "Usuário criado com sucesso",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await this.userService.findById(id);

      res.status(HttpStatus.OK).json({
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query: ListUsersQueryDto = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      };

      const result = await this.userService.findAll(query);

      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  softDelete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      await this.userService.softDelete(id);

      res.status(HttpStatus.OK).json({
        message: "Usuário deletado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  };
}
