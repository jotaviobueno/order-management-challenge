import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { ValidateMiddleware } from "../middlewares";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { createOrderSchema, listOrdersQuerySchema } from "../dtos/order.dto";
import { OrderService } from "../services/order.service";
import { OrderRepository } from "../repositories/order.repository";
import { JwtService } from "../utils";

const router = Router();
const jwtService = new JwtService();
const orderRepository = new OrderRepository();
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);

const authMiddleware = new AuthMiddleware(jwtService);

router.use(authMiddleware.execute);
router.post(
  "/",
  ValidateMiddleware.body(createOrderSchema),
  orderController.create
);
router.get(
  "/",
  ValidateMiddleware.query(listOrdersQuerySchema),
  orderController.findAll
);
router.get("/:id", orderController.findById);
router.patch("/:id/advance", orderController.advance);
router.delete("/:id", orderController.softDelete);

export { router as orderRouter };
