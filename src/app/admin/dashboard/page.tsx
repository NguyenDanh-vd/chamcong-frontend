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
import dayjs from "dayjs";
import 'dayjs/locale/vi';
import { useTheme } from "@/contexts/ThemeContext"; 
dayjs.locale('vi');

// --- Interfaces ---
interface ShiftData {
  id: number;
  name: string;
  maNV: number;
  shift: string;
  start: string;
  end: string;
  status: string;
}

const DashboardContent = () => {
  const { message } = App.useApp();
  const { theme } = useTheme(); 
  
  const [currentTime, setCurrentTime] = useState<dayjs.Dayjs | null>(null);
  const [userName, setUserName] = useState('Admin');

  const [stats, setStats] = useState([
    { title: "Tổng nhân viên", value: 0, icon: <TeamOutlined />, color: "#1677ff" },
    { title: "Đang làm việc", value: 0, icon: <CheckCircleOutlined />, color: "#52c41a" },
    { title: "Vắng mặt", value: 0, icon: <ClockCircleOutlined />, color: "#faad14" },
    { title: "Nghỉ phép", value: 0, icon: <StopOutlined />, color: "#f5222d" },
  ]);

  const [data, setData] = useState<ShiftData[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState<"none" | "checked-in" | "done">("none");

  useEffect(() => {
    setCurrentTime(dayjs()); 
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getFormattedDate = (date: dayjs.Dayjs | null) => {
    if (!date) return '...'; 
    const weekday = date.format('dddd');
    const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return `${capitalizedWeekday}, ${date.format('DD/MM/YYYY')}`; 
  };

  const columns = [
    { title: "Tên nhân viên", dataIndex: "name", key: "name" },
    { title: "Ca làm", dataIndex: "shift", key: "shift", render: (text: string) => text || "--" },
    { title: "Giờ bắt đầu", dataIndex: "start", key: "start", render: (text: string) => text || "--" },
    { title: "Giờ kết thúc", dataIndex: "end", key: "end", render: (text: string) => text || "--" },
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
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const user = getUserFromToken(); 
      if (user && user.hoTen) {
          setUserName(user.hoTen);
      }

      const [shiftsRes, statsRes, myAttendance] = await Promise.all([
        api.get("/calamviec/today"),
        api.get("/stats/dashboard"),
        api.get("/chamcong/me"),
      ]);

      setData(shiftsRes.data);
      const s = statsRes.data;
      setStats(prevStats => [
        { ...prevStats[0], value: s.totalEmployees },
        { ...prevStats[1], value: s.working },
        { ...prevStats[2], value: s.absent },
        { ...prevStats[3], value: s.onLeave },
      ]);

      const today = new Date().toDateString();
      const todayRecord = myAttendance.data.find((r: any) => {
        if (!r.gioVao) return false;
        return new Date(r.gioVao).toDateString() === today;
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
  }, []);

  const handleChamCong = async () => {
    try {
      const user = getUserFromToken();
      if (!user || !user.maNV) {
        message.error("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.");
        return;
      }
      
      if (attendanceStatus === "none") {
        const res = await api.post("/chamcong/checkin", { maNV: user.maNV });
        const tenCa = res.data?.caLamViec?.tenCa || 'hiện tại';
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
            <Card style={{ 
                background: `linear-gradient(135deg, ${item.color}20, ${item.color}05)`,
                border: 'none'
            }}>
              <Statistic
                title={<span style={{ color: 'var(--text-secondary)' }}>{item.title}</span>}
                value={item.value}
                valueStyle={{ color: item.color, fontSize: '2rem', fontWeight: 600 }}
                prefix={<span style={{ color: item.color, marginRight: '8px' }}>{item.icon}</span>}
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
              rowKey="id"
              scroll={{ x: true }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontWeight: 600, fontSize: '1.2rem', color: theme === 'dark' ? '#E5E7EB' : 'var(--text-primary)' }}>
                Xin chào, {userName}!
              </h3>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                {getFormattedDate(currentTime)}
              </p>
              <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-accent)', margin: '16px 0', minHeight: '48px' }}>
                {/* 3. Hiển thị đồng hồ, nếu chưa có thì hiển thị placeholder */}
                {currentTime ? currentTime.format('HH:mm:ss') : '--:--:--'}
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
                    ? "linear-gradient(135deg, #9ca3af, #6b7280)" // xám khi done
                    : buttonProps.danger
                    ? "linear-gradient(135deg, #f87171, #ef4444)" // đỏ check-out
                    : "linear-gradient(135deg, #34d399, #10b981)", // xanh check-in
                     color: "#fff",
                     boxShadow: buttonProps.disabled
                    ? "none"
                    : "0 4px 12px rgba(0,0,0,0.15)",
                     transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!buttonProps.disabled) {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                       "0 6px 18px rgba(0,0,0,0.25)";
                       (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                   if (!buttonProps.disabled) {
                     (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.15)";
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
  return (
    <AdminPage title="Bảng điều khiển">
      <App>
        <DashboardContent />
      </App>
    </AdminPage>
  );
}