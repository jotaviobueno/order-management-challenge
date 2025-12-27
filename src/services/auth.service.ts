import { UserRepository } from "../repositories/user.repository";
import { LoginUserDto } from "../dtos/auth.dto";
import { BcryptService } from "../utils/bcrypt";
import { JwtService } from "../utils/jwt";
import { UnauthorizedException } from "../exceptions";
import { IAuthResponse } from "@/types";
import { Logger } from "@/utils";

export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService
  ) {}

  async login(data: LoginUserDto): Promise<IAuthResponse> {
    const user = await this.userRepository.getByEmail(data.email);

    if (!user) {
      this.logger.warn(`Tentativa de login com email inválido: ${data.email}`);
      throw new UnauthorizedException("Credenciais inválidas");
    }

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
      user: {
        id: user._id.toString(),
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}
