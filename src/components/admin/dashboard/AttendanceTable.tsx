//Bảng danh sách nhân viên chấm công trong ngày.

import { Avatar, Card, Table, Tag } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { formatTime } from "@/utils/date";

export interface ShiftData {
  id: number;
  name: string;
  maNV: number;
  shift: string;
  start?: string | Date | null;
  end?: string | Date | null;
  status: string;
  avatar?: string | null;
}

interface AttendanceTableProps {
  data: ShiftData[];
  loading: boolean;
}

export default function AttendanceTable({ data, loading }: AttendanceTableProps) {
  const columns = [
    {
      title: "Nhân viên",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: ShiftData) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            src={record.avatar}
            icon={!record.avatar ? <UserOutlined /> : undefined}
            style={{
              backgroundColor: record.avatar ? "transparent" : "#3B82F6",
              minWidth: 34,
              width: 34,
              height: 34,
              flexShrink: 0,
              border: record.avatar ? "1px solid #e5e7eb" : "none",
            }}
          >
            {!record.avatar && text ? text.charAt(text.lastIndexOf(" ") + 1).toUpperCase() : null}
          </Avatar>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span
              style={{
                fontWeight: 600,
                color: "#1f2937",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {text}
            </span>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>MNV: {record.maNV}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Ca làm",
      dataIndex: "shift",
      key: "shift",
      render: (t: string) => (
        <Tag style={{ borderRadius: 999, borderColor: "#dbeafe", color: "#1d4ed8" }}>{t}</Tag>
      ),
    },
    {
      title: "Check-in",
      dataIndex: "start",
      key: "start",
      render: (t: string | Date | null) =>
        t ? (
          <Tag color="blue" style={{ borderRadius: 999, fontWeight: 600 }}>
            {formatTime(t, "HH:mm")}
          </Tag>
        ) : (
          "--"
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color: "default" | "green" | "red" | "orange" = "default";
        if (status === "Đang làm việc") color = "green";
        else if (status === "Vắng mặt") color = "red";
        else if (status === "Đi muộn") color = "orange";
        return (
          <Tag color={color} style={{ fontWeight: 600, borderRadius: 999, paddingInline: 10 }}>
            {status}
          </Tag>
        );
      },
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700 }}>Thống kê chấm công</span>
          <Tag color="blue" style={{ borderRadius: 999, marginInlineEnd: 0 }}>
            {data.length}
          </Tag>
        </div>
      }
      style={{
        borderRadius: "18px",
        border: "1px solid #edf2f7",
        boxShadow: "0 10px 24px rgba(0,0,0,0.04)",
      }}
      bodyStyle={{ paddingTop: 10 }}
    >
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 6, showSizeChanger: false }}
        rowKey="id"
        scroll={{ x: 680 }}
        loading={loading}
        size="middle"
        rowClassName={(record: ShiftData) => (record.status === "Vắng mặt" ? "row-muted" : "")}
      />
      <style jsx>{`
        :global(.ant-table-thead > tr > th) {
          background: #f8fafc;
          color: #334155;
          font-weight: 700;
          font-size: 12px;
        }
        .row-muted td {
          opacity: 0.62;
        }
      `}</style>
    </Card>
  );
}
