// src/schema/category.schema.ts
import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Nama category wajib diisi").min(2, "Nama category minimal 2 karakter").max(100, "Nama category maksimal 100 karakter").trim(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
