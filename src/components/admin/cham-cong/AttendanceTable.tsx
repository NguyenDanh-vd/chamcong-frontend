import { Button, Card, Popconfirm, Space, Spin, Table, Tag, Tooltip, Typography } from "antd";
import { DeleteOutlined, EditOutlined, FileExcelOutlined } from "@ant-design/icons";
import { format, parseISO } from "date-fns";
import CustomButton from "@/components/CustomButton";
import { formatDuration, formatHours } from "@/utils/timeFormat";

const STATUS_MAP: Record<string, string> = {
  "chua-xac-nhan": "Chưa xác nhận",
  "hop-le": "Hợp lệ",
  "di-tre": "Đi trễ",
  "ve-som": "Về sớm",
  "tre-va-ve-som": "Trễ và về sớm",
  "da-checkout": "Đã check-out",
  "dang-lam-viec": "Đang làm việc",
};

interface AttendanceTableProps {
  loading: boolean;
  dataSource: any[];
  selectedRowKeys: React.Key[];
  onSelectChange: (keys: React.Key[]) => void;
  onEdit: (record: any) => void;
  onDelete: (id: number) => void;
  onExport: () => void;
}

const { Text } = Typography;

export default function AttendanceTable({
  loading,
  dataSource,
  selectedRowKeys,
  onSelectChange,
  onEdit,
  onDelete,
  onExport,
}: AttendanceTableProps) {
  const columns = [
    {
      title: "Nhân viên",
      dataIndex: ["nhanVien", "hoTen"],
      key: "hoTen",
      width: 220,
      render: (text: string) => <Text strong>{text || "Không có tên"}</Text>,
    },
    {
      title: "Ngày",
      dataIndex: "gioVao",
      key: "ngay",
      width: 120,
      render: (gioVao: string) => (gioVao ? format(parseISO(gioVao), "dd/MM/yyyy") : "--"),
    },
    {
      title: "Giờ vào",
      dataIndex: "gioVao",
      key: "gioVao",
      width: 110,
      render: (gioVao: string) => (gioVao ? format(parseISO(gioVao), "HH:mm:ss") : "--"),
    },
    {
      title: "Giờ ra",
      dataIndex: "gioRa",
      key: "gioRa",
      width: 120,
      render: (gioRa: string | null) => (gioRa ? format(parseISO(gioRa), "HH:mm:ss") : "Chưa check-out"),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      width: 150,
      render: (trangThai: string) => {
        let color = "geekblue";
        if (trangThai === "hop-le" || trangThai === "da-checkout") color = "success";
        if (trangThai === "di-tre") color = "error";
        if (trangThai === "ve-som") color = "warning";
        if (trangThai === "tre-va-ve-som") color = "magenta";
        if (trangThai === "dang-lam-viec") color = "processing";
        return (
          <Tag color={color} style={{ borderRadius: 999, paddingInline: 10 }}>
            {STATUS_MAP[trangThai] || trangThai}
          </Tag>
        );
      },
    },
    {
      title: "Đi trễ",
      dataIndex: "soPhutDiTre",
      key: "soPhutDiTre",
      width: 110,
      render: (val: number) => <span style={{ color: "#0369a1", fontWeight: 700 }}>{formatDuration(val)}</span>,
    },
    {
      title: "Về sớm",
      dataIndex: "soPhutVeSom",
      key: "soPhutVeSom",
      width: 110,
      render: (val: number) => <span style={{ color: "#0369a1", fontWeight: 700 }}>{formatDuration(val)}</span>,
    },
    {
      title: "Số giờ làm",
      dataIndex: "soGioLam",
      key: "soGioLam",
      width: 120,
      render: (val: number) => <span style={{ color: "#0b5ed7", fontWeight: 800 }}>{formatHours(val)}</span>,
    },
    {
      title: "Hành động",
      key: "action",
      align: "center" as const,
      fixed: "right" as const,
      width: 130,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Sửa">
            <CustomButton type="primary" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          </Tooltip>

          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa bản ghi chấm công"
              description="Bạn có chắc chắn muốn xóa bản ghi này?"
              onConfirm={() => onDelete(record.maCC)}
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
    <Card
      className="attendance-table-card"
      bordered={false}
      style={{ borderRadius: 18, boxShadow: "0 14px 28px rgba(15, 42, 96, 0.1)" }}
      bodyStyle={{ padding: 0, overflow: "hidden" }}
      title="Danh sách chấm công"
      extra={
        <Button
          type="primary"
          icon={<FileExcelOutlined />}
          onClick={onExport}
          style={{
            borderRadius: 10,
            fontWeight: 700,
            border: "none",
            background: "linear-gradient(135deg, #16a34a, #15803d)",
          }}
        >
          Xuất Excel
        </Button>
      }
    >
      <Spin spinning={loading}>
        <Table
          className="attendance-table"
          rowSelection={{
            selectedRowKeys,
            onChange: onSelectChange,
          }}
          columns={columns}
          dataSource={dataSource}
          rowKey="maCC"
          scroll={{ x: 1300 }}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: ["8", "12", "20", "30"],
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bản ghi`,
          }}
          locale={{ emptyText: "Không có dữ liệu chấm công phù hợp" }}
        />
      </Spin>

      <style jsx global>{`
        .attendance-table-card {
          border: 1px solid #dbeafe;
        }
        .attendance-table .ant-table-thead > tr > th {
          background: linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%) !important;
          color: #0f172a !important;
          font-weight: 700;
          border-bottom: 1px solid #dbeafe !important;
        }
        .attendance-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #eff6ff !important;
        }
        .attendance-table .ant-table-tbody > tr:hover > td {
          background: #f7fcff !important;
        }
        .attendance-table .ant-pagination .ant-pagination-item-active {
          border-color: #0ea5e9;
        }
        .attendance-table .ant-pagination .ant-pagination-item-active a {
          color: #0284c7;
        }
      `}</style>
    </Card>
  );
}
