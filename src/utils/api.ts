import axios from "axios";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://chamcong-backend-8pgb.onrender.com";

const api = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

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

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
      } catch {}

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("app:unauthorized", {
            detail: { url: error.config?.url },
          })
        );
      }
    }

    return Promise.reject(error);
  }
);

console.log("CLIENT API URL:", process.env.NEXT_PUBLIC_API_URL, " -> baseURL:", api.defaults.baseURL);
export default api;
