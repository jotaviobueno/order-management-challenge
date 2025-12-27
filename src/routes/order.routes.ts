import { Router } from "express";
import { ValidateMiddleware } from "../middlewares";
import { createOrderSchema, listOrdersQuerySchema } from "../dtos/order.dto";
import { orderController, authMiddleware } from "../container";

const router = Router();
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
