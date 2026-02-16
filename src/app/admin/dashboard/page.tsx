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

// Import Components
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import AttendanceTable, { ShiftData } from "@/components/admin/dashboard/AttendanceTable";
import RecentActivities from "@/components/admin/dashboard/RecentActivities";
import CheckInModal from "@/components/admin/dashboard/CheckInModal";


/* ----------------- XỬ LÝ AVATAR ----------------- */
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


/* ======================================================
   DASHBOARD CONTENT 
====================================================== */
const DashboardContent = () => {
  const { message } = App.useApp();

  const [currentTime, setCurrentTime] = useState<dayjs.Dayjs | null>(null);
  const [userName, setUserName] = useState("Admin");
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<
    "none" | "checked-in" | "done"
  >("none");

  const [stats, setStats] = useState([
    { title: "Tổng nhân sự", value: 0, sub: "Nhân viên", icon: <TeamOutlined />, color: "#1D4ED8", bg: "#E4F2FF" },
    { title: "Hiện diện", value: 0, sub: "Đang làm việc", subColor: "#047857", icon: <CheckCircleOutlined />, color: "#047857", bg: "#E7FAF2" },
    { title: "Đi muộn", value: 0, sub: "Hôm nay", subColor: "#6D28D9", icon: <ClockCircleOutlined />, color: "#6D28D9", bg: "#F0EAFE" },
    { title: "Vắng mặt", value: 0, sub: "0 Nghỉ phép", icon: <CloseCircleOutlined />, color: "#B45309", bg: "#FFF4DE" }
  ]);

  const [data, setData] = useState<ShiftData[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  /* ============================
       UPDATE CLOCK REALTIME
     ============================ */
  useEffect(() => {
    setCurrentTime(dayjs());
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);


  /* ============================
       FETCH DATA
     ============================ */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [shiftsRes, statsRes, myAttendance, profileRes, allUsersRes] =
        await Promise.all([
          api.get("/calamviec/today"),
          api.get("/stats/dashboard"),
          api.get("/chamcong/me"),
          api.get("/nhanvien/profile").catch(() => ({ data: null })),
          api.get("/nhanvien/all-basic").catch(() => ({ data: [] })),
        ]);

      /** Profile header */
      if (profileRes?.data) {
        setUserName(profileRes.data.hoTen);
        setUserAvatar(
          normalizeAvatarUrl(profileRes.data.avatarUrl || profileRes.data.avatar)
        );
      } else {
        const u = getUserFromToken();
        if (u?.hoTen) setUserName(u.hoTen);
      }

      /** Map avatar theo maNV */
      const avatarMap = new Map<string, string>();
      allUsersRes.data.forEach((u: any) => {
        if (u?.maNV !== undefined && u?.maNV !== null) {
          avatarMap.set(String(u.maNV), normalizeAvatarUrl(u.avatarUrl || u.avatar));
        }
      });

      /** Dữ liệu bảng */
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

      /** Recent activities */
      const activities = normalized
        .filter((item) => item.start)
        .slice(0, 5)
        .map((item) => ({
          ...item,
          action: item.status === "Đang làm việc" ? "Check-in" : item.status,
          time: item.start ? formatTime(item.start, "HH:mm") : "--:--",
        }));

      setRecentActivities(activities);

      /** Dashboard stats */
      const s = statsRes.data || {};
      setStats([
        { title: "Tổng nhân sự", value: s.totalEmployees || 0, sub: "Toàn bộ", icon: <TeamOutlined />, color: "#1D4ED8", bg: "#E4F2FF" },
        { title: "Hiện diện", value: s.working || 0, sub: "Đang check-in", subColor: "#047857", icon: <CheckCircleOutlined />, color: "#047857", bg: "#E7FAF2" },
        { title: "Đi muộn", value: s.late || 0, sub: "Hôm nay", subColor: "#6D28D9", icon: <ClockCircleOutlined />, color: "#6D28D9", bg: "#F0EAFE" },
        { title: "Vắng mặt", value: s.absent || 0, sub: `${s.onLeave || 0} Nghỉ phép`, icon: <CloseCircleOutlined />, color: "#B45309", bg: "#FFF4DE" },
      ]);

      /** Check-in status */
      const todayStr = dayjs().format("YYYY-MM-DD");

      const todayRecord = (myAttendance.data || []).find((r: any) =>
        dayjs(r.gioVao).format("YYYY-MM-DD") === todayStr
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

  /* =============================
      HANDLE CHECK-IN / OUT
     ============================= */
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
          {user ? (
            <AiChatWidget employeeId={user.maNV} role={user.role} />
          ) : null}
        </ClientOnly>
      </App>
    </AdminPage>
  );
}
