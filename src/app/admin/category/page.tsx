// src/app/categories/page.tsx
"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CategoriesResponse, getCategories, deleteCategory, Category, getCategoryErrorMessage, CategoryApiError } from "@/lib/category-api";
import { Plus, Search, Loader2, Pencil, Trash, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export default function CategoriesPage() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    categoryId: "",
    categoryName: "",
    loading: false,
  });

  // Fetch categories data once on component mount
  const fetchAllCategories = async () => {
    try {
      setLoading(true);
      const response: CategoriesResponse = await getCategories();
      setAllCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return allCategories;

    return allCategories.filter((category) => category.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allCategories, searchTerm]);

  const totalCategories = filteredCategories.length;
  const totalPages = Math.ceil(totalCategories / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const categories = filteredCategories.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteCategory = (id: string, name: string) => {
    setDeleteDialog({
      open: true,
      categoryId: id,
      categoryName: name,
      loading: false,
    });
  };

  const confirmDeleteCategory = async () => {
    try {
      setDeleteDialog((prev) => ({ ...prev, loading: true }));
      await deleteCategory(deleteDialog.categoryId);

      setAllCategories((prev) => prev.filter((cat) => cat.id !== deleteDialog.categoryId));

      fetchAllCategories();
      toast.success(`Category "${deleteDialog.categoryName}" deleted successfully`);
      setDeleteDialog({ open: false, categoryId: "", categoryName: "", loading: false });

      const newTotalPages = Math.ceil((totalCategories - 1) / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(getCategoryErrorMessage(error as CategoryApiError));
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ open: false, categoryId: "", categoryName: "", loading: false });
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
                <BreadcrumbPage>Categories</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Categories Management</h1>
                <p className="text-muted-foreground">
                  Total Categories: {allCategories.length} | Filtered: {totalCategories}
                </p>
              </div>
              <Link href="/admin/category/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Category
                </Button>
              </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Categories Table */}
          <div className="border rounded-lg bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left p-4 font-medium text-gray-900">No</th>
                    <th className="text-left p-4 font-medium text-gray-900">Name</th>
                    <th className="text-left p-4 font-medium text-gray-900">Created at</th>
                    <th className="text-left p-4 font-medium text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Loading categories...</span>
                        </div>
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12">
                        <div className="text-center">
                          <p className="text-lg font-medium text-muted-foreground">No categories found</p>
                          <p className="text-sm text-muted-foreground mt-1">{searchTerm ? "Try adjusting your search criteria" : "No categories available"}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    categories.map((category, index) => (
                      <tr key={category.id} className={`border-b hover:bg-gray-50/50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                        {/* Number */}
                        <td className="p-4">
                          <span className="font-medium text-gray-900">{startIndex + index + 1}</span>
                        </td>

                        {/* Name */}
                        <td className="p-4">
                          <div className="max-w-md">
                            <h3 className="font-medium text-gray-900">{category.name}</h3>
                          </div>
                        </td>

                        {/* Created at */}
                        <td className="p-4">
                          <span className="text-sm text-gray-600">{formatDate(category.createdAt)}</span>
                        </td>

                        {/* Action */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/category/edit/${category.id}`}>
                              <Button variant="outline" size="sm">
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </Link>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(category.id, category.name)} disabled={deleteDialog.loading}>
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
                Showing {startIndex + 1} to {Math.min(endIndex, totalCategories)} of {totalCategories} results
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
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
                Are you sure you want to delete the category <strong>{deleteDialog.categoryName}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={cancelDelete} disabled={deleteDialog.loading}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteCategory} disabled={deleteDialog.loading}>
                {deleteDialog.loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Category
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
