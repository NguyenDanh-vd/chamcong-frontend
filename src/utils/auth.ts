import {jwtDecode} from "jwt-decode";

export interface User {
  maNV: number;
  email: string;
  role: string;
  hoTen: string;
  exp: number;
}

// Lấy user từ token, check hết hạn
export function getUserFromToken(): User | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<User>(token);

    // Kiểm tra token hết hạn
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      console.warn("Token expired, removing from localStorage");
      localStorage.removeItem("token");
      return null;
    }

    return decoded;
  } catch (err) {
    console.error("Token decode error:", err);
    localStorage.removeItem("token");
    return null;
  }
}

// Hàm logout tiện lợi
export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};
