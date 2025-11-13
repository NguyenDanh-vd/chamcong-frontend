"use client";
import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FaHome, FaHistory, FaRegCalendarAlt, FaUser, FaClock
} from "react-icons/fa";

export default function MobileLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const menu = [
    { key: "home", label: "Trang chủ", icon: <FaHome />, path: "/employee/home" },
    { key: "lich-su", label: "Lịch sử", icon: <FaHistory />, path: "/employee/lich-su" },
    { key: "nghi-phep", label: "Nghỉ phép", icon: <FaRegCalendarAlt />, path: "/employee/nghi-phep" },
    { key: "lam-them", label: "Làm thêm", icon: <FaClock />, path: "/employee/lam-them" },
    { key: "tai-khoan", label: "Tài khoản", icon: <FaUser />, path: "/employee/tai-khoan" },
  ];

  const activePath = pathname?.split("/").slice(0, 3).join("/") || "";

  // Không kiểm tra token ở đây — chỉ điều hướng
  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex flex-col min-h-screen text-white font-sans bg-gray-900">
      <main className="flex-1 pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center py-3 
        bg-black/40 backdrop-blur-md shadow-lg"
      >
        {menu.map((item) => {
          const isActive = activePath === item.path;
          return (
            <button
              key={item.key}
              onClick={() => handleNavigate(item.path)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300
                ${
                  isActive
                    ? "text-black bg-gradient-to-b from-gray-200 to-gray-300 shadow-lg scale-110"
                    : "text-white hover:scale-110"
                }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
