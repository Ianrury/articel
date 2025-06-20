// src/app/articles/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, ChevronLeft, ChevronRight, Loader2, Pencil, Trash, AlertTriangle, Eye, User, LogOut } from "lucide-react";
import { articlesApi, Article, ArticlesResponse } from "@/lib/articles-api";
import Link from "next/link";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUser, UserProfile } from "@/lib/user-api";
import { useRouter } from "next/navigation";

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
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authRole");

    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "authRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    router.push("/login");
  };
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
  const getuser = async () => {
    try {
      const data = await getUser();
      setUser(data);
      console.log("User:", data);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  };

  React.useEffect(() => {
    setSelectedCategory("all");
    getuser();
  }, []);


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
    <div>
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
            {/* User Dropdown */}
            <div className="ml-auto flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
                  <Avatar className="h-8 w-8 rounded-5 bg-gray-400">
                    <AvatarFallback className="text-gray-400 text-sm font-medium">{user?.username?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                  </Avatar>
                  <span className="text-gray-700 border-b border-gray-400">{user?.username || "Loading..."}</span>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-48 bg-white border border-gray-200 shadow-lg rounded-lg" align="end">
                  <Link href={`/admin/detail-profile/${user?.id || ""}`} passHref>
                    <DropdownMenuItem className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>My Account</span>
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuItem className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-red-600 hover:text-red-700" onClick={() => setShowLogoutDialog(true)}>
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
                              <h3 className="font-medium text-gray-900 line-clamp-2">{truncateContent(article.title, 50)}</h3>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{truncateContent(article.content, 50)}</p>
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
                              <Link href={`/admin/articles/show/${article.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Show
                                </Button>
                              </Link>
                              <Link href={`/admin/articles/edit/${article.id}`}>
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
                <DialogDescription>
                  Are you sure you want to delete the article &quot;<strong>{deleteDialog.articleTitle}</strong>&quot;? This action cannot be undone.
                </DialogDescription>
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
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
            <AlertDialogDescription>Apakah Anda yakin ingin keluar dari aplikasi? Anda perlu login kembali untuk mengakses akun Anda.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Ya, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
