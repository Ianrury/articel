// File: src/types/user.ts
export type Role = "Admin" | "User";

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: Role;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: string;
}

export interface RegisterResponse {
  username: string;
  password: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
