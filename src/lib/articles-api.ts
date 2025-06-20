// src/lib/articles-api.ts
import api from "@/lib/api";

// Types
export interface User {
  id: string;
  username: string;
  role: string;
}

export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  userId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
  user: User;
}

// Interface untuk input artikel (hanya field yang diperlukan untuk create)
export interface ArticleInput {
  title: string;
  content: string;
  categoryId: string;
}

export interface ArticlesResponse {
  data: Article[];
  total: number;
  page: number;
  limit: number;
}

export interface GetArticlesParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}

export const articlesApi = {
  getArticles: async (): Promise<ArticlesResponse> => {
    try {
      const response = await api.get(`https://test-fe.mysellerpintar.com/api/articles`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching articles:", error);
      throw error;
    }
  },

  getArticleById: async (id: string): Promise<Article> => {
    try {
      const response = await api.get(`https://test-fe.mysellerpintar.com/api/articles/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching article:", error);
      throw error;
    }
  },

  createArticle: async (articleData: ArticleInput): Promise<Article> => {
    try {
      const response = await api.post("https://test-fe.mysellerpintar.com/api/articles", articleData);
      return response.data;
    } catch (error) {
      console.error("Error creating article:", error);
      throw error;
    }
  },

  updateArticle: async (id: string, articleData: Partial<ArticleInput>): Promise<Article> => {
    try {
      const response = await api.put(`https://test-fe.mysellerpintar.com/api/articles/${id}`, articleData);
      return response.data;
    } catch (error) {
      console.error("Error updating article:", error);
      throw error;
    }
  },

  deleteArticle: async (id: string): Promise<void> => {
    try {
      await api.delete(`https://test-fe.mysellerpintar.com/api/articles/${id}`);
    } catch (error) {
      console.error("Error deleting article:", error);
      throw error;
    }
  },

  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get("https://test-fe.mysellerpintar.com/api/categories");
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },
};
