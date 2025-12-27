import { describe, it, expect, beforeEach, vi } from "vitest";
import { OrderService } from "./order.service";
import { OrderRepository } from "../repositories/order.repository";
import { MongoIdValidator } from "../utils/mongo-id.validator";
import { OrderStateMachine } from "../utils/order-state-machine";
import { OrderState, OrderStatus } from "../types/enums";
import { BadRequestException, NotFoundException } from "../exceptions";

vi.mock("../utils/mongo-id.validator");

describe("OrderService", () => {
  let orderService: OrderService;
  let orderRepository: OrderRepository;

  beforeEach(() => {
    orderRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      updateState: vi.fn(),
      softDelete: vi.fn(),
    } as any;

    orderService = new OrderService();
    (orderService as any).orderRepository = orderRepository;
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("deve criar um pedido com dados válidos", async () => {
      const orderData = {
        lab: "Lab Test",
        patient: "John Doe",
        customer: "Customer Test",
        services: [{ name: "Service 1", value: 100, status: "PENDING" as any }],
      };

      const mockOrder = {
        _id: "507f1f77bcf86cd799439011",
        ...orderData,
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(orderRepository, "create").mockResolvedValue(mockOrder as any);

      const result = await orderService.create(orderData);

      expect(orderRepository.create).toHaveBeenCalledWith(orderData);
      expect(result.state).toBe(OrderState.CREATED);
      expect(result.status).toBe(OrderStatus.ACTIVE);
    });

    it("deve lançar BadRequestException se valor total for zero", async () => {
      const orderData = {
        lab: "Lab Test",
        patient: "John Doe",
        customer: "Customer Test",
        services: [{ name: "Service 1", value: 0, status: "PENDING" as any }],
      };

      await expect(orderService.create(orderData)).rejects.toThrow(
        BadRequestException
      );
      await expect(orderService.create(orderData)).rejects.toThrow(
        "O valor total dos serviços deve ser maior que zero"
      );
    });

    it("deve lançar BadRequestException se não houver serviços", async () => {
      const orderData = {
        lab: "Lab Test",
        patient: "John Doe",
        customer: "Customer Test",
        services: [],
      };

      await expect(orderService.create(orderData)).rejects.toThrow(
        BadRequestException
      );
      await expect(orderService.create(orderData)).rejects.toThrow(
        "O valor total dos serviços deve ser maior que zero"
      );
    });

    it("deve calcular valor total corretamente", async () => {
      const orderData = {
        lab: "Lab Test",
        patient: "John Doe",
        customer: "Customer Test",
        services: [
          { name: "Service 1", value: 50, status: "PENDING" as any },
          { name: "Service 2", value: 75, status: "PENDING" as any },
        ],
      };

      const mockOrder = {
        _id: "507f1f77bcf86cd799439011",
        ...orderData,
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(orderRepository, "create").mockResolvedValue(mockOrder as any);

      const result = await orderService.create(orderData);

      expect(result).toBeDefined();
      expect(orderRepository.create).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("deve buscar pedido por ID válido", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockOrder = {
        _id: id,
        lab: "Lab Test",
        patient: "John Doe",
        customer: "Customer Test",
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        services: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(MongoIdValidator, "isValid").mockReturnValue(true);
      vi.spyOn(orderRepository, "findById").mockResolvedValue(mockOrder as any);

      const result = await orderService.findById(id);

      expect(MongoIdValidator.isValid).toHaveBeenCalledWith(id);
      expect(orderRepository.findById).toHaveBeenCalledWith(id);
      expect(result.id).toBe(id);
    });

    it("deve lançar BadRequestException se ID for inválido", async () => {
      const invalidId = "invalid-id";

      vi.spyOn(MongoIdValidator, "isValid").mockReturnValue(false);

      await expect(orderService.findById(invalidId)).rejects.toThrow(
        BadRequestException
      );
      await expect(orderService.findById(invalidId)).rejects.toThrow(
        "ID inválido"
      );
    });

    it("deve lançar NotFoundException se pedido não existe", async () => {
      const id = "507f1f77bcf86cd799439011";

      vi.spyOn(MongoIdValidator, "isValid").mockReturnValue(true);
      vi.spyOn(orderRepository, "findById").mockResolvedValue(null);

      await expect(orderService.findById(id)).rejects.toThrow(
        NotFoundException
      );
      await expect(orderService.findById(id)).rejects.toThrow(
        "Pedido não encontrado"
      );
    });
  });

  describe("findAll", () => {
    it("deve retornar lista paginada de pedidos", async () => {
      const mockOrders = [
        {
          _id: "1",
          lab: "Lab 1",
          state: OrderState.CREATED,
          services: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: "2",
          lab: "Lab 2",
          state: OrderState.ANALYSIS,
          services: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResult = {
        data: mockOrders,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      vi.spyOn(orderRepository, "findAll").mockResolvedValue(mockResult as any);

      const result = await orderService.findAll({ page: 1, limit: 10 });

      expect(orderRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        state: undefined,
      });
      expect(result.data).toHaveLength(2);
    });

    it("deve filtrar pedidos por estado", async () => {
      const mockResult = {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      vi.spyOn(orderRepository, "findAll").mockResolvedValue(mockResult as any);

      await orderService.findAll({
        page: 1,
        limit: 10,
        state: OrderState.COMPLETED,
      });

      expect(orderRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        state: OrderState.COMPLETED,
      });
    });
  });

  describe("advance", () => {
    it("deve avançar estado do pedido", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockOrder = {
        _id: id,
        lab: "Lab Test",
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        services: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedOrder = {
        ...mockOrder,
        state: OrderState.ANALYSIS,
      };

      vi.spyOn(MongoIdValidator, "isValid").mockReturnValue(true);
      vi.spyOn(orderRepository, "findById").mockResolvedValue(mockOrder as any);
      vi.spyOn(OrderStateMachine, "isFinalState").mockReturnValue(false);
      vi.spyOn(OrderStateMachine, "advance").mockReturnValue(
        OrderState.ANALYSIS
      );
      vi.spyOn(orderRepository, "updateState").mockResolvedValue(
        updatedOrder as any
      );

      const result = await orderService.advance(id);

      expect(OrderStateMachine.advance).toHaveBeenCalledWith(
        OrderState.CREATED
      );
      expect(orderRepository.updateState).toHaveBeenCalledWith(
        id,
        OrderState.ANALYSIS
      );
      expect(result.state).toBe(OrderState.ANALYSIS);
    });

    it("deve lançar BadRequestException se pedido já está em estado final", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockOrder = {
        _id: id,
        lab: "Lab Test",
        state: OrderState.COMPLETED,
        status: OrderStatus.ACTIVE,
        services: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(MongoIdValidator, "isValid").mockReturnValue(true);
      vi.spyOn(orderRepository, "findById").mockResolvedValue(mockOrder as any);
      vi.spyOn(OrderStateMachine, "isFinalState").mockReturnValue(true);

      await expect(orderService.advance(id)).rejects.toThrow(
        BadRequestException
      );
      await expect(orderService.advance(id)).rejects.toThrow(
        "Pedido já está no estado final: COMPLETED"
      );
    });

    it("deve lançar NotFoundException se atualização falhar", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockOrder = {
        _id: id,
        lab: "Lab Test",
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        services: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(MongoIdValidator, "isValid").mockReturnValue(true);
      vi.spyOn(orderRepository, "findById").mockResolvedValue(mockOrder as any);
      vi.spyOn(OrderStateMachine, "isFinalState").mockReturnValue(false);
      vi.spyOn(OrderStateMachine, "advance").mockReturnValue(
        OrderState.ANALYSIS
      );
      vi.spyOn(orderRepository, "updateState").mockResolvedValue(null);

      await expect(orderService.advance(id)).rejects.toThrow(NotFoundException);
      await expect(orderService.advance(id)).rejects.toThrow(
        "Falha ao atualizar pedido"
      );
    });
  });

  describe("softDelete", () => {
    it("deve deletar pedido que não está completo", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockOrder = {
        _id: id,
        lab: "Lab Test",
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        services: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(MongoIdValidator, "isValid").mockReturnValue(true);
      vi.spyOn(orderRepository, "findById").mockResolvedValue(mockOrder as any);
      vi.spyOn(orderRepository, "softDelete").mockResolvedValue(
        mockOrder as any
      );

      await orderService.softDelete(id);

      expect(orderRepository.softDelete).toHaveBeenCalledWith(id);
    });

    it("deve lançar BadRequestException ao tentar deletar pedido completo", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockOrder = {
        _id: id,
        lab: "Lab Test",
        state: OrderState.COMPLETED,
        status: OrderStatus.ACTIVE,
        services: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(MongoIdValidator, "isValid").mockReturnValue(true);
      vi.spyOn(orderRepository, "findById").mockResolvedValue(mockOrder as any);

      await expect(orderService.softDelete(id)).rejects.toThrow(
        BadRequestException
      );
      await expect(orderService.softDelete(id)).rejects.toThrow(
        "Não é possível excluir um pedido já concluído"
      );
    });

    it("deve lançar NotFoundException se soft delete falhar", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockOrder = {
        _id: id,
        lab: "Lab Test",
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        services: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(MongoIdValidator, "isValid").mockReturnValue(true);
      vi.spyOn(orderRepository, "findById").mockResolvedValue(mockOrder as any);
      vi.spyOn(orderRepository, "softDelete").mockResolvedValue(null);

      await expect(orderService.softDelete(id)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
