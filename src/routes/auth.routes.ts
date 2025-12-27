import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { ValidateMiddleware } from "../middlewares/validate.middleware";
import { loginUserSchema } from "../dtos/auth.dto";

const router = Router();
const authController = new AuthController();

router.post(
  "/login",
  ValidateMiddleware.body(loginUserSchema),
  authController.login
);

export { router as authRouter };
