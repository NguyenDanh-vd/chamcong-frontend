"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import AdminPage from "@/components/AdminPage";
import { format, parseISO } from "date-fns";
import { App, Card, Col, Form, Row, Space, Statistic, Tag, Typography, message } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, ExportOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import * as XLSX from "xlsx-js-style";
import { formatDuration, formatHours } from "@/utils/timeFormat";

import AttendanceFilters from "@/components/admin/cham-cong/AttendanceFilters";
import AttendanceTable from "@/components/admin/cham-cong/AttendanceTable";
import EditAttendanceModal from "@/components/admin/cham-cong/EditAttendanceModal";

const { Text } = Typography;

const STATUS_MAP: Record<string, string> = {
  "chua-xac-nhan": "Chưa xác nhận",
  "hop-le": "Hợp lệ",
  "di-tre": "Đi trễ",
  "ve-som": "Về sớm",
  "tre-va-ve-som": "Trễ và về sớm",
  "da-checkout": "Đã check-out",
  "dang-lam-viec": "Đang làm việc",
};

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
  soPhutDiTre?: number;
  soPhutVeSom?: number;
  soGioLam?: number;
}
interface Filters {
  tuNgay?: string;
  denNgay?: string;
  maNV?: number;
  trangThai?: string;
}

export default function AdminChamCong() {
  const { modal } = App.useApp();
  const [form] = Form.useForm();

  const [attendances, setAttendances] = useState<ChamCongRecord[]>([]);
  const [nhanVienList, setNhanVienList] = useState<NhanVien[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ChamCongRecord | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

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
  }, [filters]);

  useEffect(() => {
    api
      .get("/nhanvien/all-basic")
      .then((res) => setNhanVienList(res.data))
      .catch(() => message.error("Lỗi khi tải danh sách nhân viên"));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      if (key === "dates") {
        delete newFilters.tuNgay;
        delete newFilters.denNgay;
        if (value && value.length === 2) {
          newFilters.tuNgay = value[0].startOf("day").toISOString();
          newFilters.denNgay = value[1].endOf("day").toISOString();
        }
      } else {
        if (value === undefined || value === null || value === "") {
          delete newFilters[key as keyof Filters];
        } else {
          (newFilters as any)[key] = value;
        }
      }
      return newFilters;
    });
  };

  const handleResetFilters = () => {
    setFilters({});
  };

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
      message.success("Cập nhật thành công");
      setIsModalVisible(false);
      setEditingRecord(null);
      fetchData();
    } catch {
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
          message.success("Xóa thành công");
          fetchData();
        } catch {
          message.error("Lỗi khi xóa");
        }
      },
    });
  };

  const exportToExcel = () => {
    const dataToExport =
      selectedRowKeys.length > 0
        ? attendances.filter((item) => selectedRowKeys.includes(item.maCC))
        : attendances;

    if (dataToExport.length === 0) {
      message.warning("Không có dữ liệu để xuất Excel");
      return;
    }

    const worksheetData = [
      ["Nhân viên", "Ngày", "Giờ vào", "Giờ ra", "Trạng thái", "Đi trễ", "Về sớm", "Số giờ làm"],
      ...dataToExport.map((record) => [
        record.nhanVien?.hoTen || "Không có tên",
        record.gioVao ? format(parseISO(record.gioVao), "dd/MM/yyyy") : "--",
        record.gioVao ? format(parseISO(record.gioVao), "HH:mm:ss") : "--",
        record.gioRa ? format(parseISO(record.gioRa), "HH:mm:ss") : "Chưa check-out",
        STATUS_MAP[record.trangThai] || record.trangThai,
        formatDuration(record.soPhutDiTre ?? null),
        formatDuration(record.soPhutVeSom ?? null),
        formatHours(record.soGioLam ?? null),
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const colWidths = worksheetData[0].map((_, i) => ({
      wch: worksheetData.reduce((w, r) => Math.max(w, r[i]?.toString().length ?? 10), 10),
    }));
    ws["!cols"] = colWidths;

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

    const highlightCols = [5, 6, 7];
    for (let R = 1; R <= range.e.r; ++R) {
      highlightCols.forEach((C) => {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell) {
          cell.s = {
            font: { color: { rgb: "FFA500" }, bold: true },
            alignment: { horizontal: "center", vertical: "center" },
          };
        }
      });
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ChamCong");
    XLSX.writeFile(wb, "DuLieuChamCong.xlsx");
  };

  const stats = useMemo(() => {
    const total = attendances.length;
    const working = attendances.filter((item) => item.trangThai === "dang-lam-viec").length;
    const late = attendances.filter((item) => ["di-tre", "tre-va-ve-som"].includes(item.trangThai)).length;
    const checkedOut = attendances.filter((item) => item.trangThai === "da-checkout" || item.gioRa).length;

    return [
      {
        title: "Tổng bản ghi",
        value: total,
        suffix: "dòng",
        icon: <ClockCircleOutlined />,
        color: "#1d4ed8",
        bg: "linear-gradient(145deg, #eff6ff, #dbeafe)",
      },
      {
        title: "Đang làm việc",
        value: working,
        suffix: "người",
        icon: <CheckCircleOutlined />,
        color: "#047857",
        bg: "linear-gradient(145deg, #ecfdf5, #dcfce7)",
      },
      {
        title: "Đi trễ",
        value: late,
        suffix: "bản ghi",
        icon: <ExclamationCircleOutlined />,
        color: "#b45309",
        bg: "linear-gradient(145deg, #fff7ed, #ffedd5)",
      },
      {
        title: "Đã check-out",
        value: checkedOut,
        suffix: "bản ghi",
        icon: <ExportOutlined />,
        color: "#7c3aed",
        bg: "linear-gradient(145deg, #f5f3ff, #ede9fe)",
      },
    ];
  }, [attendances]);

  return (
    <AdminPage title="Quản lý chấm công">
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <Card
          bordered={false}
          style={{
            borderRadius: 16,
            background: "linear-gradient(145deg, #ffffff 0%, #f8fbff 50%, #eef7ff 100%)",
            boxShadow: "0 12px 28px rgba(2, 32, 71, 0.08)",
          }}
          bodyStyle={{ padding: 20 }}
        >
          <div style={{ marginBottom: 14 }}>
            <Text style={{ color: "#0f172a", fontWeight: 700, fontSize: 22 }}>Trung tâm quản trị chấm công</Text>
            <div style={{ marginTop: 8 }}>
              <Text style={{ color: "#475569" }}>
                Theo dõi dữ liệu chấm công theo thời gian, lọc nhanh và xử lý bản ghi ngay tại một màn hình.
              </Text>
            </div>
          </div>

          <Row gutter={[12, 12]}>
            {stats.map((stat) => (
              <Col xs={24} sm={12} lg={6} key={stat.title}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 14,
                    background: stat.bg,
                    boxShadow: "inset 0 0 0 1px rgba(15, 23, 42, 0.08)",
                  }}
                  bodyStyle={{ padding: "12px 12px 10px" }}
                >
                  <Statistic
                    title={<span style={{ color: "#334155", fontSize: 12, fontWeight: 600 }}>{stat.title}</span>}
                    value={stat.value}
                    suffix={<span style={{ fontSize: 11, color: "#64748b" }}>{stat.suffix}</span>}
                    prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
                    valueStyle={{ color: stat.color, fontWeight: 800, fontSize: 24 }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        <AttendanceFilters
          nhanVienList={nhanVienList}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Tag color="processing">Hiển thị: {attendances.length}</Tag>
          <Tag color="default">Đã chọn: {selectedRowKeys.length}</Tag>
        </div>

        <AttendanceTable
          loading={loading}
          dataSource={attendances}
          selectedRowKeys={selectedRowKeys}
          onSelectChange={setSelectedRowKeys}
          onEdit={showEditModal}
          onDelete={showDeleteConfirm}
          onExport={exportToExcel}
        />

        <EditAttendanceModal
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onFinish={handleUpdate}
          form={form}
        />
      </Space>
    </AdminPage>
  );
}
