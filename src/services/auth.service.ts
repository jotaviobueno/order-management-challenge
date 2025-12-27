import { UserRepository } from "../repositories/user.repository";
import { LoginUserDTO } from "../dtos/auth.dto";
import { IUserResponse } from "../types/user.types";
import { BcryptService } from "../utils/bcrypt";
import { JwtService } from "../utils/jwt";

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(
    data: LoginUserDTO
  ): Promise<{ user: IUserResponse; token: string }> {
    const user = await this.userRepository.getByEmail(data.email);

    if (!user) {
      throw new Error("Credenciais inválidas");
    }

    const isPasswordValid = await BcryptService.compare(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("Credenciais inválidas");
    }

    const token = JwtService.generate({
      userId: user._id.toString(),
      email: user.email,
    });

    return {
      user: this.formatUserResponse(user),
      token,
    };
  }

  private formatUserResponse(user: any): IUserResponse {
    return {
      id: user._id.toString(),
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
