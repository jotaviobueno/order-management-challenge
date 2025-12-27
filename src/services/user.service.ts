import { UserRepository } from "../repositories/user.repository";
import { CreateUserDTO } from "../dtos/user.dto";
import { IUserResponse } from "../types/user.types";
import { BcryptService } from "../utils/bcrypt";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../exceptions";
import { MongoIdValidator, Logger } from "@/utils";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async create(data: CreateUserDTO): Promise<IUserResponse> {
    Logger.log(`[UserService] Tentando criar usuário: ${data.email}`);

    const existingUser = await this.userRepository.existsByEmail(data.email);

    if (existingUser) {
      Logger.warn(
        `[UserService] Tentativa de criar usuário com email duplicado: ${data.email}`
      );
      throw new ConflictException("Email já cadastrado");
    }

    const hashedPassword = await BcryptService.hash(data.password);

    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    Logger.log(
      `[UserService] Usuário criado com sucesso: ${user._id} - ${data.email}`
    );
    return this.formatUserResponse(user);
  }

  async findById(id: string): Promise<IUserResponse> {
    Logger.debug(`[UserService] Buscando usuário por ID: ${id}`);

    const isMongoId = MongoIdValidator.isValid(id);

    if (!isMongoId) {
      Logger.warn(`[UserService] ID inválido fornecido: ${id}`);
      throw new BadRequestException("ID inválido");
    }

    const user = await this.userRepository.getById(id);

    if (!user) {
      Logger.warn(`[UserService] Usuário não encontrado: ${id}`);
      throw new NotFoundException("Usuário não encontrado");
    }

    Logger.debug(`[UserService] Usuário encontrado: ${id}`);
    return this.formatUserResponse(user);
  }

  async findAll(): Promise<IUserResponse[]> {
    Logger.debug(`[UserService] Buscando todos os usuários`);

    const users = await this.userRepository.findAll();

    Logger.log(`[UserService] ${users.length} usuário(s) encontrado(s)`);
    return users.map(this.formatUserResponse);
  }

  async softDelete(id: string): Promise<void> {
    Logger.log(`[UserService] Tentando deletar usuário: ${id}`);

    const user = await this.findById(id);

    const update = await this.userRepository.softDelete(user.id);

    if (!update) {
      Logger.error(`[UserService] Falha ao deletar usuário: ${id}`);
      throw new NotFoundException("Usuário não encontrado");
    }

    Logger.log(`[UserService] Usuário deletado com sucesso: ${id}`);
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
