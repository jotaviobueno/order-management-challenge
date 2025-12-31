import { OrderRepository } from "../repositories/order.repository";
import { PaginatedResult } from "../types/pagination.types";
import { CreateOrderDto, ListOrdersQueryDto } from "../dtos/order.dto";
import { IOrderResponse } from "../types/order.types";
import { HttpException, HttpStatus } from "../exceptions";
import { MongoIdValidator, Logger } from "@/utils";
import { OrderStateMachine } from "../utils/order-state-machine";
import { OrderState } from "@/types";
import { OrderAdapter } from "../adapters";

export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderAdapter: OrderAdapter
  ) {}

  async create(data: CreateOrderDto): Promise<IOrderResponse> {
    this.logger.log(`Tentando criar pedido para paciente: ${data.patient}`);

    const totalValue = data.services.reduce((sum, service) => sum + service.value, 0);

    if (totalValue <= 0) {
      this.logger.warn(`Tentativa de criar pedido com valor total zerado`);
      throw new HttpException(
        "O valor total dos serviços deve ser maior que zero",
        HttpStatus.BAD_REQUEST
      );
    }

    if (!data.services || data.services.length === 0) {
      this.logger.warn(`Tentativa de criar pedido sem serviços`);
      throw new HttpException("Pelo menos um serviço é obrigatório", HttpStatus.BAD_REQUEST);
    }

    const order = await this.orderRepository.create(data);

    this.logger.log(`Pedido criado com sucesso: ${order._id} - Estado: ${order.state}`);
    return this.orderAdapter.toResponse(order);
  }

  async findById(id: string): Promise<IOrderResponse> {
    this.logger.debug(`Buscando pedido por ID: ${id}`);

    const isMongoId = MongoIdValidator.isValid(id);
    if (!isMongoId) {
      this.logger.warn(`ID inválido fornecido: ${id}`);
      throw new HttpException("ID inválido", HttpStatus.BAD_REQUEST);
    }

    const order = await this.orderRepository.findById(id);

    if (!order) {
      this.logger.warn(`Pedido não encontrado: ${id}`);
      throw new HttpException("Pedido não encontrado", HttpStatus.NOT_FOUND);
    }

    this.logger.debug(`Pedido encontrado: ${id}`);
    return this.orderAdapter.toResponse(order);
  }

  async findAll(query: ListOrdersQueryDto): Promise<PaginatedResult<IOrderResponse>> {
    this.logger.debug(
      `Buscando pedidos - Página: ${query.page}, Limite: ${
        query.limit
      }, Estado: ${query.state || "todos"}`
    );

    const result = await this.orderRepository.findAll({
      page: query.page,
      limit: query.limit,
      state: query.state,
    });

    this.logger.log(`${result.data.length} pedido(s) encontrado(s) na página ${query.page}`);

    return {
      data: this.orderAdapter.toResponseList(result.data),
      pagination: result.pagination,
    };
  }

  async advance(id: string): Promise<IOrderResponse> {
    this.logger.log(`Tentando avançar estado do pedido: ${id}`);

    const isMongoId = MongoIdValidator.isValid(id);
    if (!isMongoId) {
      this.logger.warn(`ID inválido fornecido: ${id}`);
      throw new HttpException("ID inválido", HttpStatus.BAD_REQUEST);
    }

    const order = await this.findById(id);

    const currentState = order.state;

    if (OrderStateMachine.isFinalState(currentState)) {
      this.logger.warn(
        `Tentativa de avançar pedido em estado final: ${id} - Estado: ${currentState}`
      );
      throw new HttpException(
        `Pedido já está no estado final: ${currentState}`,
        HttpStatus.BAD_REQUEST
      );
    }

    const nextState = OrderStateMachine.advance(currentState);

    this.logger.log(`Avançando pedido ${id} de ${currentState} para ${nextState}`);

    const update = await this.orderRepository.updateState(id, nextState);

    if (!update) {
      this.logger.error(`Falha ao atualizar estado do pedido: ${id}`);
      throw new HttpException("Falha ao atualizar pedido", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.logger.log(`Pedido ${id} avançado com sucesso para ${nextState}`);

    return this.orderAdapter.toResponse(update);
  }

  async softDelete(id: string): Promise<void> {
    this.logger.log(`Tentando deletar pedido: ${id}`);

    const order = await this.findById(id);

    if (order.state === OrderState.COMPLETED) {
      this.logger.warn(`Tentativa de exclusão de pedido já concluído: ${id}`);
      throw new HttpException(
        "Não é possível excluir um pedido já concluído",
        HttpStatus.BAD_REQUEST
      );
    }

    const update = await this.orderRepository.softDelete(order.id);

    if (!update) {
      this.logger.error(`Falha ao deletar pedido: ${id}`);
      throw new HttpException("Falha ao deletar pedido", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.logger.log(`Pedido deletado com sucesso: ${id}`);
  }
}
