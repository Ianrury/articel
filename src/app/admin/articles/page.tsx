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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, Pencil, Trash, AlertTriangle } from "lucide-react";
import { articlesApi, Article, Category, ArticlesResponse } from "@/lib/articles-api";
import Link from "next/link";
import { toast } from "sonner";

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
  const [allArticles, setAllArticles] = useState<Article[]>([]); // Store all articles
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    articleId: "",
    articleTitle: "",
    loading: false,
  });

  const ITEMS_PER_PAGE = 10;

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Fetch all articles once on component mount
  const fetchAllArticles = async () => {
    try {
      setLoading(true);
      const response: ArticlesResponse = await articlesApi.getArticles();
      setAllArticles(response.data);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast(
        <div>
          <div className="font-bold text-red-600">Error</div>
          <div>Failed to fetch articles. Please try again.</div>
        </div>
      );
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

  // Handle delete article with confirmation
  const handleDeleteArticle = (articleId: string, articleTitle: string) => {
    setDeleteDialog({
      open: true,
      articleId,
      articleTitle,
      loading: false,
    });
  };

  // Confirm delete article
  const confirmDeleteArticle = async () => {
    try {
      setDeleteDialog((prev) => ({ ...prev, loading: true }));

      await articlesApi.deleteArticle(deleteDialog.articleId);

      // Remove article from local state
      setAllArticles((prev) => prev.filter((article) => article.id !== deleteDialog.articleId));

      // Close dialog
      setDeleteDialog({
        open: false,
        articleId: "",
        articleTitle: "",
        loading: false,
      });

      toast(
        <div>
          <div className="font-bold text-green-600">Success</div>
          <div>Article deleted successfully.</div>
        </div>
      );

      // reset table
      fetchAllArticles();

      // Reset to first page if current page becomes empty
      const remainingArticles = allArticles.filter((article) => article.id !== deleteDialog.articleId);
      const maxPage = Math.ceil(remainingArticles.length / ITEMS_PER_PAGE);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }
    } catch (error) {
      console.error("Error deleting article:", error);

      setDeleteDialog((prev) => ({ ...prev, loading: false }));

      toast(
        <div>
          <div className="font-bold text-red-600">Error</div>
          <div>Failed to delete article. Please try again.</div>
        </div>
      );
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteDialog({
      open: false,
      articleId: "",
      articleTitle: "",
      loading: false,
    });
  };

  const filteredAndPaginatedArticles = useMemo(() => {
    let filtered = [...allArticles];

    if (debouncedSearchTerm) {
      filtered = filtered.filter((article) => article.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || article.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((article) => article.category.name === selectedCategory);
    }

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedArticles = filtered.slice(startIndex, endIndex);

    return {
      articles: paginatedArticles,
      total: totalFiltered,
      totalPages,
    };
  }, [allArticles, debouncedSearchTerm, selectedCategory, currentPage]);

  // Reset to first page when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory]);

  // Fetch data on component mount
  useEffect(() => {
    fetchAllArticles();
    fetchCategories();
  }, []);

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

  const { articles, total: totalArticles, totalPages } = filteredAndPaginatedArticles;

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
                <p className="text-muted-foreground">
                  Total Articles: {allArticles.length} | Filtered: {totalArticles}
                </p>
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
                  <Input placeholder="Search by title or content..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
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
                    <th className="text-left p-4 font-medium text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Loading articles...</span>
                        </div>
                      </td>
                    </tr>
                  ) : articles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <div className="text-center">
                          <p className="text-lg font-medium text-muted-foreground">No articles found</p>
                          <p className="text-sm text-muted-foreground mt-1">{debouncedSearchTerm || selectedCategory !== "all" ? "Try adjusting your search or filter criteria" : "No articles available"}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    articles.map((article, index) => (
                      <tr key={article.id} className={`border-b hover:bg-gray-50/50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                        {/* Thumbnail */}
                        <td className="p-4">
                          {article.imageUrl ? (
                            <img src={article.imageUrl} alt={article.title} className="w-12 h-12 object-cover rounded-md border" />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg font-bold text-blue-600">{article.title.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                        </td>

                        {/* Title */}
                        <td className="p-4">
                          <div className="max-w-md">
                            <h3 className="font-medium text-gray-900 line-clamp-2">{article.title}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{truncateContent(article.content, 100)}</p>
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

                        {/* Action */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/articles/${article.id}`}>
                              <Button variant="outline" size="sm">
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </Link>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteArticle(article.id, article.title)} disabled={deleteDialog.loading}>
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && cancelDelete()}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirm Delete
              </DialogTitle>
              <DialogDescription>Are you sure you want to delete the article "{deleteDialog.articleTitle}"? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={cancelDelete} disabled={deleteDialog.loading}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteArticle} disabled={deleteDialog.loading}>
                {deleteDialog.loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Article
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
