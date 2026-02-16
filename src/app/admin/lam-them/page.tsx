"use client";
import React, { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { format } from "date-fns";
import { Card, Col, Empty, Row, Space, Spin, Statistic, Tag, Typography, message } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, FileDoneOutlined } from "@ant-design/icons";
import AdminPage from "@/components/AdminPage";
import XLSX from "xlsx-js-style";

import OvertimeFilters from "@/components/admin/lam-them/OvertimeFilters";
import OvertimeList, { OvertimeItem } from "@/components/admin/lam-them/OvertimeList";

const { Text } = Typography;

export default function AdminLamThem() {
  const [overtimes, setOvertimes] = useState<OvertimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchOvertimes = () => {
    setLoading(true);
    api
      .get("/lamthem/")
      .then((res) => setOvertimes(Array.isArray(res.data) ? res.data : []))
      .catch(() => message.error("Không thể tải dữ liệu đơn làm thêm"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOvertimes();
  }, []);

  const filteredOvertimes = useMemo(
    () =>
      overtimes.filter((ot) =>
        ot.nhanVien?.hoTen?.toLowerCase().includes(searchName.toLowerCase())
      ),
    [overtimes, searchName]
  );

  const numSelected = selectedIds.length;
  const numVisible = filteredOvertimes.length;
  const isAllSelected = numSelected === numVisible && numVisible > 0;
  const isIndeterminate = numSelected > 0 && numSelected < numVisible;

  const handleUpdate = async (id: number, status: string) => {
    try {
      await api.put(`/lamthem/duyet/${id}`, { trangThai: status });
      message.success("Cập nhật trạng thái thành công");
      fetchOvertimes();
      setSelectedIds((ids) => ids.filter((i) => i !== id));
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const bulkUpdate = async (status: string) => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          api.put(`/lamthem/duyet/${id}`, { trangThai: status })
        )
      );
      message.success("Cập nhật hàng loạt thành công");
      setSelectedIds([]);
      fetchOvertimes();
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi cập nhật hàng loạt");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredOvertimes.map((ot) => ot.maLT));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleReset = () => {
    setSearchName("");
    setSelectedIds([]);
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : format(date, "dd/MM/yyyy");
  };

  const exportToExcel = (rows: any[], fileName: string) => {
    if (rows.length === 0) {
      message.warning("Không có dữ liệu để xuất Excel");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const headers = Object.keys(rows[0] || {});

    headers.forEach((_, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      if (!ws[cellAddress]) return;
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F81BD" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };
    });

    ws["!cols"] = headers.map((h) => ({
      wch:
        Math.max(
          h.length,
          ...rows.map((row) => (row[h] ? row[h].toString().length : 0))
        ) + 2,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LamThem");
    XLSX.writeFile(wb, fileName);
    message.success("Đã xuất file Excel");
  };

  const getExportData = (sourceData: OvertimeItem[]) => {
    return sourceData.map((ot) => ({
      "Mã đơn": ot.maLT,
      "Tên nhân viên": ot.nhanVien?.hoTen,
      "Ngày": formatDate(ot.ngay),
      "Giờ bắt đầu": ot.gioBatDau,
      "Giờ kết thúc": ot.gioKetThuc,
      "Số giờ": ot.soGio,
      "Lý do": ot.lyDo,
      "Trạng thái":
        ot.trangThai === "cho-duyet"
          ? "Chờ duyệt"
          : ot.trangThai === "da-duyet"
          ? "Đã duyệt"
          : "Từ chối",
    }));
  };

  const stats = useMemo(() => {
    const total = overtimes.length;
    const pending = overtimes.filter((ot) => ot.trangThai === "cho-duyet").length;
    const approved = overtimes.filter((ot) => ot.trangThai === "da-duyet").length;
    const rejected = overtimes.filter((ot) => ot.trangThai === "tu-choi").length;

    return [
      {
        title: "Tổng đơn",
        value: total,
        suffix: "đơn",
        icon: <FileDoneOutlined />,
        color: "#1d4ed8",
        bg: "linear-gradient(145deg, #eff6ff, #dbeafe)",
      },
      {
        title: "Chờ duyệt",
        value: pending,
        suffix: "đơn",
        icon: <ClockCircleOutlined />,
        color: "#b45309",
        bg: "linear-gradient(145deg, #fff7ed, #ffedd5)",
      },
      {
        title: "Đã duyệt",
        value: approved,
        suffix: "đơn",
        icon: <CheckCircleOutlined />,
        color: "#047857",
        bg: "linear-gradient(145deg, #ecfdf5, #dcfce7)",
      },
      {
        title: "Từ chối",
        value: rejected,
        suffix: "đơn",
        icon: <CloseCircleOutlined />,
        color: "#b91c1c",
        bg: "linear-gradient(145deg, #fef2f2, #fee2e2)",
      },
    ];
  }, [overtimes]);

  return (
    <AdminPage title="Quản lý đơn làm thêm">
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
            <Text style={{ color: "#0f172a", fontWeight: 700, fontSize: 22 }}>
              Trung tâm duyệt làm thêm
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text style={{ color: "#475569" }}>
                Theo dõi đơn làm thêm, xử lý duyệt theo lô và xuất báo cáo theo từng nhóm dữ liệu.
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

        <OvertimeFilters
          searchName={searchName}
          setSearchName={setSearchName}
          selectedCount={selectedIds.length}
          hasData={filteredOvertimes.length > 0}
          onExportAll={() => exportToExcel(getExportData(overtimes), "danh_sach_lam_them.xlsx")}
          onExportSelected={() =>
            exportToExcel(
              getExportData(overtimes.filter((ot) => selectedIds.includes(ot.maLT))),
              "lam_them_da_chon.xlsx"
            )
          }
          onBulkUpdate={bulkUpdate}
          onSelectAll={handleSelectAll}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          onReset={handleReset}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Tag color="processing">Hiển thị: {filteredOvertimes.length}</Tag>
          <Tag color="default">Đã chọn: {selectedIds.length}</Tag>
        </div>

        {loading ? (
          <Card bordered={false} style={{ borderRadius: 16 }}>
            <div style={{ padding: "28px 0", textAlign: "center" }}>
              <Spin />
            </div>
          </Card>
        ) : filteredOvertimes.length === 0 ? (
          <Card bordered={false} style={{ borderRadius: 16 }}>
            <Empty description="Không có đơn làm thêm phù hợp" />
          </Card>
        ) : (
          <OvertimeList
            data={filteredOvertimes}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onUpdateStatus={handleUpdate}
          />
        )}
      </Space>
    </AdminPage>
  );
}
