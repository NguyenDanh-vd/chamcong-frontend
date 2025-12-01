"use client";
import React, { useEffect, useState } from "react";
import AdminPage from "@/components/AdminPage";
import { App, Card, Col, Row, Table, Tag, Spin, Button, Statistic } from "antd";
import api from "@/utils/api";
import { getUserFromToken } from "@/utils/auth";
import {
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  LoginOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useTheme } from "@/contexts/ThemeContext";
import AiChatWidget from "@/components/AiChatWidget";
import ClientOnly from "@/components/ClientOnly";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("vi");

const VN_TZ = "Asia/Ho_Chi_Minh";

export const toVN = (v?: string | Date | number | null): dayjs.Dayjs | null => {
  if (v === null || v === undefined) return null;

  if (v instanceof Date) return dayjs(v).tz(VN_TZ);
  if (typeof v === "number" && !Number.isNaN(v)) return dayjs(v).tz(VN_TZ);

  const s = String(v).trim();
  if (s === "" || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return null;

  // HH:mm hoặc HH:mm:ss → ghép với ngày hôm nay
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) {
    const full = s.length === 5 ? `${s}:00` : s;
    return dayjs.tz(`${dayjs().format("YYYY-MM-DD")}T${full}`, VN_TZ);
  }

  // ISO string hoặc timestamp → convert sang VN timezone
  return dayjs(v).tz(VN_TZ);
};

// Hàm định dạng HH:mm
export const fmtHHmm = (v?: string | Date | null) => {
  const d = toVN(v);
  return d ? d.format("HH:mm") : "--";
};

// Hàm định dạng HH:mm:ss
export const fmtHHmmss = (v?: string | Date | null) => {
  const d = toVN(v);
  return d ? d.format("HH:mm:ss") : "--:--:--";
};

/* ---------------- Types ---------------- */

interface ShiftData {
  id: number;
  name: string;
  maNV: number;
  shift: string;
  start?: string | Date | null;
  end?: string | Date | null;
  status: string;
}

/* ====================================================== */

const DashboardContent = () => {
  const { message } = App.useApp();
  const { theme } = useTheme();

  const [currentTime, setCurrentTime] = useState<dayjs.Dayjs | null>(null);
  const [userName, setUserName] = useState("Admin");

  const [stats, setStats] = useState([
    { title: "Tổng nhân viên", value: 0, icon: <TeamOutlined />, color: "#1677ff" },
    { title: "Đang làm việc", value: 0, icon: <CheckCircleOutlined />, color: "#52c41a" },
    { title: "Vắng mặt", value: 0, icon: <ClockCircleOutlined />, color: "#faad14" },
    { title: "Nghỉ phép", value: 0, icon: <StopOutlined />, color: "#f5222d" },
  ]);

  const [data, setData] = useState<ShiftData[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] =
    useState<"none" | "checked-in" | "done">("none");

  /* Đồng hồ theo VN */
  useEffect(() => {
    setCurrentTime(dayjs().tz(VN_TZ));
    const timer = setInterval(() => setCurrentTime(dayjs().tz(VN_TZ)), 1000);
    const user = getUserFromToken();
    if (user) setUserName(user.hoTen || user.email || "Người dùng");
    return () => clearInterval(timer);
  }, []);

  /* Bảng ca làm việc: cột */
  const columns = [
    { title: "Tên nhân viên", dataIndex: "name", key: "name" },
    { title: "Ca làm", dataIndex: "shift", key: "shift", render: (t: string) => t || "--" },
    {
      title: "Giờ bắt đầu",
      dataIndex: "start",
      key: "start",
      render: (t: string) => fmtHHmm(t), // <- luôn định dạng theo VN
    },
    {
      title: "Giờ kết thúc",
      dataIndex: "end",
      key: "end",
      render: (t: string) => (t ? fmtHHmm(t) : "--"), // <- luôn định dạng theo VN
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "Đang làm việc" ? "success" :
          status === "Vắng mặt" ? "warning" :
          "default";
        return <Tag color={color}>{status || "Chưa có"}</Tag>;
      },
    },
  ];

  /* Tải dữ liệu + CHUẨN HOÁ thời gian về start/end */
  const fetchData = async () => {
    setLoading(true);
    try {
      const user = getUserFromToken();
      if (user?.hoTen) setUserName(user.hoTen);

      const [shiftsRes, statsRes, myAttendance] = await Promise.all([
        api.get("/calamviec/today"),
        api.get("/stats/dashboard"),
        api.get("/chamcong/me"),
      ]);

      // 🔹 Ưu tiên lấy giờ thực tế (gioVao/gioRa) thay vì giờ ca (start/end)
      const raw = Array.isArray(shiftsRes.data) ? shiftsRes.data : [];

      // DEBUG: show raw samples (mở DevTools console trên production để xem)
      console.log('--- DEBUG: RAW SHIFTS (client) ---', raw.slice(0,5));
      console.log('--- DEBUG: MY ATTENDANCE (client) ---', (myAttendance.data || []).slice(0,5));

      const normalized: ShiftData[] = raw.map((r: any, idx: number) => {
        // ✅ ĐỔI THỨ TỰ: dùng gioVao/gioRa trước, fallback sang start/end
        const startRaw = r.gioVao ?? r.ngayTao ?? r.start ?? null;
        const endRaw   = r.gioRa  ?? r.end     ?? null;

        return {
          id: r.id ?? r.maNV ?? idx,
          name: r.name ?? r.hoTen ?? r.fullname ?? "—",
          maNV: r.maNV ?? r.id ?? idx,
          shift: r.shift ?? r.tenCa ?? r.ca ?? "—",
          start: startRaw,
          end: endRaw,
          status: r.status ?? r.trangThaiText ?? r.trangThai ?? "—",
        };
      });
      setData(normalized);

      const s = statsRes.data || {};
      setStats((prev) => [
        { ...prev[0], value: s.totalEmployees ?? 0 },
        { ...prev[1], value: s.working ?? 0 },
        { ...prev[2], value: s.absent ?? 0 },
        { ...prev[3], value: s.onLeave ?? 0 },
      ]);

      // Xác định bản ghi hôm nay theo VN timezone (myAttendance trả danh sách lịch sử của tôi)
      const todayVN = dayjs().tz(VN_TZ).format("YYYY-MM-DD");
      const todayRecord = (myAttendance.data || []).find((r: any) => {
        if (!r?.gioVao) return false;
        const inVN = toVN(r.gioVao);
        return inVN?.format("YYYY-MM-DD") === todayVN;
      });

      if (!todayRecord) setAttendanceStatus("none");
      else if (todayRecord && !todayRecord.gioRa) setAttendanceStatus("checked-in");
      else setAttendanceStatus("done");
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Check-in/out */
  const handleChamCong = async () => {
    try {
      const user = getUserFromToken();
      if (!user?.maNV) {
        message.error("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.");
        return;
      }

      if (attendanceStatus === "none") {
        const res = await api.post("/chamcong/checkin", { maNV: user.maNV });
        const tenCa = res.data?.caLamViec?.tenCa || "hiện tại";
        message.success(`Check-in thành công cho ca ${tenCa}`);
      } else if (attendanceStatus === "checked-in") {
        await api.post("/chamcong/checkout", { maNV: user.maNV });
        message.success("Check-out thành công");
      } else {
        message.info("Bạn đã hoàn thành chấm công hôm nay.");
        return;
      }
      fetchData();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Thao tác chấm công thất bại";
      message.error(errorMessage);
    }
  };

  const getButtonProps = () => {
    switch (attendanceStatus) {
      case "none":
        return { text: "Chấm công (Check-in)", icon: <LoginOutlined />, type: "primary" as const, disabled: false };
      case "checked-in":
        return { text: "Chấm công (Check-out)", icon: <LogoutOutlined />, type: "primary" as const, danger: true, disabled: false };
      case "done":
        return { text: "Đã hoàn thành hôm nay", icon: <CheckCircleOutlined />, type: "default" as const, disabled: true };
    }
  };
  const buttonProps = getButtonProps();

  return (
    <Spin spinning={loading} tip="Đang tải dữ liệu...">
      <Row gutter={[24, 24]}>
        {stats.map((item, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card style={{ background: `linear-gradient(135deg, ${item.color}20, ${item.color}05)`, border: "none" }}>
              <Statistic
                title={<span style={{ color: "var(--text-secondary)" }}>{item.title}</span>}
                value={item.value}
                valueStyle={{ color: item.color, fontSize: "2rem", fontWeight: 600 }}
                prefix={<span style={{ color: item.color, marginRight: 8 }}>{item.icon}</span>}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ margin: "24px 0" }} />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Ca làm việc hôm nay">
            <Table
              columns={columns}
              dataSource={data}
              pagination={false}
              rowKey={(r) => `${r.id}-${r.maNV}-${fmtHHmm(r.start)}`}
              scroll={{ x: true }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ fontWeight: 600, fontSize: "1.2rem", color: theme === "dark" ? "#E5E7EB" : "var(--text-primary)" }}>
                Xin chào, {userName}!
              </h3>
              <p style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>
                {currentTime ? (() => {
                  const weekday = currentTime.format("dddd");
                  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
                  return `${cap}, ${currentTime.format("DD/MM/YYYY")}`;
                })() : "..."}
              </p>
              <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--primary-accent)", margin: "16px 0", minHeight: "48px" }}>
                {currentTime ? currentTime.format("HH:mm:ss") : "--:--:--"}
              </p>
              <Button
                type="primary"
                icon={buttonProps.icon}
                onClick={handleChamCong}
                disabled={buttonProps.disabled}
                size="large"
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  fontWeight: 600,
                  fontSize: "1rem",
                  background: buttonProps.disabled
                    ? "linear-gradient(135deg, #9ca3af, #6b7280)"
                    : (buttonProps as any).danger
                    ? "linear-gradient(135deg, #f87171, #ef4444)"
                    : "linear-gradient(135deg, #34d399, #10b981)",
                  color: "#fff",
                  boxShadow: buttonProps.disabled ? "none" : "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!buttonProps.disabled) {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!buttonProps.disabled) {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }
                }}
              >
                {buttonProps.text}
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Spin>
  );
};

export default function DashboardPage() {
  const user = getUserFromToken();
  return (
    <AdminPage title="Bảng điều khiển">
      <App>
        <DashboardContent />
        <ClientOnly>{user ? <AiChatWidget employeeId={user.maNV} role={user.role} /> : null}</ClientOnly>
      </App>
    </AdminPage>
  );
}
