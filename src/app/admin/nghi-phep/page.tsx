"use client";
import React, { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { format } from "date-fns";
import { Card, Col, Empty, Row, Space, Spin, Statistic, Tag, Typography, message } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, FileDoneOutlined } from "@ant-design/icons";
import AdminPage from "@/components/AdminPage";
import XLSX from "xlsx-js-style";

import LeaveFilters from "@/components/admin/nghi-phep/LeaveFilters";
import LeaveList, { LeaveItem } from "@/components/admin/nghi-phep/LeaveList";

const { Text } = Typography;

export default function AdminNghiPhep() {
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchLeaves = () => {
    setLoading(true);
    api
      .get("/nghiphep")
      .then((res) => setLeaves(Array.isArray(res.data) ? res.data : []))
      .catch(() => message.error("Không thể tải dữ liệu đơn nghỉ phép"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const filteredLeaves = useMemo(
    () =>
      leaves.filter((l) =>
        l.nhanVien?.hoTen?.toLowerCase().includes(searchName.toLowerCase())
      ),
    [leaves, searchName]
  );

  const numSelected = selectedIds.length;
  const numVisible = filteredLeaves.length;
  const isAllSelected = numSelected === numVisible && numVisible > 0;
  const isIndeterminate = numSelected > 0 && numSelected < numVisible;

  const handleUpdate = async (maDon: number, status: string) => {
    try {
      await api.put(`/nghiphep/duyet/${maDon}`, { trangThai: status });
      message.success("Cập nhật trạng thái thành công");
      fetchLeaves();
      setSelectedIds((ids) => ids.filter((id) => id !== maDon));
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const bulkUpdate = async (status: string) => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          api.put(`/nghiphep/duyet/${id}`, { trangThai: status })
        )
      );
      message.success("Cập nhật hàng loạt thành công");
      setSelectedIds([]);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi cập nhật hàng loạt");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredLeaves.map((l) => l.maDon));
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
    XLSX.utils.book_append_sheet(wb, ws, "NghiPhep");
    XLSX.writeFile(wb, fileName);
    message.success("Đã xuất file Excel");
  };

  const getExportData = (sourceData: LeaveItem[]) => {
    return sourceData.map((l) => ({
      "Mã đơn": l.maDon,
      "Tên nhân viên": l.nhanVien?.hoTen,
      "Ngày bắt đầu": formatDate(l.ngayBatDau),
      "Ngày kết thúc": formatDate(l.ngayKetThuc),
      "Lý do": l.lyDo,
      "Trạng thái":
        l.trangThai === "cho-duyet"
          ? "Chờ duyệt"
          : l.trangThai === "da-duyet"
          ? "Đã duyệt"
          : "Từ chối",
    }));
  };

  const stats = useMemo(() => {
    const total = leaves.length;
    const pending = leaves.filter((l) => l.trangThai === "cho-duyet").length;
    const approved = leaves.filter((l) => l.trangThai === "da-duyet").length;
    const rejected = leaves.filter((l) => l.trangThai === "tu-choi").length;

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
  }, [leaves]);

  return (
    <AdminPage title="Quản lý đơn nghỉ phép">
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
              Trung tâm duyệt nghỉ phép
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text style={{ color: "#475569" }}>
                Theo dõi trạng thái đơn nghỉ phép, duyệt nhanh theo lô và xuất báo cáo chỉ với vài thao tác.
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

        <LeaveFilters
          searchName={searchName}
          setSearchName={setSearchName}
          selectedCount={selectedIds.length}
          hasData={filteredLeaves.length > 0}
          onExportAll={() => exportToExcel(getExportData(leaves), "danh_sach_nghi_phep.xlsx")}
          onExportSelected={() =>
            exportToExcel(
              getExportData(leaves.filter((l) => selectedIds.includes(l.maDon))),
              "nghi_phep_da_chon.xlsx"
            )
          }
          onBulkUpdate={bulkUpdate}
          onSelectAll={handleSelectAll}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          onReset={handleReset}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Tag color="processing">Hiển thị: {filteredLeaves.length}</Tag>
          <Tag color="default">Đã chọn: {selectedIds.length}</Tag>
        </div>

        {loading ? (
          <Card bordered={false} style={{ borderRadius: 16 }}>
            <div style={{ padding: "28px 0", textAlign: "center" }}>
              <Spin />
            </div>
          </Card>
        ) : filteredLeaves.length === 0 ? (
          <Card bordered={false} style={{ borderRadius: 16 }}>
            <Empty description="Không có đơn nghỉ phép phù hợp" />
          </Card>
        ) : (
          <LeaveList
            data={filteredLeaves}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onUpdateStatus={handleUpdate}
          />
        )}
      </Space>
    </AdminPage>
  );
}
