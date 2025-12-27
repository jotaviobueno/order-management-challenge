import { Order } from "../models/order";
import { IOrder } from "../types/order.types";
import { CreateOrderDTO } from "../dtos/order.dto";
import { OrderState, OrderStatus } from "../types/enums";
import { PaginationOptions, PaginatedResult } from "../types/pagination.types";

export interface OrderPaginationOptions extends PaginationOptions {
  state?: OrderState;
}

export class OrderRepository {
  async create(data: CreateOrderDTO): Promise<IOrder> {
    const order = new Order({
      ...data,
      state: OrderState.CREATED,
      status: OrderStatus.ACTIVE,
    });
    return order.save();
  }

  async findById(id: string): Promise<IOrder | null> {
    return Order.findById(id);
  }

  async findAll(
    options: OrderPaginationOptions
  ): Promise<PaginatedResult<IOrder>> {
    const { page, limit, state } = options;
    const skip = (page - 1) * limit;

    const filter: any = { status: OrderStatus.ACTIVE };
    if (state) {
      filter.state = state;
    }

    const [data, totalItems] = await Promise.all([
      Order.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async updateState(id: string, state: OrderState): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(
      id,
      { state, updatedAt: new Date() },
      { new: true }
    );
  }

  async softDelete(id: string): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(
      id,
      { status: OrderStatus.DELETED, updatedAt: new Date() },
      { new: true }
    );
  }

  async existsById(id: string): Promise<boolean> {
    const order = await Order.findOne({
      _id: id,
      status: OrderStatus.ACTIVE,
    });
    return !!order;
  }
}
