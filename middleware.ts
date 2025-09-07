import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {jwtDecode} from "jwt-decode";

interface TokenPayload {
  maNV: number;
  email: string;
  role: string;
  hoTen: string;
  exp: number;
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // Routes public không cần check
  const publicPaths = ["/login", "/unauthorized", "/_next", "/favicon.ico"];
  if (publicPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Không có token → redirect login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = jwtDecode<TokenPayload>(token);

    // Token hết hạn
    if (decoded.exp < Date.now() / 1000) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = decoded.role;
    const path = req.nextUrl.pathname;

    // Phân quyền route
    if (role === "nhanvien" && path.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if ((role === "quantrivien" || role === "nhansu") && path.startsWith("/employee")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Token decode error:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Áp dụng cho tất cả route trừ file tĩnh
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
