import { UserRepository } from "../repositories/user.repository";
import { CreateUserDTO } from "../dtos/user.dto";
import { IUserResponse } from "../types/user.types";
import { BcryptService } from "../utils/bcrypt";
import { ConflictException, NotFoundException } from "../exceptions";
import { MongoIdValidator } from "@/utils";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async create(data: CreateUserDTO): Promise<IUserResponse> {
    const existingUser = await this.userRepository.existsByEmail(data.email);

    if (existingUser) {
      throw new ConflictException("Email já cadastrado");
    }

    const hashedPassword = await BcryptService.hash(data.password);

    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    return this.formatUserResponse(user);
  }

  async findById(id: string): Promise<IUserResponse> {
    const isMongoId = MongoIdValidator.isValid(id);

    if (!isMongoId) throw new NotFoundException("Usuário não encontrado");

    const user = await this.userRepository.getById(id);

    if (!user) throw new NotFoundException("Usuário não encontrado");

    return this.formatUserResponse(user);
  }

  async findAll(): Promise<IUserResponse[]> {
    const users = await this.userRepository.findAll();
    return users.map(this.formatUserResponse);
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.findById(id);

    const update = await this.userRepository.softDelete(user.id);

    if (!update) {
      throw new NotFoundException("Usuário não encontrado");
    }
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
