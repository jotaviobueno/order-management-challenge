import { UserRepository } from "../repositories/user.repository";
import { LoginUserDTO } from "../dtos/auth.dto";
import { IUserResponse } from "../types/user.types";
import { BcryptService } from "../utils/bcrypt";
import { JwtService } from "../utils/jwt";
import { UnauthorizedException } from "../exceptions";
import { ILoginResponse } from "@/types";

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(data: LoginUserDTO): Promise<ILoginResponse> {
    const user = await this.userRepository.getByEmail(data.email);

    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const isPasswordValid = await BcryptService.compare(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const token = JwtService.generate({
      sub: user._id.toString(),
      email: user.email,
    });

    return {
      token,
    };
  }
}
