"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar, User, Tag, ArrowLeft, Clock } from "lucide-react";
import { toast } from "sonner";
import { Article } from "@/lib/articles-api";

const articlesApi = {
  getArticleById: async (id: string): Promise<Article> => {
    // Replace this with your actual API call
    const response = await fetch(`/api/articles/${id}`);
    if (!response.ok) throw new Error("Failed to fetch article");
    return response.json();
  },
};

export default function DetailArticlePage() {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
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
    </div>
  );
}
