export type Role = "admin" | "User";

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: Role;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: "User";
}

export interface RegisterResponse {
  "username": string;
  "password": string;
  "role": "User";
  "createdAt": string;
  "updatedAt": string;
}