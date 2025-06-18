import axios from "axios";

const api = axios.create({
  baseURL: "https://test-fe.mysellerpintar.com/api",
  withCredentials: true, // kalau pakai cookie session
});

export default api;
