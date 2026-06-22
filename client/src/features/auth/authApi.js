// src/features/api/authApi.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
  withCredentials: true,
});

api.interceptors.response.use((res) => res.data);

export default api;
