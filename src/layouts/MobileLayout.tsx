import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FaHome, FaHistory, FaRegCalendarAlt, FaUser, FaClock } from "react-icons/fa";
import styles from "../styles/MobileLayout.module.css";

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
  const handleNavigate = (path: string) => router.push(path);

  return (
    <div className={styles.layoutContainer}>
      <main className={styles.mainContent}>{children}</main>

      <nav className={styles.navBar}>
        {menu.map((item) => {
          const isActive = activePath === item.path;
          return (
            <button
              key={item.key}
              onClick={() => handleNavigate(item.path)}
              className={`${styles.navButton} ${isActive ? styles.active : ""}`}
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
