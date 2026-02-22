"use client";

import React, { useEffect, useState } from "react";
import AdminPage from "@/components/AdminPage";
import { App, Col, Row, Spin } from "antd";
import api from "@/utils/api";
import { getUserFromToken } from "@/utils/auth";
import { API_URL } from "@/utils/config";
import {
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import ClientOnly from "@/components/ClientOnly";
import AiChatWidget from "@/components/AiChatWidget";

import { formatTime } from "@/utils/date";
import dayjs from "dayjs";
import "dayjs/locale/vi";

import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import AttendanceTable, { ShiftData } from "@/components/admin/dashboard/AttendanceTable";
import RecentActivities from "@/components/admin/dashboard/RecentActivities";
import CheckInModal from "@/components/admin/dashboard/CheckInModal";

const getAvatarUrl = (avatar?: string | null) => {
  if (!avatar) return undefined;
  const raw = String(avatar).trim();
  if (!raw) return undefined;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return encodeURI(raw);
  if (raw.startsWith("/uploads")) return encodeURI(`${API_URL}${raw}`);
  if (raw.startsWith("uploads/")) return encodeURI(`${API_URL}/${raw}`);
  if (raw.startsWith("/")) return encodeURI(`${API_URL}${raw}`);
  if (raw.includes("/uploads/")) return encodeURI(`${API_URL}${raw.slice(raw.indexOf("/uploads/"))}`);
  return encodeURI(`${API_URL}/uploads/avatars/${raw}`);
};

const normalizeAvatarUrl = (avatar?: string | null) => {
  if (!avatar) return "";
  return getAvatarUrl(avatar) || "";
};

const DashboardContent = () => {
  const { message } = App.useApp();

  const [currentTime, setCurrentTime] = useState<dayjs.Dayjs | null>(null);
  const [userName, setUserName] = useState("Admin");
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<"none" | "checked-in" | "done">("none");

  const [stats, setStats] = useState([
    {
      title: "Tổng nhân sự",
      value: 0,
      sub: "Toàn bộ",
      icon: <TeamOutlined />,
      color: "#0b5ed7",
      bg: "linear-gradient(150deg, #eef6ff 0%, #dbeeff 55%, #cfe7ff 100%)",
      rate: 100,
    },
    {
      title: "Hiện diện",
      value: 0,
      sub: "Đang check-in",
      icon: <CheckCircleOutlined />,
      color: "#0284c7",
      bg: "linear-gradient(150deg, #effcff 0%, #d9f3ff 55%, #c8ecff 100%)",
      rate: 0,
    },
    {
      title: "Đi muộn",
      value: 0,
      sub: "Hôm nay",
      icon: <ClockCircleOutlined />,
      color: "#0369a1",
      bg: "linear-gradient(150deg, #ebfbff 0%, #d6f3ff 55%, #c4ebff 100%)",
      rate: 0,
    },
    {
      title: "Vắng mặt",
      value: 0,
      sub: "0 Nghỉ phép",
      icon: <CloseCircleOutlined />,
      color: "#2563eb",
      bg: "linear-gradient(150deg, #f2f7ff 0%, #e2edff 55%, #d4e5ff 100%)",
      rate: 0,
    },
  ]);

  const [data, setData] = useState<ShiftData[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    setCurrentTime(dayjs());
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shiftsRes, statsRes, myAttendance, profileRes, allUsersRes] = await Promise.all([
        api.get("/calamviec/today"),
        api.get("/stats/dashboard"),
        api.get("/chamcong/me"),
        api.get("/nhanvien/profile").catch(() => ({ data: null })),
        api.get("/nhanvien/all-basic").catch(() => ({ data: [] })),
      ]);

      if (profileRes?.data) {
        setUserName(profileRes.data.hoTen);
        setUserAvatar(normalizeAvatarUrl(profileRes.data.avatarUrl || profileRes.data.avatar));
      } else {
        const u = getUserFromToken();
        if (u?.hoTen) setUserName(u.hoTen);
      }

      const avatarMap = new Map<string, string>();
      allUsersRes.data.forEach((u: any) => {
        if (u?.maNV !== undefined && u?.maNV !== null) {
          avatarMap.set(String(u.maNV), normalizeAvatarUrl(u.avatarUrl || u.avatar));
        }
      });

      const raw = Array.isArray(shiftsRes.data) ? shiftsRes.data : [];
      const normalized: ShiftData[] = raw.map((r: any, idx: number) => {
        const maNV = r.maNV ?? r.nhanVien?.maNV ?? idx;
        const rawAvatar = normalizeAvatarUrl(
          r.avatarUrl ||
            r.nhanVien?.avatarUrl ||
            r.avatar ||
            r.nhanVien?.avatar ||
            avatarMap.get(String(maNV)) ||
            null
        );

        return {
          id: r.id ?? idx,
          name: r.name ?? r.hoTen ?? r.nhanVien?.hoTen ?? "—",
          maNV,
          shift: r.shift ?? r.tenCa ?? "—",
          start: r.gioVao ?? null,
          end: r.gioRa ?? null,
          status: r.status ?? r.trangThaiText ?? "—",
          avatar: rawAvatar || null,
        };
      });

      setData(normalized);

      const activities = normalized
        .filter((item) => item.start)
        .slice(0, 5)
        .map((item) => ({
          ...item,
          action: item.status === "Đang làm việc" ? "Check-in" : item.status,
          time: item.start ? formatTime(item.start, "HH:mm") : "--:--",
        }));
      setRecentActivities(activities);

      const s = statsRes.data || {};
      const totalEmployees = Number(s.totalEmployees || 0);
      const working = Number(s.working || 0);
      const late = Number(s.late || 0);
      const absent = Number(s.absent || 0);

      setStats([
        {
          title: "Tổng nhân sự",
          value: totalEmployees,
          sub: "Toàn bộ",
          icon: <TeamOutlined />,
          color: "#0b5ed7",
          bg: "linear-gradient(150deg, #eef6ff 0%, #dbeeff 55%, #cfe7ff 100%)",
          rate: 100,
        },
        {
          title: "Hiện diện",
          value: working,
          sub: "Đang check-in",
          icon: <CheckCircleOutlined />,
          color: "#0284c7",
          bg: "linear-gradient(150deg, #effcff 0%, #d9f3ff 55%, #c8ecff 100%)",
          rate: totalEmployees > 0 ? (working / totalEmployees) * 100 : 0,
        },
        {
          title: "Đi muộn",
          value: late,
          sub: "Hôm nay",
          icon: <ClockCircleOutlined />,
          color: "#0369a1",
          bg: "linear-gradient(150deg, #ebfbff 0%, #d6f3ff 55%, #c4ebff 100%)",
          rate: totalEmployees > 0 ? (late / totalEmployees) * 100 : 0,
        },
        {
          title: "Vắng mặt",
          value: absent,
          sub: `${s.onLeave || 0} Nghỉ phép`,
          icon: <CloseCircleOutlined />,
          color: "#2563eb",
          bg: "linear-gradient(150deg, #f2f7ff 0%, #e2edff 55%, #d4e5ff 100%)",
          rate: totalEmployees > 0 ? (absent / totalEmployees) * 100 : 0,
        },
      ]);

      const todayStr = dayjs().format("YYYY-MM-DD");
      const todayRecord = (myAttendance.data || []).find(
        (r: any) => dayjs(r.gioVao).format("YYYY-MM-DD") === todayStr
      );

      if (!todayRecord) setAttendanceStatus("none");
      else if (!todayRecord.gioRa) setAttendanceStatus("checked-in");
      else setAttendanceStatus("done");
    } catch (err) {
      console.error(err);
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
      if (!user?.maNV) return message.error("Lỗi thông tin nhân viên");

      if (attendanceStatus === "none") {
        await api.post("/chamcong/checkin", { maNV: user.maNV });
        message.success("Check-in thành công!");
      } else if (attendanceStatus === "checked-in") {
        await api.post("/chamcong/checkout", { maNV: user.maNV });
        message.success("Check-out thành công!");
      }

      fetchData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi chấm công");
    }
  };

  return (
    <Spin spinning={loading}>
      <div
        style={{
          padding: "6px 0 20px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <DashboardHeader
          userName={userName}
          userAvatar={userAvatar}
          currentTime={currentTime}
          onOpenCheckIn={() => setIsModalOpen(true)}
        />

        <DashboardStats stats={stats} />

        <Row gutter={[20, 20]} align="stretch">
          <Col xs={24} xl={16}>
            <AttendanceTable data={data} loading={loading} />
          </Col>
          <Col xs={24} xl={8}>
            <RecentActivities activities={recentActivities} />
          </Col>
        </Row>
      </div>

      <CheckInModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        userName={userName}
        currentTime={currentTime}
        attendanceStatus={attendanceStatus}
        onCheckIn={handleChamCong}
      />
    </Spin>
  );
};

export default function DashboardPage() {
  const user = getUserFromToken();

  return (
    <AdminPage title="Tổng quan">
      <App>
        <DashboardContent />
        <ClientOnly>
          {user ? <AiChatWidget employeeId={user.maNV} role={user.role} /> : null}
        </ClientOnly>
      </App>
    </AdminPage>
  );
}
