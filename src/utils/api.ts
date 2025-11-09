import axios from "axios";

let apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Nếu đang chạy trong LAN (nội bộ)
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_USE_LAN === "true") {
  const host = window.location.hostname;
  if (host.startsWith("192.168.")) {
    apiUrl = `http://${host}:3000`;
  }
}

const api = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" },
});

// ✅ Luôn gắn token (kể cả localStorage hoặc sessionStorage)
if (typeof window !== "undefined") {
  api.interceptors.request.use(
    (config) => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

export default api;
