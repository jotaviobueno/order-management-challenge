import { Router } from "express";
import { ValidateMiddleware } from "../middlewares/validate.middleware";
import { loginUserSchema } from "../dtos/auth.dto";
import { authController } from "../container";

const router = Router();

router.post("/login", ValidateMiddleware.body(loginUserSchema), authController.login);

export { router as authRouter };
