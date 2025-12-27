import { z } from "zod";
import { OrderState, ServiceStatus } from "../types/enums";

export const serviceSchema = z.object({
  name: z.string().min(1, "Nome do serviço é obrigatório"),
  value: z.number().positive("Valor deve ser positivo"),
  status: z.nativeEnum(ServiceStatus).default(ServiceStatus.PENDING),
});

export const createOrderSchema = z
  .object({
    lab: z.string().min(1, "Lab é obrigatório"),
    patient: z.string().min(1, "Paciente é obrigatório"),
    customer: z.string().min(1, "Cliente é obrigatório"),
    services: z
      .array(serviceSchema)
      .min(1, "Pelo menos um serviço é obrigatório"),
  })
  .refine(
    (data) => {
      const totalValue = data.services.reduce(
        (sum, service) => sum + service.value,
        0
      );
      return totalValue > 0;
    },
    {
      message: "O valor total dos serviços deve ser maior que zero",
    }
  );

export const listOrdersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  state: z.nativeEnum(OrderState).optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type ListOrdersQueryDto = z.infer<typeof listOrdersQuerySchema>;
