// src/app/articles/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { articlesApi, Article, Category, ArticlesResponse } from "@/lib/articles-api";
import Link from "next/link";

// Mock data for demonstration - REMOVE THIS WHEN API IS WORKING
const mockArticles: Article[] = [];

// Custom hook for debounced search
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const ITEMS_PER_PAGE = 10;

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Fetch articles from API
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      if (selectedCategory !== "all") {
        const category = categories.find((cat) => cat.name === selectedCategory);
        if (category) {
          params.categoryId = category.id;
        }
      }

      const response: ArticlesResponse = await articlesApi.getArticles(params);

      setArticles(response.data);
      setTotalArticles(response.total);
      setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await articlesApi.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0 || selectedCategory === "all") {
      fetchArticles();
    }
  }, [currentPage, debouncedSearchTerm, selectedCategory, categories]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedCategory, debouncedSearchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    return content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
  };

  const getCategoryColor = (categoryName: string) => {
    const colors = {
      Technology: "bg-blue-100 text-blue-800 border-blue-200",
      Design: "bg-purple-100 text-purple-800 border-purple-200",
      Development: "bg-green-100 text-green-800 border-green-200",
      Business: "bg-orange-100 text-orange-800 border-orange-200",
      Marketing: "bg-pink-100 text-pink-800 border-pink-200",
    };
    return colors[categoryName as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
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
                <BreadcrumbPage>Articles</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Articles Management</h1>
                <p className="text-muted-foreground">Total Articles: {totalArticles}</p>
              </div>
              <Link href="/admin/articles/new">
                <Button>Create New Article</Button>
              </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Articles Table */}
          <div className="border rounded-lg bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left p-4 font-medium text-gray-900">Thumbnails</th>
                    <th className="text-left p-4 font-medium text-gray-900">Title</th>
                    <th className="text-left p-4 font-medium text-gray-900">Category</th>
                    <th className="text-left p-4 font-medium text-gray-900">Created at</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Loading articles...</span>
                        </div>
                      </td>
                    </tr>
                  ) : articles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12">
                        <div className="text-center">
                          <p className="text-lg font-medium text-muted-foreground">No articles found</p>
                          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    articles.map((article, index) => (
                      <tr key={article.id} className={`border-b hover:bg-gray-50/50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                        {/* Thumbnail */}
                        <td className="p-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg font-bold text-blue-600">{article.title.charAt(0)}</span>
                          </div>
                        </td>

                        {/* Title */}
                        <td className="p-4">
                          <div className="max-w-md">
                            <h3 className="font-medium text-gray-900 line-clamp-2">{article.title}</h3>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4">
                          <Badge variant="outline" className={getCategoryColor(article.category.name)}>
                            {article.category.name}
                          </Badge>
                        </td>

                        {/* Created at */}
                        <td className="p-4">
                          <span className="text-sm text-gray-600">{formatDate(article.createdAt)}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalArticles)} of {totalArticles} results
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first page, last page, current page, and pages around current
                      return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {/* Show ellipsis if there's a gap */}
                        {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 text-muted-foreground">...</span>}
                        <Button variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)} className="w-8 h-8">
                          {page}
                        </Button>
                      </React.Fragment>
                    ))}
                </div>

                <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
