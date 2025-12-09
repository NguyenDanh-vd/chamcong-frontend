//Bảng danh sách nhân viên chấm công trong ngày.

import { Avatar, Badge, Card, Table, Tag } from "antd";
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            src={record.avatar}
            icon={!record.avatar ? <UserOutlined /> : undefined}
            style={{
              backgroundColor: record.avatar ? 'transparent' : '#3B82F6',
              minWidth: 32,
              flexShrink: 0,
              border: record.avatar ? '1px solid #e5e7eb' : 'none'
            }}
          >
            {!record.avatar && text ? text.charAt(text.lastIndexOf(" ") + 1).toUpperCase() : null}
          </Avatar>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, color: '#1f2937' }}>{text}</span>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>MNV: {record.maNV}</span>
          </div>
        </div>
      )
    },
    { title: "Ca làm", dataIndex: "shift", key: "shift", render: (t: any) => <Tag>{t}</Tag> },
    { title: "Check-in", dataIndex: "start", key: "start", render: (t: any) => t ? <Tag color="blue">{formatTime(t, "HH:mm")}</Tag> : "--" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";
        if (status === "Đang làm việc") color = "success";
        if (status === "Vắng mặt") color = "error";
        if (status === "Đi muộn") color = "warning";
        return <Badge status={color as any} text={status} />;
      }
    }
  ];

  return (
    <Card title="Thống kê chấm công" style={{ borderRadius: '16px', border: 'none', boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
      <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} rowKey="id" scroll={{ x: true }} loading={loading} />
    </Card>
  );
}