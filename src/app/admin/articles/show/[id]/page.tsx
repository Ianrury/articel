// src/app/articles/show/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent,  CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Calendar, User, Tag, Eye } from "lucide-react";
import { articlesApi, Article } from "@/lib/articles-api";
import { toast } from "sonner";
import { useParams } from "next/navigation";

export default function ShowArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchArticle = async (articleId: string) => {
    try {
      setLoading(true);
      const response = await articlesApi.getArticleById(articleId);
      setArticle(response);
    } catch (error) {
      console.error("Error fetching article:", error);
      toast.error("Gagal memuat artikel", {
        description: "Terjadi kesalahan saat memuat artikel",
      });
      router.push("/admin/articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchArticle(id);
    }
  }, [id]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show loading state
  if (loading) {
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
                  <BreadcrumbLink href="/admin/articles">Articles</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Detail Article</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">Memuat artikel...</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Show error state if article not found
  if (!article) {
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
                  <BreadcrumbLink href="/admin/articles">Articles</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Article Not Found</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h2>
                <p className="text-gray-600 mb-4">Artikel yang Anda cari tidak ditemukan.</p>
                <Button onClick={() => router.push("/admin/articles")} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Articles
                </Button>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
                <BreadcrumbLink href="/admin/articles">Articles</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Detail Article</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Detail Article</h1>
              <p className="text-muted-foreground">Detail lengkap artikel yang dipublikasikan</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push(`/admin/articles/edit/${article.id}`)} className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Edit Article
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
            </div>
          </div>

          {/* Article Content */}
          <div className="max-w-5xl mx-auto w-full">
            <Card>
              <CardHeader className="space-y-4">
                {/* Article Image */}
                {article.imageUrl && (
                  <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden">
                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                )}
                {/* Article Title */}
                <div>
                  <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">{article.title}</CardTitle>
                </div>
                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.createdAt)}</span>
                  </div>

                  {article.user.username && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{article.user.username}</span>
                    </div>
                  )}

                  {article.category && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      <Badge variant="secondary">{article.category.name}</Badge>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {/* Article Content */}
                <div
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-blockquote:text-gray-700 prose-code:text-gray-800 prose-pre:bg-gray-100"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
