import api from "@/lib/api";

export interface UserProfile {
  id: string;
  username: string;
  role: string;
}

/**
 * Ambil data profil user dari /auth/profile
 */
export async function getUser(): Promise<UserProfile> {
  try {
    const response = await api.get<UserProfile>("/auth/profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}
