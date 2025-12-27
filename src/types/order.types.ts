import { Document } from "mongoose";
import { OrderState, OrderStatus, ServiceStatus } from "./enums";

export interface IService {
  name: string;
  value: number;
  status: ServiceStatus;
}

export interface IOrder extends Document {
  lab: string;
  patient: string;
  customer: string;
  state: OrderState;
  status: OrderStatus;
  services: IService[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderResponse {
  id: string;
  lab: string;
  patient: string;
  customer: string;
  state: OrderState;
  status: OrderStatus;
  services: IService[];
  createdAt: Date;
  updatedAt: Date;
}
