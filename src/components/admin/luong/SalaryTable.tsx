import { Card, Popconfirm, Space, Table, Tag, Tooltip, Typography } from "antd";
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

const { Text } = Typography;

const formatCurrency = (value: number | null | undefined) =>
  Number(value || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export default function SalaryTable({ data, loading, onEdit, onMarkPaid, updatingId }: SalaryTableProps) {
  const columns = [
    { title: "Mã NV", dataIndex: ["nhanVien", "maNV"], key: "maNV", width: 90, render: (v: any) => <Text strong>{v}</Text> },
    {
      title: "Họ tên",
      dataIndex: ["nhanVien", "hoTen"],
      key: "hoTen",
      width: 220,
      render: (v: any) => <Text strong>{v || "-"}</Text>,
    },
    { title: "Tháng", dataIndex: "thang", key: "thang", width: 120 },
    {
      title: "Tổng giờ làm",
      dataIndex: "tongGioLam",
      key: "tongGioLam",
      render: (value: number) => <Text style={{ color: "#0b5ed7", fontWeight: 700 }}>{formatHours(value)}</Text>,
      width: 130,
    },
    {
      title: "Lương cơ bản",
      dataIndex: "luongCoBan",
      key: "luongCoBan",
      width: 150,
      render: (value: number) => <span>{formatCurrency(value)}</span>,
    },
    {
      title: "Thưởng",
      dataIndex: "thuong",
      key: "thuong",
      width: 140,
      render: (value: number) => <span style={{ color: "#0284c7", fontWeight: 700 }}>{formatCurrency(value)}</span>,
    },
    {
      title: "Phạt",
      dataIndex: "phat",
      key: "phat",
      width: 140,
      render: (value: number) => <span style={{ color: "#ef4444", fontWeight: 700 }}>{formatCurrency(value)}</span>,
    },
    {
      title: "Làm thêm",
      dataIndex: "lamThem",
      key: "lamThem",
      width: 140,
      render: (value: number) => <span style={{ color: "#0369a1", fontWeight: 700 }}>{formatCurrency(value)}</span>,
    },
    {
      title: "Tổng lương",
      dataIndex: "tongLuong",
      key: "tongLuong",
      width: 170,
      render: (value: number) => (
        <Text strong style={{ color: "#0f172a" }}>
          {formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      width: 130,
      render: (value: string) =>
        value === "da-tra" ? (
          <Tag color="success" style={{ borderRadius: 999, paddingInline: 10 }}>
            Đã trả
          </Tag>
        ) : (
          <Tag color="processing" style={{ borderRadius: 999, paddingInline: 10 }}>
            Chưa trả
          </Tag>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 185,
      fixed: "right" as const,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <CustomButton icon={<EditOutlined />} type="primary" onClick={() => onEdit(record)} />
          </Tooltip>

          {record.trangThai !== "da-tra" ? (
            <Popconfirm
              title="Xác nhận đã trả lương?"
              onConfirm={() => onMarkPaid(record.maLuong)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <CustomButton icon={<CheckCircleOutlined />} type="primary" loading={updatingId === record.maLuong}>
                Đã trả
              </CustomButton>
            </Popconfirm>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <Card
      className="salary-table-card"
      bordered={false}
      style={{ borderRadius: 18, boxShadow: "0 14px 28px rgba(15, 42, 96, 0.1)" }}
      bodyStyle={{ padding: 0, overflow: "hidden" }}
    >
      <Table
        className="salary-table"
        rowKey="maLuong"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          pageSize: 8,
          showSizeChanger: true,
          pageSizeOptions: ["8", "12", "20", "30"],
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} dòng`,
        }}
        scroll={{ x: 1400 }}
        locale={{
          emptyText: "Không có dữ liệu lương",
        }}
      />

      <style jsx global>{`
        .salary-table-card {
          border: 1px solid #dbeafe;
        }
        .salary-table .ant-table-thead > tr > th {
          background: linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%) !important;
          color: #0f172a !important;
          font-weight: 700;
          border-bottom: 1px solid #dbeafe !important;
        }
        .salary-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #eff6ff !important;
        }
        .salary-table .ant-table-tbody > tr:hover > td {
          background: #f7fcff !important;
        }
        .salary-table .ant-pagination .ant-pagination-item-active {
          border-color: #0ea5e9;
        }
        .salary-table .ant-pagination .ant-pagination-item-active a {
          color: #0284c7;
        }
      `}</style>
    </Card>
  );
}
