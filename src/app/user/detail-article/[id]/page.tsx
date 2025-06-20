"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar, User,  ArrowLeft,  Eye } from "lucide-react";
import { toast } from "sonner";
import { Article, ArticlesResponse } from "@/lib/articles-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const articlesApi = {
  getArticleById: async (id: string): Promise<Article> => {
    // Replace this with your actual API call
    const response = await fetch(`/api/articles/${id}`);
    if (!response.ok) throw new Error("Failed to fetch article");
    return response.json();
  },

  getArticles: async (): Promise<ArticlesResponse> => {
    const response = await fetch(`/api/articles`);
    if (!response.ok) throw new Error("Failed to fetch articles");
    return response.json();
  },
};

export default function DetailArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 3;

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
  const handleArticleClick = (id: string) => {
    router.push(`/user/detail-article/${id}`);
  };

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
    setCurrentPage(1);
    setSearchTerm("");
    setSelectedCategory("all");
  }, [searchTerm, selectedCategory]);

  const filteredArticles = allArticles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category.name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Pagination calculations
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  useEffect(() => {
    fetchAllArticles();
  }, []);

  useEffect(() => {
    if (id) {
      fetchArticle(id);
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-1/2 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded-lg"></div>
              <div className="h-4 bg-gray-200 rounded-lg"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Artikel Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-4">Artikel yang Anda cari tidak dapat ditemukan.</p>
          <button onClick={() => router.push("/admin/articles")} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Artikel
          </button>
        </div>
      </div>
    );
  }

  function stripHtml(content: string): string {
    if (!content) return "";
    const text = content.replace(/<[^>]+>/g, "");
    const textarea = typeof window !== "undefined" ? document.createElement("textarea") : null;
    if (textarea) {
      textarea.innerHTML = text;
      return textarea.value;
    }
    return text;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <article className="bg-white  overflow-hidden">
          <div className="px-32 ">
            <div className="flex justify-center gap-6 text-sm text-gray-600 border-gray-200 pb-5">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(article.createdAt)}</span>
              </div>
              <div className="flex items-center">Create by admin</div>
            </div>
            <h1 className="text-xl font-bold text-gray-700 mb-6 leading-tight text-center">{article.title}</h1>
          </div>

          {/* Featured Image */}
          <div className="relative w-full h-64 md:h-96">
            <Image src={article.imageUrl} alt={article.title} fill className="object-cover rounded-lg" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          {/* Article Content */}
          <div className="p-6 md:p-8">
            {/* Article Content */}
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4"
              dangerouslySetInnerHTML={{ __html: article.content }}
            ></div>
          </div>
        </article>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentArticles.map((article) => (
            <div key={article.id} className="bg-white rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer group overflow-hidden" onClick={() => handleArticleClick(article.id)}>
              {/* Image Section */}
              <div className="relative overflow-hidden">
                <img src={article.imageUrl} alt={article.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
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
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug m-0">{article.title}</h3>

                {/* Content Preview */}
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{stripHtml(article.content)}</p>

                {/* Footer */}
                <div className="flex items-center justify-between">
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
      </div>
    </div>
  );
}
