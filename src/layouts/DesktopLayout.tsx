"use client";

import { ReactNode, useEffect, useState } from "react";
import { Layout, Breadcrumb, Switch, Avatar, Tag, Dropdown } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  LogoutOutlined,
  HomeOutlined,
  DownOutlined,
  SunOutlined,
  MoonOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import "../styles/hethong.css";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import api from "@/utils/api";
import { DollarOutlined } from "@ant-design/icons";
import { RiseOutlined, BarChartOutlined } from "@ant-design/icons";
const { Header, Content } = Layout;

export default function DesktopLayout({
  children,
  breadcrumbItems = [],
}: {
  children: ReactNode;
  breadcrumbItems?: { title: ReactNode }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/nhanvien/profile");
        setProfile(res.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const menuItems = [
    { key: "dashboard", label: "Bảng điều khiển", icon: <HomeOutlined />, path: "/admin/dashboard" },
    { key: "nhan-vien", label: "Nhân viên", icon: <UserOutlined />, path: "/admin/nhan-vien" },
    { key: "phong-ban", label: "Phòng ban", icon: <TeamOutlined />, path: "/admin/phong-ban" },
    { key: "ca-lam-viec", label: "Ca làm việc", icon: <CalendarOutlined />, path: "/admin/ca-lam-viec" },
    { key: "cham-cong", label: "Chấm công", icon: <ClockCircleOutlined />, path: "/admin/cham-cong" },
    { key: "luong", label: "Lương", icon: <DollarOutlined />, path: "/admin/luong" },
    { key: "nghi-phep", label: "Nghỉ phép", icon: <FileTextOutlined />, path: "/admin/nghi-phep" },
    { key: "lam-them", label: "Làm thêm", icon: <RiseOutlined />, path: "/admin/lam-them" },
    { key: "bao-cao", label: "Báo cáo", icon: <BarChartOutlined />, path: "/admin/bao-cao" },
  ];

  const handleMenuClick = (key: string) => {
    if (key === "logout") {
      localStorage.removeItem("token");
      router.push("/auth/login");
    } else if (key === "profile") {
      router.push("/admin/profile");
    } else {
      const target = menuItems.find((item) => item.key === key);
      if (target?.path) {
        router.push(target.path);
        setMobileOpen(false);
      }
    }
  };

  const avatarMenuItems = [
    {
      key: "logout",
      label: (
        <span>
          <LogoutOutlined style={{ marginRight: 8 }} /> Đăng xuất
        </span>
      ),
    },
  ];

  const settingMenuItems = [
    {
      key: "profile",
      label: (
        <span>
          <SettingOutlined style={{ marginRight: 8 }} /> Thông tin cá nhân
        </span>
      ),
    },
  ];

  const roleMap: Record<string, { label: string; color: string }> = {
    quantrivien: { label: "Quản trị viên", color: "red" },
    nhansu: { label: "Nhân sự", color: "gold" },
    nhanvien: { label: "Nhân viên", color: "blue" },
  };

  const getRole = (role: string | undefined) => {
    if (!role) return { label: "Chưa có vai trò", color: "default" };
    return roleMap[role.toLowerCase()] || { label: role, color: "default" };
  };

  const isActive = (path: string | undefined) => {
    return path && pathname?.startsWith(path);
  };

  return (
    <Layout 
      style={{ minHeight: "100vh", background: "var(--bg-main)" }}
      data-theme={theme}
    >
      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: "none",
          position: "fixed",
          top: "20px",
          left: "20px",
          zIndex: 1100,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
          cursor: "pointer",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`sidebar ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "mobile-open" : ""
        }`}
        style={{
          width: collapsed ? "80px" : "280px",
          height: "100vh",
          position: "fixed",
          left: "0",
          top: "0",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s ease, transform 0.3s ease",
          zIndex: 1000,
        }}
      >
        {/* Logo section */}
        <div
          className="logo-section"
          style={{
            padding: "30px 20px",
            textAlign: "center",
            borderBottom: "1px solid var(--border-color)",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            position: "relative",
          }}
        >
          <button
            className="toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
            style={{
              position: "absolute",
              top: "30px",
              right: "15px",
              background: "white",
              border: "none",
              color: "#667eea",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.25)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path
                d={
                  collapsed
                    ? "M13.854 8.354l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 .708-.708L7.5 12.793V1.5a.5.5 0 0 1 1 0v11.293l5.146-5.147a.5.5 0 0 1 .708.708z"
                    : "M8.354 13.854l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708.708L3.207 7.5H14.5a.5.5 0 0 1 0 1H3.207l5.855 5.854a.5.5 0 0 1-.708.708z"
                }
              />
            </svg>
          </button>
          <div
            className="logo-circle"
            style={{
              width: "60px",
              height: "60px",
              background: "white",
              borderRadius: "50%",
              margin: "0 auto 15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <Image src="/logo.png" alt="ITGLOBAL Logo" width={60} height={60} style={{ objectFit: "cover", borderRadius: "50%" }} />
          </div>
          <div
            className="company-name"
            style={{
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "1px",
              transition: "opacity 0.2s ease",
              opacity: collapsed ? 0 : 1,
            }}
          >
            IT-GLOBAL
          </div>
        </div>

        {/* Nav menu */}
        <nav
          className="nav-menu"
          style={{ padding: "20px 0", flex: 1, display: "flex", flexDirection: "column" }}
        >
          <div className="nav-items" style={{ flex: 1 }}>
            {menuItems.map((item) => (
              <div key={item.key} className="nav-item" style={{ position: "relative", margin: "0 15px 8px" }}>
                <a
                  href="#"
                  className={`nav-link ${isActive(item.path) ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleMenuClick(item.key);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: "12px 20px",
                    textDecoration: "none",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    fontWeight: 500,
                    fontSize: "15px",
                    background: isActive(item.path)
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "transparent",
                    boxShadow: isActive(item.path)
                      ? "0 4px 15px rgba(102, 126, 234, 0.3)"
                      : "none",
                  }}
                >
                  <span
                    className="nav-icon"
                    style={{
                      width: "20px",
                      height: "20px",
                      marginRight: collapsed ? 0 : "15px",
                      opacity: isActive(item.path) ? 1 : 0.8,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </span>
                  <span
                    className="nav-text"
                    style={{
                      opacity: collapsed ? 0 : 1,
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    {item.label}
                  </span>
                </a>
              </div>
            ))}
          </div>

          {/* Logout */}
          <div
            className="logout-section"
            style={{
              marginTop: "auto",
              padding: "20px 15px",
              borderTop: "1px solid var(--border-color)",
            }}
          >
            <a
              href="#"
              className="logout-link"
              onClick={(e) => {
                e.preventDefault();
                handleMenuClick("logout");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: "12px 20px",
                color: "var(--reject-red)",
                textDecoration: "none",
                borderRadius: "12px",
                transition: "all 0.3s ease",
                fontWeight: 500,
                fontSize: "15px",
                background: "rgba(220, 53, 69, 0.1)",
              }}
            >
              <span className="nav-icon" style={{ 
                  width: "20px", 
                  height: "20px", 
                  marginRight: collapsed ? 0 : "15px",
                  opacity: 0.8, 
                  flexShrink: 0, 
              }}>
                <LogoutOutlined />
              </span>
              <span className="nav-text" style={{ opacity: collapsed ? 0 : 1, transition: "opacity 0.2s ease", }}>
                Đăng xuất
              </span>
            </a>
          </div>
        </nav>
      </div>

      {/* Main layout */}
      <Layout
        className="main-content"
        style={{
          marginLeft: collapsed ? 80 : 280,
          transition: "margin-left 0.3s ease",
          background: "var(--bg-main)",
        }}
      >
        <Header
          style={{
            padding: "0 24px",
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border-color)",
            boxShadow: "0 1px 4px rgba(0,0,0,.08)",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            height: "64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Switch Dark/Light */}
            <Switch
              checkedChildren={<SunOutlined />}
              unCheckedChildren={<MoonOutlined />}
              checked={theme === "light"}
              onChange={toggleTheme}
            />

            {/* Settings */}
            <Dropdown
              menu={{ items: settingMenuItems, onClick: ({ key }) => handleMenuClick(key as string) }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <SettingOutlined style={{ fontSize: 18, cursor: "pointer", color: "var(--text-primary)" }} />
            </Dropdown>

            {/* Avatar */}
            <Dropdown
              menu={{ items: avatarMenuItems, onClick: ({ key }) => handleMenuClick(key as string) }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <div style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                <Avatar size="small" src={profile?.avatarUrl} icon={<UserOutlined />} style={{ marginRight: "8px" }} />
                <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}>
                  <span style={{ color: "var(--text-primary)" }}>
                    {profile?.hoTen || "Người dùng"}
                  </span>
                  <Tag color={getRole(profile?.role).color} style={{ width: "fit-content", fontSize: "11px", padding: "0 6px", marginTop: "2px" }}>
                    {getRole(profile?.role).label}
                  </Tag>
                </div>
                <DownOutlined style={{ marginLeft: "8px", color: "var(--text-primary)" }} />
              </div>
            </Dropdown>
          </div>
        </Header>

        {breadcrumbItems.length > 0 && (
          <div style={{ padding: "16px 24px 0" }}>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        )}

        <Content
          style={{
            padding: "24px",
            margin: 0,
            minHeight: 280,
            background: "var(--bg-main)",
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "15px",
              padding: "30px",
              boxShadow: "0 4px 20px var(--card-shadow)",
              border: "1px solid var(--border-color)",
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>

      <style jsx>{`
        @media (max-width: 992px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.mobile-open {
            transform: translateX(0);
            width: 280px;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .main-content {
            margin-left: 0 !important;
          }
        }
        .nav-link:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          transform: translateX(5px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3) !important;
        }
        .logout-link:hover {
          background: #dc3545 !important;
          color: white !important;
          transform: translateX(5px);
          box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3) !important;
        }
        .toggle-btn:hover {
          background: rgba(255, 255, 255, 0.3) !important;
          transform: rotate(180deg);
        }
      `}</style>
      
      {/* CSS Global để sửa lỗi hiển thị của Ant Design */}
      <style jsx global>{`
        .ant-breadcrumb a,
        .ant-breadcrumb-separator,
        .ant-breadcrumb-link {
          color: var(--text-primary) !important;
        }
        .ant-breadcrumb > span:last-child > .ant-breadcrumb-link {
            color: var(--text-secondary, var(--text-primary)) !important;
        }
        
        /* Sửa lỗi nền trắng cho ô Input/Search */
        .ant-input-wrapper .ant-input,
        .ant-input-affix-wrapper {
            background-color: var(--bg-main) !important;
            border-color: var(--border-color) !important;
            color: var(--text-primary) !important;
        }
        .ant-input::placeholder {
            color: var(--text-primary) !important;
            opacity: 0.6 !important;
        }
        .ant-input-search-icon {
            color: var(--text-primary) !important;
        }

        .ant-switch:not(.ant-switch-checked) {
          background: #1677ff !important;
        }
        .ant-switch-inner-unchecked {
            color: #fff !important;
        }
      `}</style>
    </Layout>
  );
}