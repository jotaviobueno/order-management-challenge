import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type ListUsersQueryDto = z.infer<typeof listUsersQuerySchema>;
