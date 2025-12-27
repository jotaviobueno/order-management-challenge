import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { ValidateMiddleware } from "@/middlewares";
import { createUserSchema, listUsersQuerySchema } from "@/dtos/user.dto";

const router = Router();
const userController = new UserController();

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
