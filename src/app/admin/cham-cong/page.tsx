"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import AdminPage from "@/components/AdminPage";
import { format, parseISO } from "date-fns";
import { App, Card, Col, Form, Progress, Row, Space, Tag, Typography, message } from "antd";
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
    const workingRate = total > 0 ? (working / total) * 100 : 0;
    const lateRate = total > 0 ? (late / total) * 100 : 0;
    const checkedOutRate = total > 0 ? (checkedOut / total) * 100 : 0;

    return [
      {
        title: "Tổng bản ghi",
        value: total,
        suffix: "dòng",
        description: "Toàn bộ dữ liệu đã lọc",
        icon: <ClockCircleOutlined />,
        color: "#0b5ed7",
        bg: "linear-gradient(150deg, #eef6ff 0%, #dbeeff 55%, #cfe7ff 100%)",
        progress: 100,
      },
      {
        title: "Đang làm việc",
        value: working,
        suffix: "người",
        description: `Tỷ lệ: ${workingRate.toFixed(1)}%`,
        icon: <CheckCircleOutlined />,
        color: "#0284c7",
        bg: "linear-gradient(150deg, #effcff 0%, #d9f3ff 55%, #c8ecff 100%)",
        progress: workingRate,
      },
      {
        title: "Đi trễ",
        value: late,
        suffix: "bản ghi",
        description: `Tỷ lệ: ${lateRate.toFixed(1)}%`,
        icon: <ExclamationCircleOutlined />,
        color: "#0369a1",
        bg: "linear-gradient(150deg, #ebfbff 0%, #d6f3ff 55%, #c4ebff 100%)",
        progress: lateRate,
      },
      {
        title: "Đã check-out",
        value: checkedOut,
        suffix: "bản ghi",
        description: `Tỷ lệ: ${checkedOutRate.toFixed(1)}%`,
        icon: <ExportOutlined />,
        color: "#2563eb",
        bg: "linear-gradient(150deg, #f2f7ff 0%, #e2edff 55%, #d4e5ff 100%)",
        progress: checkedOutRate,
      },
    ];
  }, [attendances]);

  return (
    <AdminPage title="Quản lý chấm công">
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <Card
          className="attendance-overview-card"
          bordered={false}
          style={{
            borderRadius: 20,
            background: "linear-gradient(135deg, #0f2a60 0%, #134e8f 42%, #0f8ac9 100%)",
            boxShadow: "0 18px 38px rgba(15, 42, 96, 0.28)",
          }}
          bodyStyle={{ padding: 24 }}
        >
          <div
            style={{
              marginBottom: 14,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div>
              <Text style={{ color: "#f8fbff", fontWeight: 800, fontSize: 24 }}>Trung tâm quản trị chấm công</Text>
              <div style={{ marginTop: 8 }}>
                <Text style={{ color: "rgba(241,245,249,0.9)" }}>
                  Theo dõi dữ liệu chấm công theo thời gian, lọc nhanh và xử lý bản ghi ngay tại một màn hình.
                </Text>
              </div>
            </div>
            <Space size={8} wrap>
              <Tag color="cyan">Hiển thị: {attendances.length}</Tag>
              <Tag color="blue">Đã chọn: {selectedRowKeys.length}</Tag>
            </Space>
          </div>

          <Row gutter={[16, 16]}>
            {stats.map((stat) => (
              <Col xs={24} sm={12} lg={6} key={stat.title}>
                <Card
                  className="attendance-stat-card"
                  bordered={false}
                  style={{
                    borderRadius: 18,
                    background: stat.bg,
                    minHeight: 168,
                    boxShadow: "inset 0 0 0 1px rgba(12, 74, 110, 0.14), 0 14px 24px rgba(12, 74, 110, 0.16)",
                  }}
                  bodyStyle={{ padding: "16px 16px 14px" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "#0f172a", fontSize: 13, fontWeight: 700 }}>{stat.title}</span>
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: stat.color,
                        background: "rgba(255,255,255,0.72)",
                        boxShadow: "0 6px 14px rgba(12, 74, 110, 0.18)",
                        fontSize: 16,
                      }}
                    >
                      {stat.icon}
                    </span>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ color: stat.color, fontWeight: 900, fontSize: 30, lineHeight: 1 }}>
                      {Number(stat.value || 0).toLocaleString("vi-VN")}
                    </span>
                    <span style={{ fontSize: 11, color: "#0f172a", fontWeight: 700 }}>{stat.suffix}</span>
                  </div>
                  <Text style={{ color: "#334155", fontSize: 12, fontWeight: 500 }}>{stat.description}</Text>
                  <Progress
                    percent={Number(stat.progress.toFixed(1))}
                    size="small"
                    strokeColor={stat.color}
                    trailColor="rgba(148, 163, 184, 0.26)"
                    showInfo={false}
                    style={{ marginTop: 10, marginBottom: 0 }}
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
        <style jsx global>{`
          .attendance-stat-card {
            transition:
              transform 220ms ease,
              box-shadow 220ms ease,
              filter 220ms ease;
            will-change: transform;
          }
          .attendance-stat-card:hover {
            transform: translateY(-5px);
            box-shadow:
              inset 0 0 0 1px rgba(12, 74, 110, 0.2),
              0 18px 30px rgba(12, 74, 110, 0.24) !important;
            filter: saturate(1.04);
          }
          .attendance-overview-card {
            overflow: hidden;
            position: relative;
          }
          .attendance-overview-card::after {
            content: "";
            position: absolute;
            inset: auto -80px -100px auto;
            width: 280px;
            height: 280px;
            background: radial-gradient(circle, rgba(125, 211, 252, 0.34) 0%, rgba(125, 211, 252, 0) 70%);
            pointer-events: none;
          }
        `}</style>
      </Space>
    </AdminPage>
  );
}
