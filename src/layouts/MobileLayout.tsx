"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FaHome, FaHistory, FaCalendarCheck, FaUser, FaRegClock } from "react-icons/fa";
import { MdOutlineWavingHand } from "react-icons/md";

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

  const titleMap: Record<string, string> = {
    "/employee/home": "Chấm công khuôn mặt",
    "/employee/lich-su": "Lịch sử chấm công",
    "/employee/nghi-phep": "Quản lý nghỉ phép",
    "/employee/lam-them": "Quản lý làm thêm",
    "/employee/tai-khoan": "Tài khoản cá nhân",
  };

  const handleNavigate = (path: string) => router.push(path);
  const pageTitle =
    Object.entries(titleMap).find(([p]) => pathname?.startsWith(p))?.[1] || "IT-Global";

  return (
    <div
      data-employee-shell="true"
      className="min-h-svh bg-gradient-to-b from-slate-50 via-cyan-50/20 to-white text-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100"
    >
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 px-4 py-2.5 backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/90">
        <div className="flex w-full items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-700">IT-Global</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{pageTitle}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-700 dark:border-cyan-500/40 dark:bg-cyan-950/40 dark:text-cyan-300">
            <MdOutlineWavingHand /> Nhân viên
          </span>
        </div>
      </header>

      <main className="w-full pb-28">{children}</main>

      <nav className="fixed bottom-2 left-1/2 z-50 w-[calc(100%-12px)] -translate-x-1/2 rounded-2xl border border-slate-200/80 bg-white/95 px-2 py-2 shadow-[0_18px_32px_-22px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/95 dark:shadow-[0_18px_32px_-22px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-around gap-1">
          {menu.map((item) => {
            const isActive = pathname?.startsWith(item.path);

            return (
              <button
                key={item.key}
                onClick={() => handleNavigate(item.path)}
                className={`flex w-full flex-col items-center justify-center rounded-xl px-2 py-1.5 transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-md shadow-cyan-200/80"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <span className={`mb-1 text-[18px] transition-transform ${isActive ? "scale-110" : "scale-100"}`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] font-semibold ${isActive ? "font-bold" : ""}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
