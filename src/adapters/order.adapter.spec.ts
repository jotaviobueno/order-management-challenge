import { describe, it, expect, beforeEach } from "vitest";
import { OrderAdapter } from "./order.adapter";
import { IOrder } from "../types/order.types";
import { OrderState, OrderStatus, ServiceStatus } from "../types/enums";

describe("OrderAdapter", () => {
  let orderAdapter: OrderAdapter;

  beforeEach(() => {
    orderAdapter = new OrderAdapter();
  });

  describe("toResponse", () => {
    it("deve converter IOrder para IOrderResponse", () => {
      const mockOrder = {
        _id: { toString: () => "order-id-123" },
        lab: "Lab ABC",
        patient: "João Silva",
        customer: "Hospital XYZ",
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        services: [
          {
            name: "Exame de Sangue",
            value: 150.0,
            status: ServiceStatus.PENDING,
          },
        ],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      } as any as IOrder;

      const result = orderAdapter.toResponse(mockOrder);

      expect(result).toEqual({
        id: "order-id-123",
        lab: "Lab ABC",
        patient: "João Silva",
        customer: "Hospital XYZ",
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        services: mockOrder.services,
        createdAt: mockOrder.createdAt,
        updatedAt: mockOrder.updatedAt,
      });
    });

    it("deve converter _id para string no campo id", () => {
      const mockObjectId = {
        toString: () => "507f1f77bcf86cd799439011",
      };

      const mockOrder = {
        _id: mockObjectId,
        lab: "Lab Test",
        patient: "Patient Test",
        customer: "Customer Test",
        state: OrderState.ANALYSIS,
        status: OrderStatus.ACTIVE,
        services: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any as IOrder;

      const result = orderAdapter.toResponse(mockOrder);

      expect(result.id).toBe("507f1f77bcf86cd799439011");
      expect(typeof result.id).toBe("string");
    });

    it("deve manter todos os campos do pedido na resposta", () => {
      const mockOrder = {
        _id: { toString: () => "order-456" },
        lab: "Laboratório Central",
        patient: "Maria Santos",
        customer: "Clínica Saúde",
        state: OrderState.COMPLETED,
        status: OrderStatus.ACTIVE,
        services: [
          {
            name: "Raio-X",
            value: 200.0,
            status: ServiceStatus.DONE,
          },
          {
            name: "Ultrassom",
            value: 300.0,
            status: ServiceStatus.DONE,
          },
        ],
        createdAt: new Date("2024-06-01"),
        updatedAt: new Date("2024-06-10"),
      } as any as IOrder;

      const result = orderAdapter.toResponse(mockOrder);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("lab");
      expect(result).toHaveProperty("patient");
      expect(result).toHaveProperty("customer");
      expect(result).toHaveProperty("state");
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("services");
      expect(result).toHaveProperty("createdAt");
      expect(result).toHaveProperty("updatedAt");
      expect(result.services).toHaveLength(2);
    });

    it("deve processar pedido com múltiplos serviços", () => {
      const services = [
        { name: "Serviço 1", value: 100, status: ServiceStatus.PENDING },
        { name: "Serviço 2", value: 200, status: ServiceStatus.PENDING },
        { name: "Serviço 3", value: 300, status: ServiceStatus.DONE },
      ];

      const mockOrder = {
        _id: { toString: () => "order-multi" },
        lab: "Lab Multi",
        patient: "Patient Multi",
        customer: "Customer Multi",
        state: OrderState.ANALYSIS,
        status: OrderStatus.ACTIVE,
        services,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any as IOrder;

      const result = orderAdapter.toResponse(mockOrder);

      expect(result.services).toEqual(services);
      expect(result.services).toHaveLength(3);
    });
  });

  describe("toResponseList", () => {
    it("deve converter array de IOrder para array de IOrderResponse", () => {
      const mockOrders = [
        {
          _id: { toString: () => "order-1" },
          lab: "Lab 1",
          patient: "Patient 1",
          customer: "Customer 1",
          state: OrderState.CREATED,
          status: OrderStatus.ACTIVE,
          services: [
            { name: "Service 1", value: 100, status: ServiceStatus.PENDING },
          ],
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        },
        {
          _id: { toString: () => "order-2" },
          lab: "Lab 2",
          patient: "Patient 2",
          customer: "Customer 2",
          state: OrderState.ANALYSIS,
          status: OrderStatus.ACTIVE,
          services: [
            {
              name: "Service 2",
              value: 200,
              status: ServiceStatus.PENDING,
            },
          ],
          createdAt: new Date("2024-02-01"),
          updatedAt: new Date("2024-02-02"),
        },
      ] as any as IOrder[];

      const result = orderAdapter.toResponseList(mockOrders);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("order-1");
      expect(result[0].lab).toBe("Lab 1");
      expect(result[1].id).toBe("order-2");
      expect(result[1].lab).toBe("Lab 2");
    });

    it("deve retornar array vazio quando receber array vazio", () => {
      const result = orderAdapter.toResponseList([]);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("deve processar corretamente array com um único pedido", () => {
      const mockOrder = {
        _id: { toString: () => "single-order-id" },
        lab: "Single Lab",
        patient: "Single Patient",
        customer: "Single Customer",
        state: OrderState.COMPLETED,
        status: OrderStatus.ACTIVE,
        services: [
          {
            name: "Single Service",
            value: 500,
            status: ServiceStatus.DONE,
          },
        ],
        createdAt: new Date("2024-03-01"),
        updatedAt: new Date("2024-03-02"),
      } as any as IOrder;

      const result = orderAdapter.toResponseList([mockOrder]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("single-order-id");
      expect(result[0].lab).toBe("Single Lab");
      expect(result[0].services).toHaveLength(1);
    });

    it("deve manter estrutura correta de todos os pedidos na lista", () => {
      const mockOrders = [
        {
          _id: { toString: () => "order-a" },
          lab: "Lab A",
          patient: "Patient A",
          customer: "Customer A",
          state: OrderState.CREATED,
          status: OrderStatus.ACTIVE,
          services: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: { toString: () => "order-b" },
          lab: "Lab B",
          patient: "Patient B",
          customer: "Customer B",
          state: OrderState.COMPLETED,
          status: OrderStatus.ACTIVE,
          services: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any as IOrder[];

      const result = orderAdapter.toResponseList(mockOrders);

      result.forEach((order, index) => {
        expect(order).toHaveProperty("id");
        expect(order).toHaveProperty("lab");
        expect(order).toHaveProperty("patient");
        expect(order).toHaveProperty("customer");
        expect(order).toHaveProperty("state");
        expect(order).toHaveProperty("status");
        expect(order).toHaveProperty("services");
        expect(order).toHaveProperty("createdAt");
        expect(order).toHaveProperty("updatedAt");
      });
    });

    it("deve processar pedidos com diferentes estados e status", () => {
      const mockOrders = [
        {
          _id: { toString: () => "order-state-1" },
          lab: "Lab State",
          patient: "Patient State",
          customer: "Customer State",
          state: OrderState.CREATED,
          status: OrderStatus.ACTIVE,
          services: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: { toString: () => "order-state-2" },
          lab: "Lab State",
          patient: "Patient State",
          customer: "Customer State",
          state: OrderState.ANALYSIS,
          status: OrderStatus.ACTIVE,
          services: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: { toString: () => "order-state-3" },
          lab: "Lab State",
          patient: "Patient State",
          customer: "Customer State",
          state: OrderState.COMPLETED,
          status: OrderStatus.ACTIVE,
          services: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any as IOrder[];

      const result = orderAdapter.toResponseList(mockOrders);

      expect(result).toHaveLength(3);
      expect(result[0].state).toBe(OrderState.CREATED);
      expect(result[1].state).toBe(OrderState.ANALYSIS);
      expect(result[2].state).toBe(OrderState.COMPLETED);
    });
  });
});
