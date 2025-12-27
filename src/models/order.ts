import mongoose, { Schema } from "mongoose";
import { IOrder, IService } from "../types/order.types";
import { OrderState, OrderStatus, ServiceStatus } from "../types/enums";

const serviceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: [true, "Nome do serviço é obrigatório"],
      trim: true,
    },
    value: {
      type: Number,
      required: [true, "Valor do serviço é obrigatório"],
      min: [0, "Valor não pode ser negativo"],
    },
    status: {
      type: String,
      enum: Object.values(ServiceStatus),
      default: ServiceStatus.PENDING,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    lab: {
      type: String,
      required: [true, "Lab é obrigatório"],
      trim: true,
    },
    patient: {
      type: String,
      required: [true, "Paciente é obrigatório"],
      trim: true,
    },
    customer: {
      type: String,
      required: [true, "Cliente é obrigatório"],
      trim: true,
    },
    state: {
      type: String,
      enum: Object.values(OrderState),
      default: OrderState.CREATED,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.ACTIVE,
    },
    services: {
      type: [serviceSchema],
      required: [true, "Pelo menos um serviço é obrigatório"],
      validate: {
        validator: function (services: IService[]) {
          return services && services.length > 0;
        },
        message: "Pelo menos um serviço é obrigatório",
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);
