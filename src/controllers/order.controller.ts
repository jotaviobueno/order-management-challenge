import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import { CreateOrderDto, ListOrdersQueryDto } from "../dtos/order.dto";
import { HttpStatus } from "../exceptions";

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: CreateOrderDto = req.body;
      const result = await this.orderService.create(data);

      res.status(HttpStatus.CREATED).json({
        message: "Pedido criado com sucesso",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.orderService.findById(id);

      res.status(HttpStatus.OK).json({
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: ListOrdersQueryDto = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        state: req.query.state as any,
      };

      const result = await this.orderService.findAll(query);

      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  advance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.orderService.advance(id);

      res.status(HttpStatus.OK).json({
        message: "Estado do pedido avançado com sucesso",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  softDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.orderService.softDelete(id);

      res.status(HttpStatus.OK).json({
        message: "Pedido deletado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  };
}
