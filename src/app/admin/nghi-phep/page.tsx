"use client";
import React, { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { format } from "date-fns";
import { Card, Col, Empty, Progress, Row, Space, Spin, Tag, Typography, message } from "antd";
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
    const pendingRate = total > 0 ? (pending / total) * 100 : 0;
    const approvedRate = total > 0 ? (approved / total) * 100 : 0;
    const rejectedRate = total > 0 ? (rejected / total) * 100 : 0;
    const selectedRate = numVisible > 0 ? (numSelected / numVisible) * 100 : 0;

    return [
      {
        title: "Tổng đơn",
        value: total,
        suffix: "đơn",
        description: "Tổng yêu cầu nghỉ phép",
        icon: <FileDoneOutlined />,
        color: "#0b5ed7",
        bg: "linear-gradient(150deg, #eef6ff 0%, #dbeeff 55%, #cfe7ff 100%)",
        progress: 100,
      },
      {
        title: "Chờ duyệt",
        value: pending,
        suffix: "đơn",
        description: `Chiếm ${pendingRate.toFixed(1)}% tổng đơn`,
        icon: <ClockCircleOutlined />,
        color: "#0284c7",
        bg: "linear-gradient(150deg, #effcff 0%, #d9f3ff 55%, #c8ecff 100%)",
        progress: pendingRate,
      },
      {
        title: "Đã duyệt",
        value: approved,
        suffix: "đơn",
        description: `Tỷ lệ duyệt: ${approvedRate.toFixed(1)}%`,
        icon: <CheckCircleOutlined />,
        color: "#0369a1",
        bg: "linear-gradient(150deg, #ebfbff 0%, #d6f3ff 55%, #c4ebff 100%)",
        progress: approvedRate,
      },
      {
        title: "Từ chối",
        value: rejected,
        suffix: "đơn",
        description: `Đang chọn: ${numSelected}/${numVisible || 0} (${selectedRate.toFixed(1)}%)`,
        icon: <CloseCircleOutlined />,
        color: "#2563eb",
        bg: "linear-gradient(150deg, #f2f7ff 0%, #e2edff 55%, #d4e5ff 100%)",
        progress: rejectedRate,
      },
    ];
  }, [leaves, numSelected, numVisible]);

  return (
    <AdminPage title="Quản lý đơn nghỉ phép">
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <Card
          className="leave-overview-card"
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
              <Text style={{ color: "#f8fbff", fontWeight: 800, fontSize: 24 }}>Trung tâm duyệt nghỉ phép</Text>
              <div style={{ marginTop: 8 }}>
                <Text style={{ color: "rgba(241,245,249,0.9)" }}>
                  Theo dõi trạng thái đơn nghỉ phép, duyệt nhanh theo lô và xuất báo cáo chỉ với vài thao tác.
                </Text>
              </div>
            </div>
            <Space size={8} wrap>
              <Tag color="cyan">Hiển thị: {filteredLeaves.length}</Tag>
              <Tag color="blue">Đã chọn: {selectedIds.length}</Tag>
            </Space>
          </div>

          <Row gutter={[16, 16]}>
            {stats.map((stat) => (
              <Col xs={24} sm={12} lg={6} key={stat.title}>
                <Card
                  className="leave-stat-card"
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
                    <span style={{ color: stat.color, fontWeight: 900, fontSize: 30, lineHeight: 1 }}>{stat.value}</span>
                    <span style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>{stat.suffix}</span>
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
          <Card bordered={false} style={{ borderRadius: 16, boxShadow: "0 10px 24px rgba(15,23,42,0.06)" }}>
            <div style={{ padding: "28px 0", textAlign: "center" }}>
              <Spin />
            </div>
          </Card>
        ) : filteredLeaves.length === 0 ? (
          <Card bordered={false} style={{ borderRadius: 16, boxShadow: "0 10px 24px rgba(15,23,42,0.06)" }}>
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
      <style jsx global>{`
        .leave-stat-card {
          transition:
            transform 220ms ease,
            box-shadow 220ms ease,
            filter 220ms ease;
          will-change: transform;
        }
        .leave-stat-card:hover {
          transform: translateY(-5px);
          box-shadow:
            inset 0 0 0 1px rgba(12, 74, 110, 0.2),
            0 18px 30px rgba(12, 74, 110, 0.24) !important;
          filter: saturate(1.04);
        }
        .leave-overview-card {
          overflow: hidden;
          position: relative;
        }
        .leave-overview-card::after {
          content: "";
          position: absolute;
          inset: auto -80px -100px auto;
          width: 280px;
          height: 280px;
          background: radial-gradient(circle, rgba(125, 211, 252, 0.34) 0%, rgba(125, 211, 252, 0) 70%);
          pointer-events: none;
        }
      `}</style>
    </AdminPage>
  );
}
