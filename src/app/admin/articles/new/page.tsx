// src/app/articles/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react";
import { articlesApi, Article, Category } from "@/lib/articles-api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArticleInput } from "@/schema/articles.schema";
import { z } from "zod";
import { getCategories } from "@/lib/category-api";
import api from "@/lib/api";

// Extended schema to include image
const ArticleInputWithImage = ArticleInput.extend({
  image: z.any().optional(),
});

export default function CreateArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof ArticleInputWithImage>>({
    resolver: zodResolver(ArticleInputWithImage),
    defaultValues: {
      title: "",
      content: "",
      categoryId: "",
      image: undefined,
    },
  });

  // Fetch categories on component mount
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Gagal memuat kategori", {
        description: "Terjadi kesalahan saat memuat data kategori",
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("File tidak valid", {
          description: "Hanya file gambar yang diperbolehkan",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File terlalu besar", {
          description: "Ukuran file maksimal 5MB",
        });
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to server
  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("https://test-fe.mysellerpintar.com/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.url || response.data.imageUrl || response.data.data?.url;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("Gagal mengupload gambar", {
        description: error?.response?.data?.message || "Terjadi kesalahan saat mengupload gambar",
      });
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadedImageUrl(null);
    const fileInput = document.getElementById("image-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = async (values: z.infer<typeof ArticleInputWithImage>) => {
    try {
      setLoading(true);

      let imageUrl = uploadedImageUrl;

      // Upload image if selected
      if (imageFile && !uploadedImageUrl) {
        imageUrl = await uploadImage(imageFile);
        setUploadedImageUrl(imageUrl);
      }

      const articleData = {
        title: values.title,
        content: values.content,
        categoryId: values.categoryId,
        ...(imageUrl && { imageUrl }), 
      };

      await articlesApi.createArticle(articleData);

      toast.success("Artikel berhasil dibuat!", {
        description: "Artikel baru telah ditambahkan ke sistem",
      });

      form.reset();
      removeImage();
    } catch (error: any) {
      console.error("Error creating article:", error);

      toast.error("Gagal membuat artikel", {
        description: error?.response?.data?.message || "Terjadi kesalahan saat membuat artikel",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar activeSection="articles" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Content Management</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/articles">Articles</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Tambah Artikel</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Tambah Artikel</h1>
                <p className="text-muted-foreground">Buat artikel baru untuk dipublikasikan</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Artikel</CardTitle>
                <CardDescription>Isi form di bawah ini untuk membuat artikel baru</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Title Field */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Judul Artikel *</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan judul artikel..." {...field} disabled={loading} />
                          </FormControl>
                          <FormDescription>Judul artikel yang menarik dan deskriptif</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Image Upload Field */}
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gambar Artikel</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              {/* Upload Button */}
                              {!imagePreview && (
                                <div className="flex items-center gap-4">
                                  <Input id="image-upload" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" disabled={loading || uploadingImage} />
                                  <Button type="button" variant="outline" onClick={() => document.getElementById("image-upload")?.click()} disabled={loading || uploadingImage} className="flex items-center gap-2">
                                    {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    {uploadingImage ? "Mengupload..." : "Pilih Gambar"}
                                  </Button>
                                </div>
                              )}

                              {/* Image Preview */}
                              {imagePreview && (
                                <div className="relative">
                                  <div className="relative w-full max-w-md">
                                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border" />
                                    <Button type="button" variant="destructive" size="sm" onClick={removeImage} className="absolute top-2 right-2 h-8 w-8 p-0" disabled={loading}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                    <ImageIcon className="h-4 w-4" />
                                    <span>{imageFile?.name}</span>
                                    <span>({Math.round((imageFile?.size || 0) / 1024)} KB)</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>Upload gambar untuk artikel (opsional). Format yang didukung: JPG, PNG, GIF. Maksimal 5MB.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Category Field */}
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading || categoriesLoading}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori artikel" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categoriesLoading ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  <span className="text-sm">Memuat kategori...</span>
                                </div>
                              ) : categories.length === 0 ? (
                                <div className="py-4 text-center text-sm text-muted-foreground">Tidak ada kategori tersedia</div>
                              ) : (
                                categories
                                  .filter((category) => category.id && category.id.trim() !== "")
                                  .map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      {category.name}
                                    </SelectItem>
                                  ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>Pilih kategori yang sesuai dengan artikel</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Content Field */}
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Konten Artikel *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Tulis konten artikel di sini..." className="min-h-[200px] resize-none" {...field} disabled={loading} />
                          </FormControl>
                          <FormDescription>Konten lengkap artikel yang akan dipublikasikan</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <div className="flex items-center gap-4 pt-4">
                      <Button type="submit" disabled={loading || categoriesLoading || uploadingImage} className="flex items-center gap-2">
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Menyimpan..." : "Simpan Artikel"}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          form.reset();
                          removeImage();
                        }}
                        disabled={loading}
                      >
                        Reset Form
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
