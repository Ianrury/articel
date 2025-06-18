// lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "/api", // GANTI ini
  withCredentials: false, // TRUE hanya jika API pakai cookie
});

export default api;
