import { UserRepository } from "../repositories/user.repository";
import { CreateUserDto, ListUsersQueryDto } from "../dtos/user.dto";
import { IUserResponse } from "../types/user.types";
import { BcryptService } from "../utils/bcrypt";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../exceptions";
import { MongoIdValidator, Logger } from "@/utils";
import { PaginatedResult } from "../types/pagination.types";

export class UserService {
  private readonly logger = new Logger(UserService.name);
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async create(data: CreateUserDto): Promise<IUserResponse> {
    this.logger.log(`Tentando criar usuário: ${data.email}`);

    const existingUser = await this.userRepository.existsByEmail(data.email);

    if (existingUser) {
      this.logger.warn(
        `Tentativa de criar usuário com email duplicado: ${data.email}`
      );
      throw new ConflictException("Email já cadastrado");
    }

    const hashedPassword = await BcryptService.hash(data.password);

    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    this.logger.log(`Usuário criado com sucesso: ${user._id} - ${data.email}`);
    return this.formatUserResponse(user);
  }

  async findById(id: string): Promise<IUserResponse> {
    this.logger.debug(`Buscando usuário por ID: ${id}`);

    const isMongoId = MongoIdValidator.isValid(id);

    if (!isMongoId) {
      this.logger.warn(`ID inválido fornecido: ${id}`);
      throw new BadRequestException("ID inválido");
    }

    const user = await this.userRepository.getById(id);

    if (!user) {
      this.logger.warn(`Usuário não encontrado: ${id}`);
      throw new NotFoundException("Usuário não encontrado");
    }

    this.logger.debug(`Usuário encontrado: ${id}`);
    return this.formatUserResponse(user);
  }

  async findAll(
    query: ListUsersQueryDto
  ): Promise<PaginatedResult<IUserResponse>> {
    this.logger.debug(
      `Buscando usuários - Página: ${query.page}, Limite: ${query.limit}`
    );

    const result = await this.userRepository.findAll({
      page: query.page,
      limit: query.limit,
    });

    this.logger.log(
      `${result.data.length} usuário(s) encontrado(s) na página ${query.page}`
    );

    return {
      data: result.data.map(this.formatUserResponse),
      pagination: result.pagination,
    };
  }

  async softDelete(id: string): Promise<void> {
    this.logger.log(`Tentando deletar usuário: ${id}`);

    const user = await this.findById(id);

    const update = await this.userRepository.softDelete(user.id);

    if (!update) {
      this.logger.error(`Falha ao deletar usuário: ${id}`);
      throw new NotFoundException("Usuário não encontrado");
    }

    this.logger.log(`Usuário deletado com sucesso: ${id}`);
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
