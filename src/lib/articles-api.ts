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
  userId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
  user: User;
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
  getArticles: async (params: GetArticlesParams = {}): Promise<ArticlesResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.categoryId) queryParams.append("categoryId", params.categoryId);

      const response = await api.get(`https://test-fe.mysellerpintar.com/api/articles?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching articles:", error);
      throw error;
    }
  },

  // Get single article by ID
  getArticleById: async (id: string): Promise<Article> => {
    try {
      const response = await api.get(`https://test-fe.mysellerpintar.com/api/articles/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching article:", error);
      throw error;
    }
  },

  // Create new article
  createArticle: async (articleData: Omit<Article, "id" | "createdAt" | "updatedAt" | "user" | "category">): Promise<Article> => {
    try {
      const response = await api.post("https://test-fe.mysellerpintar.com/api/articles", articleData);
      return response.data;
    } catch (error) {
      console.error("Error creating article:", error);
      throw error;
    }
  },

  // Update article
  updateArticle: async (id: string, articleData: Partial<Article>): Promise<Article> => {
    try {
      const response = await api.put(`https://test-fe.mysellerpintar.com/api/articles/${id}`, articleData);
      return response.data;
    } catch (error) {
      console.error("Error updating article:", error);
      throw error;
    }
  },

  // Delete article
  deleteArticle: async (id: string): Promise<void> => {
    try {
      await api.delete(`https://test-fe.mysellerpintar.com/api/articles/${id}`);
    } catch (error) {
      console.error("Error deleting article:", error);
      throw error;
    }
  },

  // Get categories (assuming there's an endpoint for this)
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
