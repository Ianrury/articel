// src/schema/articles.schema.ts
import { z } from "zod";

export const ArticleInput = z.object({
  title: z.string().min(1, "Judul artikel wajib diisi").min(5, "Judul artikel minimal 5 karakter").max(200, "Judul artikel maksimal 200 karakter"),

  content: z.string().min(1, "Konten artikel wajib diisi").min(10, "Konten artikel minimal 10 karakter").max(10000, "Konten artikel maksimal 10000 karakter"),

  categoryId: z.string().min(1, "Kategori wajib dipilih").uuid("Format kategori tidak valid"),
});

export type ArticleInputType = z.infer<typeof ArticleInput>;
