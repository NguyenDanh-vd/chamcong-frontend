//Phần đầu trang chứa thông tin Admin, đồng hồ và nút chấm công.

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
    marginBottom: 24,
    borderRadius: 20,
    padding: "20px 22px",
    background:
      "linear-gradient(130deg, #ffffff 0%, #f8fbff 55%, #eef5ff 100%)",
    border: "1px solid #e6edf7",
    boxShadow: "0 16px 32px rgba(15, 23, 42, 0.05)",
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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
          <Avatar
            size={64}
            src={userAvatar}
            icon={!userAvatar ? <UserOutlined /> : undefined}
            style={{
              border: "2px solid #dbeafe",
              backgroundColor: "#fff",
              boxShadow: "0 8px 18px rgba(59,130,246,0.16)",
            }}
          />
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(20px, 2.2vw, 26px)",
                fontWeight: 800,
                color: "#0f172a",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Xin chào, {userName} 👋
            </h2>
            <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 13 }}>
              {currentTime ? currentTime.locale("vi").format("dddd, DD/MM/YYYY") : "..."} ·{" "}
              <span style={{ fontWeight: 700, color: "#0f172a" }}>
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
            style={{ width: 220, borderRadius: "10px", height: 40 }}
          />
          <DatePicker
            placeholder="Chọn ngày"
            style={{ borderRadius: "10px", height: 40, minWidth: 150 }}
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
                boxShadow: "0 10px 22px rgba(59, 130, 246, 0.22)",
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
          borderTop: "1px solid #e8eef8",
          paddingTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 12, color: "#64748b" }}>Bảng điều khiển chấm công</span>
        <span style={{ fontSize: 12, color: "#64748b" }}>
          Cập nhật:{" "}
          <strong style={{ color: "#1f2937" }}>
            {currentTime ? currentTime.format("HH:mm:ss") : "--:--:--"}
          </strong>
        </span>
      </div>
    </div>
  );
}
