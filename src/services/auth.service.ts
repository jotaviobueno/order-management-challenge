import { LoginUserDto } from "../dtos/auth.dto";
import { BcryptService } from "../utils/bcrypt";
import { JwtService } from "../utils/jwt";
import { UnauthorizedException } from "../exceptions";
import { IAuthResponse } from "@/types";
import { Logger } from "@/utils";
import { UserAdapter } from "../adapters";
import { UserService } from "./user.service";

export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    private readonly userAdapter: UserAdapter
  ) {}

  async login(data: LoginUserDto): Promise<IAuthResponse> {
    const user = await this.userService.findByEmail(data.email);

    const isPasswordValid = await this.bcryptService.compare(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      this.logger.warn(`Tentativa de login com senha inválida: ${data.email}`);
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const token = this.jwtService.generate({
      sub: user._id.toString(),
      email: user.email,
    });

    return {
      token,
      user: this.userAdapter.toResponse(user),
    };
  }
}
