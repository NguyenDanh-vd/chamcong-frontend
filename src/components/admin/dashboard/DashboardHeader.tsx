import { Avatar, Button, DatePicker, Input, Tooltip } from "antd";
import { SearchOutlined, ScanOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import React from "react";

interface DashboardHeaderProps {
  userName: string;
  userAvatar: string;
  currentTime: dayjs.Dayjs | null;
  onOpenCheckIn: () => void;
}

export default function DashboardHeader({
  userName,
  userAvatar,
  currentTime,
  onOpenCheckIn,
}: DashboardHeaderProps) {
  const shellStyle: React.CSSProperties = {
    borderRadius: 20,
    padding: "22px 22px 18px",
    background: "linear-gradient(135deg, #0f2a60 0%, #134e8f 42%, #0f8ac9 100%)",
    boxShadow: "0 18px 38px rgba(15, 42, 96, 0.28)",
    overflow: "hidden",
    position: "relative",
  };

  return (
    <div style={shellStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
          <Avatar
            size={64}
            src={userAvatar}
            icon={!userAvatar ? <UserOutlined /> : undefined}
            style={{
              border: "2px solid rgba(186, 230, 253, 0.65)",
              backgroundColor: "#fff",
              boxShadow: "0 8px 18px rgba(14,165,233,0.24)",
            }}
          />
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(20px, 2.2vw, 26px)",
                fontWeight: 800,
                color: "#f8fbff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Xin chào, {userName}
            </h2>
            <p style={{ margin: "6px 0 0", color: "rgba(241,245,249,0.9)", fontSize: 13 }}>
              {currentTime ? currentTime.locale("vi").format("dddd, DD/MM/YYYY") : "..."} ·{" "}
              <span style={{ fontWeight: 700, color: "#f8fbff" }}>
                {currentTime ? currentTime.format("HH:mm:ss") : "--:--:--"}
              </span>
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <Input
            prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
            placeholder="Tìm kiếm..."
            style={{ width: 220, borderRadius: "10px", height: 40, borderColor: "#bfdbfe" }}
          />
          <DatePicker
            placeholder="Chọn ngày"
            style={{ borderRadius: "10px", height: 40, minWidth: 150, borderColor: "#bfdbfe" }}
            defaultValue={dayjs()}
            format={"DD/MM/YYYY"}
          />

          <Tooltip title="Chấm công ngay">
            <Button
              type="primary"
              onClick={onOpenCheckIn}
              icon={<ScanOutlined />}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                height: 42,
                borderRadius: 10,
                fontWeight: 700,
                border: "none",
                background: "linear-gradient(135deg, #16a34a, #15803d)",
                boxShadow: "0 10px 22px rgba(22,163,74,0.24)",
              }}
            >
              <span style={{ fontWeight: 700 }}>Chấm công</span>
            </Button>
          </Tooltip>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          borderTop: "1px solid rgba(226,232,240,0.35)",
          paddingTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          position: "relative",
          zIndex: 1,
        }}
      >
        <span style={{ fontSize: 12, color: "rgba(241,245,249,0.82)" }}>Bảng điều khiển chấm công</span>
        <span style={{ fontSize: 12, color: "rgba(241,245,249,0.82)" }}>
          Cập nhật:{" "}
          <strong style={{ color: "#f8fbff" }}>
            {currentTime ? currentTime.format("HH:mm:ss") : "--:--:--"}
          </strong>
        </span>
      </div>

      <span
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: "50%",
          right: -70,
          bottom: -120,
          background: "radial-gradient(circle, rgba(125, 211, 252, 0.36) 0%, rgba(125, 211, 252, 0) 72%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
