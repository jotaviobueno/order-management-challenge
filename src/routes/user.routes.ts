import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { ValidateMiddleware } from "@/middlewares";
import { createUserSchema, listUsersQuerySchema } from "@/dtos/user.dto";
import { UserService } from "../services/user.service";
import { UserRepository } from "../repositories/user.repository";
import { BcryptService } from "../utils/bcrypt";
import { JwtService } from "../utils/jwt";

const router = Router();
const userRepository = new UserRepository();

const bcryptService = new BcryptService();
const jwtService = new JwtService();

const userService = new UserService(userRepository, bcryptService, jwtService);
const userController = new UserController(userService);

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
