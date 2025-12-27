import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { ValidateMiddleware } from "../middlewares";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { createOrderSchema, listOrdersQuerySchema } from "../dtos/order.dto";

const router = Router();
const orderController = new OrderController();

router.use(AuthMiddleware.execute);
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
