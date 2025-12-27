import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { ValidateMiddleware } from "../middlewares/validate.middleware";
import { loginUserSchema } from "../dtos/auth.dto";
import { AuthService } from "../services/auth.service";
import { UserRepository } from "../repositories/user.repository";
import { BcryptService } from "../utils/bcrypt";
import { JwtService } from "../utils/jwt";

const router = Router();
const userRepository = new UserRepository();

const bcryptService = new BcryptService();
const jwtService = new JwtService();

const authService = new AuthService(userRepository, bcryptService, jwtService);
const authController = new AuthController(authService);

router.post(
  "/login",
  ValidateMiddleware.body(loginUserSchema),
  authController.login
);

export { router as authRouter };
