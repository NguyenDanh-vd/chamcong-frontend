//Chứa Bảng hiển thị dữ liệu và nút Xuất Excel.

import { Table, Tag, Button, Card, Tooltip, Space, Spin } from "antd";
import { EditOutlined, DeleteOutlined, FileExcelOutlined } from "@ant-design/icons";
import { format, parseISO } from "date-fns";
import CustomButton from "@/components/CustomButton";
import { formatDuration, formatHours } from "@/utils/timeFormat";

// Mapping trạng thái
const STATUS_MAP: Record<string, string> = {
  "chua-xac-nhan": "Chưa xác nhận",
  "hop-le": "Hợp lệ",
  "di-tre": "Đi trễ",
  "ve-som": "Về sớm",
  "tre-va-ve-som": "Trễ và Về sớm",
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
      render: (text: string) => text || "Không có tên",
    },
    {
      title: "Ngày",
      dataIndex: "gioVao",
      key: "ngay",
      render: (gioVao: string) =>
        gioVao ? format(parseISO(gioVao), "dd/MM/yyyy") : "--",
    },
    {
      title: "Giờ vào",
      dataIndex: "gioVao",
      key: "gioVao",
      render: (gioVao: string) =>
        gioVao ? format(parseISO(gioVao), "HH:mm:ss") : "--",
    },
    {
      title: "Giờ ra",
      dataIndex: "gioRa",
      key: "gioRa",
      render: (gioRa: string | null) =>
        gioRa ? format(parseISO(gioRa), "HH:mm:ss") : "Chưa check-out",
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      render: (trangThai: string) => {
        let color = "geekblue";
        if (trangThai === "hop-le" || trangThai === "da-checkout") color = "green";
        if (trangThai === "di-tre") color = "red";
        if (trangThai === "ve-som") color = "orange";
        if (trangThai === "tre-va-ve-som") color = "magenta";
        if (trangThai === "dang-lam-viec") color = "blue";
        return <Tag color={color}>{STATUS_MAP[trangThai] || trangThai}</Tag>;
      },
    },
    {
      title: "Đi trễ",
      dataIndex: "soPhutDiTre",
      key: "soPhutDiTre",
      render: (val: number) => (
        <span className="text-yellow-500 font-semibold">
          {formatDuration(val)}
        </span>
      ),
    },
    {
      title: "Về sớm",
      dataIndex: "soPhutVeSom",
      key: "soPhutVeSom",
      render: (val: number) => (
        <span className="text-yellow-500 font-semibold">
          {formatDuration(val)}
        </span>
      ),
    },
    {
      title: "Số giờ làm",
      dataIndex: "soGioLam",
      key: "soGioLam",
      render: (val: number) => (
        <span className="text-yellow-500 font-semibold">{formatHours(val)}</span>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center" as const,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Sửa">
            <CustomButton
              type="primary"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <CustomButton
              type="primary"
              icon={<DeleteOutlined />}
              danger
              onClick={() => onDelete(record.maCC)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Danh sách chấm công"
      extra={
        <Button
          type="primary"
          icon={<FileExcelOutlined />}
          onClick={onExport}
          className="!bg-gradient-to-r !from-green-500 !to-emerald-600 
            !text-white !font-medium !shadow-md
            hover:!from-green-600 hover:!to-emerald-700 
            active:scale-95 transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2 px-5 py-2.5 rounded-xl"
        >
          Xuất Excel
        </Button>
      }
    >
      <Spin spinning={loading}>
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: onSelectChange,
          }}
          columns={columns}
          dataSource={dataSource}
          rowKey="maCC"
          scroll={{ x: "max-content" }}
        />
      </Spin>
    </Card>
  );
}