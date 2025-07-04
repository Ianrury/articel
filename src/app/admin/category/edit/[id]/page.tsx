// src/app/categories/edit/[id]/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowLeft, Check } from "lucide-react";
import { updateCategory, getCategoryErrorMessage, CategoryApiError } from "@/lib/category-api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, CategoryFormData } from "@/schema/category.schema";
import { useParams } from "next/navigation";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  // Submit handler for updating category
  const onSubmit = async (data: CategoryFormData) => {
    try {
      setLoading(true);

      const updatedCategory = await updateCategory(id, data);

      toast.success(`Category "${updatedCategory.name}" berhasil diperbarui!`);
      router.push("/admin/category");
      router.refresh();
    } catch (error) {
      console.error("Error updating category:", error);
      const errorMessage = getCategoryErrorMessage(error as CategoryApiError);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.reset();
    toast.info("Form telah direset");
  };

  return (
    <SidebarProvider>
      <AppSidebar activeSection="categories" />
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
                <BreadcrumbLink href="/admin/category">Categories</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Category</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
                <p className="text-muted-foreground">Masukkan nama baru untuk category</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2" disabled={loading}>
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle>Update Category</CardTitle>
                <CardDescription>Masukkan nama baru untuk category yang akan diperbarui</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name Field */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Category Baru *</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nama category baru..." {...field} disabled={loading} className="max-w-md" />
                          </FormControl>
                          <FormDescription>Nama baru category yang akan menggantikan nama sebelumnya (2-100 karakter)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit Buttons */}
                    <div className="flex items-center gap-4 pt-4">
                      <Button type="submit" disabled={loading || !form.formState.isValid} className="flex items-center gap-2">
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Memperbarui...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Perbarui Category
                          </>
                        )}
                      </Button>

                      <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
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
