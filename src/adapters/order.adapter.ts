import { IOrder, IOrderResponse } from "../types/order.types";

export class OrderAdapter {
  toResponse(order: IOrder): IOrderResponse {
    return {
      id: order._id.toString(),
      lab: order.lab,
      patient: order.patient,
      customer: order.customer,
      state: order.state,
      status: order.status,
      services: order.services,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  toResponseList(orders: IOrder[]): IOrderResponse[] {
    return orders.map((order) => this.toResponse(order));
  }
}
