import axios from "axios";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://chamcong-backend-8pgb.onrender.com";

const api = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" },
});

// Thêm token tự động vào header
if (typeof window !== "undefined") {
  api.interceptors.request.use((config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) {
        // Xóa token khi hết hạn
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");

        // Redirect về login
        window.location.href = "/auth/login";
      }
      return Promise.reject(error);
    }
  );
}

export default api;