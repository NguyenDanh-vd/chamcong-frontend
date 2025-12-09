//File này chứa Bảng hiển thị và các cột.

import { Table, Switch, Space, Tooltip, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomButton from "@/components/CustomButton";

export interface Shift {
  maCa: number;
  tenCa: string;
  gioBatDau: string;
  gioKetThuc: string;
  trangThai: boolean;
}

interface ShiftTableProps {
  shifts: Shift[];
  loading: boolean;
  onEdit: (record: Shift) => void;
  onDelete: (maCa: number) => void;
  onStatusChange: (checked: boolean, record: Shift) => void;
}

export default function ShiftTable({
  shifts,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
}: ShiftTableProps) {
  const columns = [
    { title: "Mã Ca", dataIndex: "maCa", key: "maCa", width: 100 },
    { title: "Tên Ca", dataIndex: "tenCa", key: "tenCa" },
    { title: "Giờ Bắt Đầu", dataIndex: "gioBatDau", key: "gioBatDau" },
    { title: "Giờ Kết Thúc", dataIndex: "gioKetThuc", key: "gioKetThuc" },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center" as const,
      render: (value: boolean, record: Shift) => (
        <Switch
          checked={value}
          checkedChildren="Hoạt động"
          unCheckedChildren="Ngưng"
          onChange={(checked) => onStatusChange(checked, record)}
        />
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center" as const,
      width: 120,
      render: (_: any, record: Shift) => (
        <Space size="middle">
          <Tooltip title="Sửa">
            <CustomButton
              type="primary"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa ca làm việc"
              description="Bạn có chắc muốn xóa ca làm này?"
              onConfirm={() => onDelete(record.maCa)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <CustomButton type="primary" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={shifts}
      rowKey="maCa"
      loading={loading}
      bordered
    />
  );
}