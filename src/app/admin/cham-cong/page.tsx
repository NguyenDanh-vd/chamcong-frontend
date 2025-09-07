"use client";
import React, { useEffect, useState, useCallback } from "react";
import api from "@/utils/api";
import AdminPage from "@/components/AdminPage";
import { format, parseISO } from "date-fns";
import {
  App,
  Table,
  Tag,
  Spin,
  Space,
  Button,
  DatePicker,
  Select,
  Row,
  Col,
  Modal,
  Form,
  TimePicker,
  Card,
  Tooltip, // Thêm Tooltip
} from "antd";
// Thay thế react-icons bằng icon của Ant Design
import { EditOutlined, DeleteOutlined, FileExcelOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import * as XLSX from "xlsx-js-style";
import { formatDuration, formatHours } from "@/utils/timeFormat";
import CustomButton from "@/components/CustomButton";
const { RangePicker } = DatePicker;
const { Option } = Select;

interface NhanVien {
  maNV: number;
  hoTen: string;
}
interface ChamCongRecord {
  maCC: number;
  nhanVien: NhanVien | null;
  gioVao: string;
  gioRa: string | null;
  trangThai: string;
  soPhutDiTre?: number;   // thêm
  soPhutVeSom?: number;   // thêm
  soGioLam?: number; 
}
interface Filters {
  tuNgay?: string;
  denNgay?: string;
  maNV?: number;
  trangThai?: string;
}

// Mapping trạng thái sang tiếng Việt
const STATUS_MAP: Record<string, string> = {
  "chua-xac-nhan": "Chưa xác nhận",
  "hop-le": "Hợp lệ",
  "di-tre": "Đi trễ",
  "ve-som": "Về sớm",
  "tre-va-ve-som": "Trễ và Về sớm",
  "da-checkout": "Đã check-out",
  "dang-lam-viec": "Đang làm việc",
};

export default function AdminChamCong() {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();

  const [attendances, setAttendances] = useState<ChamCongRecord[]>([]);
  const [nhanVienList, setNhanVienList] = useState<NhanVien[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ChamCongRecord | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // ================== FETCH ==================
  const fetchData = useCallback(() => {
    setLoading(true);
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value != null && value !== "")
    );

    api
      .get("/chamcong/admin-all", { params: activeFilters })
      .then((res) => setAttendances(Array.isArray(res.data) ? res.data : []))
      .catch(() => message.error("Lỗi khi tải dữ liệu chấm công"))
      .finally(() => setLoading(false));
  }, [filters, message]); 

  // Tải danh sách nhân viên (chỉ 1 lần)
  useEffect(() => {
    api
      .get("/nhanvien/all-basic")
      .then((res) => setNhanVienList(res.data))
      .catch(() => message.error("Lỗi khi tải danh sách nhân viên"));
  }, [message]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ================== FILTER ==================
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };

      if (key === 'dates') {
        delete newFilters.tuNgay;
        delete newFilters.denNgay;
        if (value && value.length === 2) {
          newFilters.tuNgay = value[0].startOf('day').toISOString();
          newFilters.denNgay = value[1].endOf('day').toISOString();
        }
      } else {
        if (value === undefined || value === null || value === '') {
          delete newFilters[key as keyof Filters];
        } else {
          (newFilters as any)[key] = value;
        }
      }
      return newFilters;
    });
  };

  // ================== CRUD ==================
  const showEditModal = (record: ChamCongRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      trangThai: record.trangThai,
      gioVao: record.gioVao ? dayjs(record.gioVao) : null,
      gioRa: record.gioRa ? dayjs(record.gioRa) : null,
    });
    setIsModalVisible(true);
  };

  const handleUpdate = async (values: any) => {
    if (!editingRecord) return;
    try {
      const originalDate = dayjs(editingRecord.gioVao);

      const formatDateTime = (timeValue: dayjs.Dayjs | null) => {
        if (!timeValue) return null;
        return originalDate
          .hour(timeValue.hour())
          .minute(timeValue.minute())
          .second(timeValue.second())
          .format("YYYY-MM-DD HH:mm:ss");
      };

      const payload = {
        trangThai: values.trangThai,
        gioVao: formatDateTime(values.gioVao),
        gioRa: formatDateTime(values.gioRa),
      };

      await api.put(`/chamcong/${editingRecord.maCC}`, payload);
      message.success("Cập nhật thành công!");
      setIsModalVisible(false);
      setEditingRecord(null);
      fetchData();
    } catch (err) {
      message.error("Lỗi khi cập nhật");
    }
  };

  const showDeleteConfirm = (id: number) => {
    modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa bản ghi chấm công này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await api.delete(`/chamcong/${id}`);
          message.success("Xóa thành công!");
          fetchData();
        } catch (error) {
          message.error("Lỗi khi xóa");
        }
      },
    });
  };

  // ================== EXPORT EXCEL ==================
  const exportToExcel = () => {
    const dataToExport =
      selectedRowKeys.length > 0
        ? attendances.filter((item) => selectedRowKeys.includes(item.maCC))
        : attendances;

    if (dataToExport.length === 0) {
      message.warning("Không có dữ liệu để xuất Excel!");
      return;
    }

    const worksheetData = [
      ["Nhân viên", "Ngày", "Giờ vào", "Giờ ra", "Trạng thái", "Đi trễ", "Về sớm", "Số giờ làm"],
      ...dataToExport.map((record) => [
        record.nhanVien?.hoTen || "Không có tên",
        record.gioVao ? format(parseISO(record.gioVao), "dd/MM/yyyy") : "--",
        record.gioVao ? format(parseISO(record.gioVao), "HH:mm:ss") : "--",
        record.gioRa
          ? format(parseISO(record.gioRa), "HH:mm:ss")
          : "Chưa check-out",
        STATUS_MAP[record.trangThai] || record.trangThai,
        formatDuration(record.soPhutDiTre ?? null),  
        formatDuration(record.soPhutVeSom ?? null),
        formatHours(record.soGioLam ?? null),         
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    const colWidths = worksheetData[0].map((_, i) => ({
      wch: worksheetData.reduce((w, r) => Math.max(w, r[i]?.toString().length ?? 10), 10)
    }));
    ws['!cols'] = colWidths;

    const range = XLSX.utils.decode_range(ws["!ref"]!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) {
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4CAF50" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    }

    // Style cho cột Đi trễ, Về sớm, Số giờ làm (vàng đậm)
  const highlightCols = [5, 6, 7]; // index theo worksheetData (0-based: 5=Đi trễ, 6=Về sớm, 7=Số giờ làm)
  for (let R = 1; R <= range.e.r; ++R) {
    highlightCols.forEach((C) => {
      const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
      if (cell) {
        cell.s = {
          font: { color: { rgb: "FFA500" }, bold: true }, // chữ cam vàng đậm
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    });
  }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ChamCong");
    XLSX.writeFile(wb, "DuLieuChamCong.xlsx");
  };

  // ================== TABLE (ĐÃ SỬA ICON) ==================
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
        if (trangThai === "di-tre") color = "red";   // sửa "tre" -> "di-tre"
        if (trangThai === "ve-som") color = "orange"; // tách riêng "ve-som"
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
           <span className="text-yellow-500 font-semibold">
              {formatHours(val)}
           </span>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      align: 'center' as const,
      render: (_: any, record: ChamCongRecord) => (
        <Space size="middle">
          <Tooltip title="Sửa">
            <CustomButton
              type="primary"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <CustomButton
              type="primary"
              icon={<DeleteOutlined />}
              danger
              onClick={() => showDeleteConfirm(record.maCC)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <AdminPage title="Quản lý Chấm Công">
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <RangePicker
              style={{ width: "100%" }}
              onChange={(dates) => handleFilterChange("dates", dates)}
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              showSearch
              allowClear
              placeholder="Lọc theo nhân viên"
              style={{ width: "100%" }}
              onChange={(value) => handleFilterChange("maNV", value)}
              filterOption={(input, option) =>
                String(option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {nhanVienList.map((nv) => (
                <Option key={nv.maNV} value={nv.maNV}>
                  {nv.hoTen}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Select
              allowClear
              placeholder="Lọc theo trạng thái"
              style={{ width: "100%" }}
              onChange={(value) => handleFilterChange("trangThai", value)}
            >
              {Object.entries(STATUS_MAP).map(([key, value]) => (
                <Option key={key} value={key}>{value}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      <Card
        title="Danh sách chấm công"
        extra={
          <Button
          type="primary"
            icon={<FileExcelOutlined />} // <-- ĐÃ SỬA ICON
            onClick={exportToExcel}
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
              onChange: (keys) => setSelectedRowKeys(keys),
            }}
            columns={columns}
            dataSource={attendances}
            rowKey="maCC"
            scroll={{ x: "max-content" }}
          />
        </Spin>
      </Card>

      <Modal
        title="Chỉnh sửa chấm công"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        afterClose={() => form.resetFields()}
        okButtonProps={{
        style: {
        background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
        color: "#fff",
        border: "none",
        fontWeight: 600,
        borderRadius: "8px",
        padding: "8px 20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        transition: "all 0.3s ease",
      },
        onMouseEnter: (e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
        },
        onMouseLeave: (e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = "1";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
        },
      }}
      cancelButtonProps={{
        style: {
        background: "linear-gradient(135deg, #dc2052ff, #b54242ff)",
        color: "#fff",
        border: "none",
        fontWeight: 600,
        borderRadius: "8px",
        padding: "8px 20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        transition: "all 0.3s ease",
      },
      onMouseEnter: (e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
      },
      onMouseLeave: (e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "1";
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
      },
    }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item name="gioVao" label="Giờ vào">
            <TimePicker format="HH:mm:ss" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="gioRa" label="Giờ ra">
            <TimePicker format="HH:mm:ss" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="trangThai"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select placeholder="Chọn trạng thái">
              {Object.entries(STATUS_MAP).map(([key, value]) => (
                  <Option key={key} value={key}>{value}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </AdminPage>
  );
}