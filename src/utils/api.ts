import axios from "axios";

// ✅ URL backend cố định (phòng khi biến môi trường rỗng)
const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://chamcong-backend-8pgb.onrender.com"; 

const api = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, 
});

// ✅ Gắn token cho mọi request
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

// ✅ Tự logout khi token hết hạn
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

console.log("CLIENT API URL:", process.env.NEXT_PUBLIC_API_URL, " -> baseURL:", api.defaults.baseURL);
export default api;
