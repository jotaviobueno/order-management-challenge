import { Router } from "express";
import { ValidateMiddleware } from "@/middlewares";
import { createUserSchema, listUsersQuerySchema } from "@/dtos/user.dto";
import { userController } from "../container";

const router = Router();

router.post(
  "/",
  ValidateMiddleware.body(createUserSchema),
  userController.create
);
router.get(
  "/",
  ValidateMiddleware.query(listUsersQuerySchema),
  userController.findAll
);
router.get("/:id", userController.findById);
router.delete("/:id", userController.softDelete);

export { router as userRouter };
