// schema/auth.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, { message: "Username wajib diisi" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
  role: z.enum(["User", "Admin"], {
    required_error: "Role wajib diisi",
    invalid_type_error: "Role tidak valid",
  }),
});

export const registerSchema = z
  .object({
    username: z.string().min(1, { message: "Username wajib diisi" }).min(3, { message: "Username minimal 3 karakter" }),
    password: z.string().min(6, { message: "Password minimal 6 karakter" }),
    confirmPassword: z.string().min(1, { message: "Konfirmasi password wajib diisi" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
