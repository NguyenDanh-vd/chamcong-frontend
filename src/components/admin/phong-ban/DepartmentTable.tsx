//Chứa bảng hiển thị dữ liệu và các nút hành động (Sửa/Xóa).

import { Table, Space, Tooltip, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomButton from "@/components/CustomButton";

export interface Department {
  maPB: number;
  tenPhong: string;
  moTa?: string;
}

interface DepartmentTableProps {
  dataSource: Department[];
  loading: boolean;
  onEdit: (record: Department) => void;
  onDelete: (maPB: number) => void;
}

export default function DepartmentTable({
  dataSource,
  loading,
  onEdit,
  onDelete,
}: DepartmentTableProps) {
  const columns = [
    { title: "Mã PB", dataIndex: "maPB", key: "maPB", width: 100 },
    { title: "Tên phòng ban", dataIndex: "tenPhong", key: "tenPhong" },
    { title: "Mô tả", dataIndex: "moTa", key: "moTa" },
    {
      title: "Hành động",
      key: "action",
      align: "center" as const,
      width: 120,
      render: (_: any, record: Department) => (
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
              title="Xóa phòng ban"
              description="Bạn có chắc muốn xóa phòng ban này?"
              onConfirm={() => onDelete(record.maPB)}
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
      dataSource={dataSource}
      rowKey="maPB"
      loading={loading}
      bordered
    />
  );
}