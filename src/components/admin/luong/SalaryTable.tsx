//Bảng hiển thị dữ liệu.

import { Table, Tag, Space, Popconfirm } from "antd";
import { EditOutlined, CheckCircleOutlined } from "@ant-design/icons";
import CustomButton from "@/components/CustomButton";
import { formatHours } from "./salary.utils";

interface SalaryTableProps {
  data: any[];
  loading: boolean;
  onEdit: (record: any) => void;
  onMarkPaid: (id: number) => void;
  updatingId: number | null;
}

export default function SalaryTable({
  data,
  loading,
  onEdit,
  onMarkPaid,
  updatingId,
}: SalaryTableProps) {
  const columns = [
    { title: "Mã NV", dataIndex: ["nhanVien", "maNV"], key: "maNV", width: 90 },
    { title: "Họ tên", dataIndex: ["nhanVien", "hoTen"], key: "hoTen", width: 200 },
    { title: "Tháng", dataIndex: "thang", key: "thang", width: 150 },
    {
      title: "Tổng giờ làm",
      dataIndex: "tongGioLam",
      key: "tongGioLam",
      render: (value: number) => formatHours(value),
      width: 130,
    },
    { title: "Lương cơ bản", dataIndex: "luongCoBan", key: "luongCoBan", width: 150 },
    { title: "Thưởng", dataIndex: "thuong", key: "thuong", width: 120 },
    { title: "Phạt", dataIndex: "phat", key: "phat", width: 120 },
    { title: "Làm thêm", dataIndex: "lamThem", key: "lamThem", width: 120 },
    { title: "Tổng lương", dataIndex: "tongLuong", key: "tongLuong", width: 160 },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      width: 120,
      render: (value: string) =>
        value === "da-tra" ? (
          <Tag color="green">Đã trả</Tag>
        ) : (
          <Tag color="red">Chưa trả</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 130,
      render: (_: any, record: any) => (
        <Space>
          <CustomButton
            icon={<EditOutlined />}
            type="primary"
            onClick={() => onEdit(record)}
            title="Chỉnh sửa"
            style={{
              background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "8px 20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          />

          {record.trangThai !== "da-tra" && (
            <Popconfirm
              title="Xác nhận trả lương?"
              onConfirm={() => onMarkPaid(record.maLuong)}
            >
              <CustomButton
                icon={<CheckCircleOutlined />}
                type="primary"
                title="Đã trả"
                loading={updatingId === record.maLuong}
                style={{
                  background: "linear-gradient(135deg, #2ed71bff, #1cbc47ff)",
                  color: "#fff",
                  border: "none",
                  fontWeight: 600,
                  borderRadius: "8px",
                  padding: "8px 20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                Đã trả
              </CustomButton>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="maLuong"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{ pageSize: 10 }}
      bordered
      scroll={{ x: "max-content" }}
    />
  );
}