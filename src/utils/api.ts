import axios from "axios";

let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Nếu đang chạy trong trình duyệt (client)
if (typeof window !== "undefined") {
  const host = window.location.hostname;

  // Nếu trong mạng LAN thì dùng IP nội bộ
  if (host.startsWith("192.168.")) {
    apiUrl = `http://${host}:3000`;
  }
}

const api = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
