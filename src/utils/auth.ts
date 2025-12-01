import { jwtDecode } from "jwt-decode";

export interface User {
  maNV: number;
  email: string;
  role: string;
  hoTen: string;
  exp: number; // seconds since epoch
}

/** Lấy token từ localStorage hoặc sessionStorage */
function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

/** Xoá token ở cả 2 nơi */
function clearStoredToken() {
  try {
    localStorage.removeItem("token");
  } catch {}
  try {
    sessionStorage.removeItem("token");
  } catch {}
}

// Lấy user từ token, check hết hạn
export function getUserFromToken(): User | null {
  if (typeof window === "undefined") return null;

  const token = getStoredToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<User>(token);

    // Kiểm tra token hết hạn
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      console.warn("Token expired, removing from storage");
      clearStoredToken();
      return null;
    }

    return decoded;
  } catch (err) {
    console.error("Token decode error:", err);
    clearStoredToken();
    return null;
  }
}

// Hàm logout tiện lợi
export const logout = () => {
  clearStoredToken();
  if (typeof window !== "undefined") {
    window.location.href = "/auth/login";
  }
};

export function saveToken(token: string, remember: boolean) {
  if (typeof window === "undefined") return;
  (remember ? localStorage : sessionStorage).setItem("token", token);
}