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

// Utils
const alsService = new AlsService();
const errorHandler = new ErrorHandler();

// Repositories
const userRepository = new UserRepository();
const orderRepository = new OrderRepository();

// Services
const bcryptService = new BcryptService();
const jwtService = new JwtService();

// Adapters
const userAdapter = new UserAdapter();
const orderAdapter = new OrderAdapter();

// Services with dependencies
const authService = new AuthService(
  userRepository,
  bcryptService,
  jwtService,
  userAdapter
);
const userService = new UserService(
  userRepository,
  bcryptService,
  jwtService,
  userAdapter
);
const orderService = new OrderService(orderRepository, orderAdapter);

// Controllers
const authController = new AuthController(authService);
const userController = new UserController(userService);
const orderController = new OrderController(orderService);

// Middlewares
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
