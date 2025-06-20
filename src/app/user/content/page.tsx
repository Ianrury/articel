// app/user/articles/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Article, articlesApi, ArticlesResponse } from "@/lib/articles-api";
import { toast } from "sonner";
import { Search, Filter, Calendar, User, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ArticlesPage() {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const ITEMS_PER_PAGE = 9;

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

  useEffect(() => {
    fetchAllArticles();
  }, []);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const filteredArticles = allArticles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category.name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  const categories = Array.from(new Set(allArticles.map((article) => article.category.name)));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "");
  };

  const handleArticleClick = (id: string) => {
    router.push(`/user/detail-article/${id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top of articles section
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="ghost"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>
    );

    // Calculate visible page range
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "ghost"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 min-w-[2.5rem] ${currentPage === i ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
        >
          {i}
        </Button>
      );
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis" className="px-2 text-gray-400">
            ...
          </span>
        );
      }
      buttons.push(
        <Button key={totalPages} variant="ghost" size="sm" onClick={() => handlePageChange(totalPages)} className="px-3 py-2 min-w-[2.5rem] text-gray-600 hover:text-gray-900 hover:bg-gray-100">
          {totalPages}
        </Button>
      );
    }

    // Next button
    buttons.push(
      <Button
        key="next"
        variant="ghost"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>
    );

    return buttons;
  };

  return (
    <div>
      {/* Hero Section with Background */}
      <div
        className="relative min-h-[500px] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(37, 99, 235, 0.8), rgba(29, 78, 216, 0.9)), url('/foto-background.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-white/10 rounded-full blur-lg"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-[500px] text-center px-6">
          <div className="mb-6">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-4">
              Blog Terbaru
            </Badge>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            The Journal: Design Resources,
            <br />
            Interviews, and Industry News
          </h1>

          <p className="text-xl text-white/90 mb-12 max-w-2xl">Your daily dose of design insights!</p>

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-white/90 border-white/30">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input type="text" placeholder="Search articles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-white/90 border-white/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Articles Grid Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <p className="text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredArticles.length)} of {filteredArticles.length} articles
              {filteredArticles.length !== allArticles.length && ` (filtered from ${allArticles.length} total)`}
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentArticles.map((article) => (
                  <div key={article.id} className="bg-white rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer group overflow-hidden" onClick={() => handleArticleClick(article.id)}>
                    {/* Image Section */}
                    <div className="relative overflow-hidden">
                      <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-black/70 text-white text-xs px-2 py-1 rounded-md">{article.category.name}</Badge>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 space-y-3">
                      {/* Meta Information */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{formatDate(article.createdAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            <span>{article.user.username}</span>
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">{article.title}</h3>

                      {/* Content Preview */}
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{stripHtml(article.content)}</p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3">
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs px-2 py-1">
                            Technology
                          </Badge>
                          <Badge variant="outline" className="text-xs px-2 py-1">
                            Design
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0 h-auto">
                          <Eye className="w-4 h-4 mr-1" />
                          <span className="text-xs">Read More</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && <div className="flex items-center justify-center mt-12 space-x-1">{renderPaginationButtons()}</div>}
            </>
          )}

          {!loading && filteredArticles.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or browse all articles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
