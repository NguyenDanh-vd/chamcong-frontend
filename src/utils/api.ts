import axios from "axios";

let apiUrl = "http://localhost:3000"; // mặc định

if (typeof window !== "undefined") {
  const host = window.location.hostname;
  if (host.startsWith("192.168.")) {
    apiUrl = `http://${host}:3000`;
  }
}

const api = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" }
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
