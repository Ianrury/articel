import api from "@/lib/api";

// Interfaces
export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  data: Category[];
  totalData: number;
  currentPage: number;
  totalPages: number;
}

export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  name: string;
}

// API Functions

/**
 * Get all categories
 */
export async function getCategories(): Promise<CategoriesResponse> {
  try {
    const response = await api.get("/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(id: string): Promise<Category> {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new category
 */
export async function createCategory(categoryData: CreateCategoryInput): Promise<Category> {
  try {
    const response = await api.post("/categories", categoryData);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(id: string, categoryData: UpdateCategoryInput): Promise<Category> {
  try {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error(`Error updating category with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a category by ID
 */
export async function deleteCategory(id: string): Promise<void> {
  try {
    await api.delete(`/categories/${id}`);
  } catch (error) {
    console.error(`Error deleting category with ID ${id}:`, error);
    throw error;
  }
}

// Helper functions for better error handling

export function isCategoryNotFound(error: any): boolean {
  return error?.response?.status === 404;
}

export function isUnauthorized(error: any): boolean {
  return error?.response?.status === 401;
}

export function isForbidden(error: any): boolean {
  return error?.response?.status === 403;
}

export function getCategoryErrorMessage(error: any): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  switch (error?.response?.status) {
    case 400:
      return "Data kategori tidak valid";
    case 401:
      return "Anda tidak memiliki akses untuk melakukan operasi ini";
    case 403:
      return "Akses ditolak";
    case 404:
      return "Kategori tidak ditemukan";
    case 409:
      return "Nama kategori sudah digunakan";
    case 500:
      return "Terjadi kesalahan pada server";
    default:
      return "Terjadi kesalahan yang tidak diketahui";
  }
}

// Group export
export const categoryApi = {
  getAll: getCategories,
  getById: getCategoryById,
  create: createCategory,
  update: updateCategory,
  delete: deleteCategory,
  isNotFound: isCategoryNotFound,
  isUnauthorized,
  isForbidden,
  getErrorMessage: getCategoryErrorMessage,
};
