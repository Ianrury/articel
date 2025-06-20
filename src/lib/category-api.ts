import axios from "axios";

interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesResponse {
  data: Category[];
  totalData: number;
  currentPage: number;
  totalPages: number;
}

export async function getCategories(): Promise<CategoriesResponse> {
  try {
    const response = await axios.get("https://test-fe.mysellerpintar.com/api/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}
