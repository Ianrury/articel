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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Upload, X, Image as ImageIcon, Camera, FileImage, Check, AlertCircle } from "lucide-react";
import { articlesApi, Category } from "@/lib/articles-api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArticleInput } from "@/schema/articles.schema";
import { z } from "zod";
import { getCategories } from "@/lib/category-api";
import api from "@/lib/api";
import { Editor } from "@tinymce/tinymce-react";

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

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

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // Process selected file
  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File tidak valid", {
        description: "Hanya file gambar yang diperbolehkan (JPG, PNG, GIF, WebP)",
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
  };

  // Upload image to server with progress
  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploadingImage(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("image", file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await api.post("https://test-fe.mysellerpintar.com/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);

      return response.data.url || response.data.imageUrl || response.data.data?.url;
    } catch (error: unknown) {
      console.error("Error uploading image:", error);
      setUploadProgress(0);
      toast.error("Gagal mengupload gambar", {
        description:  "Terjadi kesalahan saat mengupload gambar",
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
    setUploadProgress(0);
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
    } catch (error: unknown) {
      console.error("Error creating article:", error);

      toast.error("Gagal membuat artikel", {
        description: "Terjadi kesalahan saat membuat artikel",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

                    {/* Beautiful Image Upload Field */}
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gambar Artikel</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              {!imagePreview ? (
                                /* Upload Area */
                                <div
                                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                                    dragActive ? "border-blue-400 bg-blue-50 scale-105" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                  } ${uploadingImage ? "pointer-events-none opacity-75" : "cursor-pointer"}`}
                                  onDragEnter={handleDrag}
                                  onDragLeave={handleDrag}
                                  onDragOver={handleDrag}
                                  onDrop={handleDrop}
                                  onClick={() => !uploadingImage && document.getElementById("image-upload")?.click()}
                                >
                                  {uploadingImage ? (
                                    <div className="space-y-4">
                                      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                      </div>
                                      <div className="space-y-2">
                                        <p className="text-lg font-medium text-gray-900">Mengupload gambar...</p>
                                        <div className="w-full max-w-xs mx-auto">
                                          <Progress value={uploadProgress} className="h-2" />
                                          <p className="text-sm text-gray-500 mt-1">{uploadProgress}%</p>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                      <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors ${dragActive ? "bg-blue-100" : "bg-gray-100"}`}>
                                        {dragActive ? <Upload className={`h-8 w-8 text-blue-600`} /> : <ImageIcon className="h-8 w-8 text-gray-400" />}
                                      </div>

                                      <div className="space-y-2">
                                        <p className="text-lg font-medium text-gray-900">{dragActive ? "Lepaskan file di sini" : "Upload gambar artikel"}</p>
                                        <p className="text-sm text-gray-500">Drag & drop gambar atau klik untuk memilih</p>

                                        <div className="flex items-center justify-center gap-4 pt-2">
                                          <Badge variant="secondary" className="text-xs">
                                            <FileImage className="h-3 w-3 mr-1" />
                                            JPG, PNG, GIF
                                          </Badge>
                                          <Badge variant="secondary" className="text-xs">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Max 5MB
                                          </Badge>
                                        </div>
                                      </div>

                                      <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-4"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          document.getElementById("image-upload")?.click();
                                        }}
                                      >
                                        <Camera className="h-4 w-4 mr-2" />
                                        Pilih dari Galeri
                                      </Button>
                                    </div>
                                  )}

                                  <Input id="image-upload" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" disabled={loading || uploadingImage} name={field.name} ref={field.ref}/>
                                </div>
                              ) : (
                                /* Image Preview */
                                <div className="space-y-4">
                                  <div className="relative group">
                                    <div className="relative overflow-hidden rounded-xl border border-gray-200">
                                      <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover transition-transform group-hover:scale-105" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="flex gap-2">
                                          <Button type="button" size="sm" variant="secondary" onClick={() => document.getElementById("image-upload")?.click()} disabled={loading || uploadingImage}>
                                            <Camera className="h-4 w-4 mr-2" />
                                            Ganti
                                          </Button>
                                          <Button type="button" size="sm" variant="destructive" onClick={removeImage} disabled={loading || uploadingImage}>
                                            <X className="h-4 w-4 mr-2" />
                                            Hapus
                                          </Button>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Upload Success Badge */}
                                    {uploadedImageUrl && (
                                      <div className="absolute top-3 right-3">
                                        <Badge className="bg-green-500 hover:bg-green-500">
                                          <Check className="h-3 w-3 mr-1" />
                                          Uploaded
                                        </Badge>
                                      </div>
                                    )}
                                  </div>

                                  {/* File Info */}
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                          <FileImage className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-gray-900 text-sm truncate max-w-[200px]">{imageFile?.name}</p>
                                          <p className="text-xs text-gray-500">{imageFile && formatFileSize(imageFile.size)}</p>
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        {uploadedImageUrl ? (
                                          <Badge variant="outline" className="text-green-600 border-green-200">
                                            <Check className="h-3 w-3 mr-1" />
                                            Ready
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Pending
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <Input id="image-upload" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" disabled={loading || uploadingImage} />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>Upload gambar untuk artikel (opsional). Gambar akan digunakan sebagai thumbnail dan header artikel.</FormDescription>
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

                    {/* Content Field dengan TinyMCE */}
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Konten Artikel *</FormLabel>
                            <FormControl>
                            <Editor
                              apiKey="x1gjxqlg8mnu43nbkq1sroyifultqvt11tn6m2856a0ouvq2"
                              value={field.value}
                              onEditorChange={(content: string) => field.onChange(content)}
                              disabled={loading}
                              init={{
                              height: 400,
                              menubar: false,
                              plugins: [
                                "advlist",
                                "autolink",
                                "lists",
                                "link",
                                "image",
                                "charmap",
                                "anchor",
                                "searchreplace",
                                "visualblocks",
                                "code",
                                "fullscreen",
                                "insertdatetime",
                                "media",
                                "table",
                                "preview",
                                "help",
                                "wordcount",
                              ] as string[],
                              toolbar:
                                "undo redo | blocks | " +
                                "bold italic forecolor | alignleft aligncenter " +
                                "alignright alignjustify | bullist numlist outdent indent | " +
                                "removeformat | help",
                              content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                              placeholder: "Tulis konten artikel di sini...",
                              } as Record<string, unknown>}
                            />
                            </FormControl>
                          <FormDescription>Konten lengkap artikel yang akan dipublikasikan (mendukung rich text formatting)</FormDescription>
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
