"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FaHome, FaHistory, FaCalendarCheck, FaUser, FaRegClock } from "react-icons/fa";

export default function MobileLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const menu = [
    { key: "home", label: "Trang chủ", icon: <FaHome />, path: "/employee/home" },
    { key: "lich-su", label: "Lịch sử", icon: <FaHistory />, path: "/employee/lich-su" }, 
    { key: "nghi-phep", label: "Nghỉ phép", icon: <FaCalendarCheck />, path: "/employee/nghi-phep" },
    { key: "lam-them", label: "Làm thêm", icon: <FaRegClock />, path: "/employee/lam-them" },
    { key: "tai-khoan", label: "Tài khoản", icon: <FaUser />, path: "/employee/tai-khoan" }, 
  ];

  const handleNavigate = (path: string) => router.push(path);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center py-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-300">
        {menu.map((item) => {
          const isActive = pathname?.startsWith(item.path);
          
          return (
            <button
              key={item.key}
              onClick={() => handleNavigate(item.path)}
              className={`flex flex-col items-center justify-center w-full transition-colors duration-200 group ${
                isActive 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <span className={`text-2xl mb-1 transition-transform ${isActive ? "scale-110" : "scale-100"}`}>
                {item.icon}
              </span>
              
              <span className={`text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}