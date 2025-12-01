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
  CheckCircleOutlined as DoneIcon,
} from "@ant-design/icons";
import { useTheme } from "@/contexts/ThemeContext";
import AiChatWidget from "@/components/AiChatWidget";
import ClientOnly from "@/components/ClientOnly";
import { toVN7, formatTime } from "@/utils/date"; 
import dayjs from "dayjs";

/* ----------------- TYPES ----------------- */
interface ShiftData {
  id: number;
  name: string;
  maNV: number;
  shift: string;
  start?: string | Date | null;
  end?: string | Date | null;
  status: string;
}

/* ----------------- COMPONENT ----------------- */
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
  const [attendanceStatus, setAttendanceStatus] = useState<"none" | "checked-in" | "done">("none");

  /* ----------------- ĐỒNG HỒ VN ----------------- */
  useEffect(() => {
    // Set giờ ngay khi component mount trên client
    setCurrentTime(toVN7(new Date()));

    const timer = setInterval(() => {
      // Luôn lấy new Date() hiện tại và ép về múi giờ VN
      setCurrentTime(toVN7(new Date()));
    }, 1000);

    const user = getUserFromToken();
    if (user?.hoTen) setUserName(user.hoTen);

    return () => clearInterval(timer);
  }, []);

  /* ----------------- FETCH DATA ----------------- */
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

      // --- Xử lý bảng ca làm việc ---
      const raw = Array.isArray(shiftsRes.data) ? shiftsRes.data : [];
      const normalized: ShiftData[] = raw.map((r: any, idx: number) => {
        const startRaw = r.gioVao ?? r.ngayTao ?? r.start ?? null;
        const endRaw = r.gioRa ?? r.end ?? null;
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

      // --- Xử lý thống kê ---
      const s = statsRes.data || {};
      setStats((prev) => [
        { ...prev[0], value: s.totalEmployees ?? 0 },
        { ...prev[1], value: s.working ?? 0 },
        { ...prev[2], value: s.absent ?? 0 },
        { ...prev[3], value: s.onLeave ?? 0 },
      ]);

      // --- Xử lý trạng thái chấm công của tôi ---
      // Lấy ngày hiện tại theo giờ VN (YYYY-MM-DD)
      const todayVNStr = toVN7(new Date())?.format("YYYY-MM-DD");
      
      const todayRecord = (myAttendance.data || []).find((r: any) => {
        if (!r?.gioVao) return false;
        // Chuyển giờ vào trong DB sang giờ VN rồi so sánh ngày
        const recordDateVN = toVN7(r.gioVao)?.format("YYYY-MM-DD");
        return recordDateVN === todayVNStr;
      });

      if (!todayRecord) setAttendanceStatus("none");
      else if (todayRecord && !todayRecord.gioRa) setAttendanceStatus("checked-in");
      else setAttendanceStatus("done");

    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* ----------------- CHẤM CÔNG ACTION ----------------- */
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
        message.info("Bạn đã hoàn thành hôm nay.");
        return;
      }
      fetchData(); // Load lại data sau khi chấm công
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Thao tác chấm công thất bại";
      message.error(errorMessage);
    }
  };

  /* ----------------- COLUMNS ----------------- */
  const columns = [
    { title: "Tên nhân viên", dataIndex: "name", key: "name" },
    { title: "Ca làm", dataIndex: "shift", key: "shift", render: (t: string) => t || "--" },
    {
      title: "Giờ bắt đầu",
      dataIndex: "start",
      key: "start",
      // Dùng formatTime từ utils/date để ép sang giờ VN
      render: (t: string) => formatTime(t, "HH:mm:ss"), 
    },
    {
      title: "Giờ kết thúc",
      dataIndex: "end",
      key: "end",
      render: (t: string) => (t ? formatTime(t, "HH:mm:ss") : "--"),
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

  /* ----------------- BUTTON PROPS ----------------- */
  const getButtonProps = () => {
    switch (attendanceStatus) {
      case "none":
        return { text: "Chấm công (Check-in)", icon: <LoginOutlined />, type: "primary" as const, disabled: false };
      case "checked-in":
        return { text: "Chấm công (Check-out)", icon: <LogoutOutlined />, type: "primary" as const, danger: true, disabled: false };
      case "done":
        return { text: "Đã hoàn thành hôm nay", icon: <DoneIcon />, type: "default" as const, disabled: true };
    }
  };
  const buttonProps = getButtonProps();

  return (
    <Spin spinning={loading} tip="Đang tải dữ liệu...">
      {/* --- STATS CARDS --- */}
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

      {/* --- MAIN CONTENT --- */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Ca làm việc hôm nay">
            <Table
              columns={columns}
              dataSource={data}
              pagination={false}
              rowKey={(r) => `${r.id}-${r.maNV}-${r.start}`}
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
              
              {/* Hiển thị ngày tháng */}
              <p style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>
                {currentTime ? (
                  `${currentTime.format("dddd")}, ${currentTime.format("DD/MM/YYYY")}`
                ) : (
                  <span style={{opacity: 0.5}}>Đang tải...</span>
                )}
              </p>

              {/* Hiển thị giờ lớn */}
              <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--primary-accent)", margin: "16px 0", minHeight: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {currentTime ? (
                  currentTime.format("HH:mm:ss")
                ) : (
                  <Spin size="default" />
                )}
              </div>

              <Button
                type={buttonProps.type}
                danger={(buttonProps as any).danger}
                icon={buttonProps.icon}
                onClick={handleChamCong}
                disabled={buttonProps.disabled}
                size="large"
                style={{
                  width: "100%",
                  height: "50px",
                  borderRadius: "14px",
                  fontWeight: 600,
                  fontSize: "1rem",
                  boxShadow: buttonProps.disabled ? "none" : "0 4px 12px rgba(0,0,0,0.15)",
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

/* ----------------- PAGE EXPORT ----------------- */
export default function DashboardPage() {
  const user = getUserFromToken();
  return (
    <AdminPage title="Bảng điều khiển">
      <App>
        <DashboardContent />
        <ClientOnly>
          {user ? <AiChatWidget employeeId={user.maNV} role={user.role} /> : null}
        </ClientOnly>
      </App>
    </AdminPage>
  );
}