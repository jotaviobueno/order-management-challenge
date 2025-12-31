import { UserRepository } from "../repositories/user.repository";
import { CreateUserDto, ListUsersQueryDto } from "../dtos/user.dto";
import { IUser, IUserResponse } from "../types/user.types";
import { IAuthResponse } from "../types/auth.types";
import { HttpException, HttpStatus } from "../exceptions";
import { MongoIdValidator, Logger } from "@/utils";
import { PaginatedResult } from "../types/pagination.types";
import { BcryptService } from "../utils/bcrypt";
import { JwtService } from "../utils/jwt";
import { UserAdapter } from "../adapters";

export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    private readonly userAdapter: UserAdapter
  ) {}

  async create(data: CreateUserDto): Promise<IAuthResponse> {
    this.logger.log(`Tentando criar usuário: ${data.email}`);

    const existingUser = await this.userRepository.existsByEmail(data.email);

    if (existingUser) {
      this.logger.warn(`Tentativa de criar usuário com email duplicado: ${data.email}`);
      throw new HttpException("Email já cadastrado", HttpStatus.CONFLICT);
    }

    const hashedPassword = await this.bcryptService.hash(data.password);

    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const token = this.jwtService.generate({
      sub: user._id.toString(),
      email: user.email,
    });

    this.logger.log(`Usuário criado com sucesso: ${user._id} - ${data.email}`);

    return {
      token,
      user: this.userAdapter.toResponse(user),
    };
  }

  async findByEmail(email: string): Promise<IUser> {
    this.logger.debug(`Buscando usuário por email: ${email}`);

    const user = await this.userRepository.getByEmail(email);

    if (!user) {
      this.logger.warn(`Usuário não encontrado: ${email}`);
      throw new HttpException("Usuário não encontrado", HttpStatus.NOT_FOUND);
    }

    this.logger.debug(`Usuário encontrado: ${email}`);
    return user;
  }

  async findById(id: string): Promise<IUserResponse> {
    this.logger.debug(`Buscando usuário por ID: ${id}`);

    const isMongoId = MongoIdValidator.isValid(id);

    if (!isMongoId) {
      this.logger.warn(`ID inválido fornecido: ${id}`);
      throw new HttpException("ID inválido", HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.getById(id);

    if (!user) {
      this.logger.warn(`Usuário não encontrado: ${id}`);
      throw new HttpException("Usuário não encontrado", HttpStatus.NOT_FOUND);
    }

    this.logger.debug(`Usuário encontrado: ${id}`);
    return this.userAdapter.toResponse(user);
  }

  async findAll(query: ListUsersQueryDto): Promise<PaginatedResult<IUserResponse>> {
    this.logger.debug(`Buscando usuários - Página: ${query.page}, Limite: ${query.limit}`);

    const result = await this.userRepository.findAll({
      page: query.page,
      limit: query.limit,
    });

    this.logger.log(`${result.data.length} usuário(s) encontrado(s) na página ${query.page}`);

    return {
      data: this.userAdapter.toResponseList(result.data),
      pagination: result.pagination,
    };
  }

  async softDelete(id: string): Promise<void> {
    this.logger.log(`Tentando deletar usuário: ${id}`);

    const user = await this.findById(id);

    const update = await this.userRepository.softDelete(user.id);

    if (!update) {
      this.logger.error(`Falha ao deletar usuário: ${id}`);
      throw new HttpException("Usuário não encontrado", HttpStatus.NOT_FOUND);
    }

    this.logger.log(`Usuário deletado com sucesso: ${id}`);
  }
}
