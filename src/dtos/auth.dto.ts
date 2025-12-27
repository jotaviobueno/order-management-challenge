import { z } from "zod";

export const loginUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginUserDto = z.infer<typeof loginUserSchema>;
