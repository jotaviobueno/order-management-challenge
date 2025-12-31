import { UserRepository } from "./repositories/user.repository";
import { OrderRepository } from "./repositories/order.repository";
import { BcryptService } from "./utils/bcrypt";
import { JwtService } from "./utils/jwt";
import { UserAdapter } from "./adapters/user.adapter";
import { OrderAdapter } from "./adapters/order.adapter";
import { AuthService } from "./services/auth.service";
import { UserService } from "./services/user.service";
import { OrderService } from "./services/order.service";
import { AuthController } from "./controllers/auth.controller";
import { UserController } from "./controllers/user.controller";
import { OrderController } from "./controllers/order.controller";
import { AuthMiddleware } from "./middlewares/auth.middleware";
import { AlsService } from "./utils/async-context";
import { MetadataMiddleware } from "./middlewares";
import { ErrorHandler } from "./exceptions";

const alsService = new AlsService();
const errorHandler = new ErrorHandler();

const userRepository = new UserRepository();
const orderRepository = new OrderRepository();

const bcryptService = new BcryptService();
const jwtService = new JwtService();

const userAdapter = new UserAdapter();
const orderAdapter = new OrderAdapter();

const userService = new UserService(userRepository, bcryptService, jwtService, userAdapter);
const authService = new AuthService(userService, bcryptService, jwtService, userAdapter);
const orderService = new OrderService(orderRepository, orderAdapter);

const authController = new AuthController(authService);
const userController = new UserController(userService);
const orderController = new OrderController(orderService);

const authMiddleware = new AuthMiddleware(jwtService);
const metadataMiddleware = new MetadataMiddleware();

export {
  authController,
  userController,
  orderController,
  authService,
  userService,
  orderService,
  bcryptService,
  jwtService,
  userRepository,
  orderRepository,
  userAdapter,
  orderAdapter,
  alsService,
  errorHandler,
  authMiddleware,
  metadataMiddleware,
};
