import { describe, it, expect, beforeEach, vi } from "vitest";
import { OrderRepository } from "./order.repository";
import { Order } from "../models/order";
import { CreateOrderDto } from "../dtos/order.dto";
import { OrderState, OrderStatus } from "../types/enums";

vi.mock("../models/order");

describe("OrderRepository", () => {
  let orderRepository: OrderRepository;

  beforeEach(() => {
    orderRepository = new OrderRepository();
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("deve criar um novo pedido", async () => {
      const orderData: CreateOrderDto = {
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
        save: vi.fn().mockResolvedValue({
          _id: "507f1f77bcf86cd799439011",
          ...orderData,
          state: OrderState.CREATED,
          status: OrderStatus.ACTIVE,
        }),
      };

      vi.mocked(Order).mockImplementation(() => mockOrder as any);

      await orderRepository.create(orderData);

      expect(Order).toHaveBeenCalledWith({
        ...orderData,
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
      });
      expect(mockOrder.save).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("deve buscar pedido por ID", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockOrder = {
        _id: id,
        lab: "Lab Test",
        state: OrderState.CREATED,
      };

      Order.findById = vi.fn().mockResolvedValue(mockOrder);

      const result = await orderRepository.findById(id);

      expect(Order.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockOrder);
    });

    it("deve retornar null se pedido não existir", async () => {
      Order.findById = vi.fn().mockResolvedValue(null);

      const result = await orderRepository.findById("507f1f77bcf86cd799439011");

      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("deve retornar pedidos paginados", async () => {
      const mockOrders = [
        { _id: "1", lab: "Lab 1", state: OrderState.CREATED },
        { _id: "2", lab: "Lab 2", state: OrderState.ANALYSIS },
      ];

      const mockSort = vi.fn().mockResolvedValue(mockOrders);
      const mockLimit = vi.fn().mockReturnValue({ sort: mockSort });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFind = vi.fn().mockReturnValue({ skip: mockSkip });
      Order.find = mockFind;
      Order.countDocuments = vi.fn().mockResolvedValue(2);

      const result = await orderRepository.findAll({ page: 1, limit: 10 });

      expect(mockFind).toHaveBeenCalledWith({ status: OrderStatus.ACTIVE });
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(result.data).toEqual(mockOrders);
      expect(result.pagination.totalItems).toBe(2);
    });

    it("deve filtrar pedidos por estado", async () => {
      const mockSort = vi.fn().mockResolvedValue([]);
      const mockLimit = vi.fn().mockReturnValue({ sort: mockSort });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFind = vi.fn().mockReturnValue({ skip: mockSkip });
      Order.find = mockFind;
      Order.countDocuments = vi.fn().mockResolvedValue(0);

      await orderRepository.findAll({
        page: 1,
        limit: 10,
        state: OrderState.COMPLETED,
      });

      expect(mockFind).toHaveBeenCalledWith({
        status: OrderStatus.ACTIVE,
        state: OrderState.COMPLETED,
      });
    });
  });

  describe("updateState", () => {
    it("deve atualizar o estado do pedido", async () => {
      const id = "507f1f77bcf86cd799439011";
      const newState = OrderState.ANALYSIS;
      const mockOrder = {
        _id: id,
        state: newState,
      };

      Order.findByIdAndUpdate = vi.fn().mockResolvedValue(mockOrder);

      const result = await orderRepository.updateState(id, newState);

      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { state: newState, updatedAt: expect.any(Date) },
        { new: true }
      );
      expect(result).toEqual(mockOrder);
    });
  });

  describe("softDelete", () => {
    it("deve fazer soft delete do pedido", async () => {
      const id = "507f1f77bcf86cd799439011";
      const mockOrder = {
        _id: id,
        status: OrderStatus.DELETED,
      };

      Order.findByIdAndUpdate = vi.fn().mockResolvedValue(mockOrder);

      const result = await orderRepository.softDelete(id);

      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { status: OrderStatus.DELETED, updatedAt: expect.any(Date) },
        { new: true }
      );
      expect(result).toEqual(mockOrder);
    });
  });

  describe("existsById", () => {
    it("deve retornar true se pedido existe e está ativo", async () => {
      Order.findOne = vi
        .fn()
        .mockResolvedValue({ _id: "507f1f77bcf86cd799439011" });

      const result = await orderRepository.existsById(
        "507f1f77bcf86cd799439011"
      );

      expect(result).toBe(true);
      expect(Order.findOne).toHaveBeenCalledWith({
        _id: "507f1f77bcf86cd799439011",
        status: OrderStatus.ACTIVE,
      });
    });

    it("deve retornar false se pedido não existe", async () => {
      Order.findOne = vi.fn().mockResolvedValue(null);

      const result = await orderRepository.existsById(
        "507f1f77bcf86cd799439011"
      );

      expect(result).toBe(false);
    });
  });
});
