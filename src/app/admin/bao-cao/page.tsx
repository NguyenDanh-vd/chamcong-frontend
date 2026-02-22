"use client";
import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { Alert, Card, Col, Progress, Row, Space, Tag, Typography, message } from "antd";
import { BarChartOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined } from "@ant-design/icons";
import AdminPage from "@/components/AdminPage";

import ReportFilters from "@/components/admin/bao-cao/ReportFilters";
import ReportTable, { ReportItem } from "@/components/admin/bao-cao/ReportTable";
import ReportChart from "@/components/admin/bao-cao/ReportChart";

type BaoCaoType = "thang" | "nam";
const { Text } = Typography;

export default function AdminBaoCao() {
  const [baoCaoType, setBaoCaoType] = useState<BaoCaoType>("thang");
  const [thang, setThang] = useState(new Date().getMonth() + 1);
  const [nam, setNam] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        baoCaoType === "thang"
          ? `/baocao/thang?thang=${thang}&nam=${nam}`
          : `/baocao/nam?nam=${nam}`;
      const res = await api.get<ReportItem[]>(url);
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Không thể tải dữ liệu báo cáo.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [baoCaoType, thang, nam]);

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const baseUrl = baoCaoType === "thang" ? "/baocao/thang/export" : "/baocao/nam/export";

      const params: Record<string, string> =
        baoCaoType === "thang"
          ? { thang: String(thang), nam: String(nam) }
          : { nam: String(nam) };

      const searchParams = new URLSearchParams(params);

      const response = await api.get(`${baseUrl}/excel?${searchParams.toString()}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `baocao-${baoCaoType}-${baoCaoType === "thang" ? `${thang}-` : ""}${nam}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(link.href);
      message.success("Xuất Excel thành công");
    } catch {
      message.error("Xuất Excel thất bại");
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => r.hoTen.toLowerCase().includes(search.toLowerCase()));
  }, [reports, search]);

  const dashboardStats = useMemo(() => {
    const totalNhanVien = filteredReports.length;
    const tongNgayCong = filteredReports.reduce((s, r) => s + Number(r.ngayCong || 0), 0);
    const tongNgayNghi = filteredReports.reduce((s, r) => s + Number(r.ngayNghi || 0), 0);
    const tongGioLamThem = filteredReports.reduce((s, r) => s + Number(r.gioLamThem || 0), 0);
    const tongNgay = tongNgayCong + tongNgayNghi;
    const tyLeDiLam = tongNgay > 0 ? (tongNgayCong / tongNgay) * 100 : 0;
    const nghiTrungBinh = totalNhanVien > 0 ? tongNgayNghi / totalNhanVien : 0;
    const gioLamThemTrungBinh = totalNhanVien > 0 ? tongGioLamThem / totalNhanVien : 0;

    return [
      {
        title: "Nhân viên trong báo cáo",
        value: totalNhanVien,
        suffix: "người",
        description: "Số nhân sự có dữ liệu",
        icon: <TeamOutlined />,
        color: "#0b5ed7",
        bg: "linear-gradient(150deg, #eef6ff 0%, #dbeeff 55%, #cfe7ff 100%)",
        progress: 100,
      },
      {
        title: "Tổng ngày công",
        value: tongNgayCong,
        suffix: "ngày",
        description: `Tỷ lệ đi làm: ${tyLeDiLam.toFixed(1)}%`,
        icon: <CheckCircleOutlined />,
        color: "#0284c7",
        bg: "linear-gradient(150deg, #effcff 0%, #d9f3ff 55%, #c8ecff 100%)",
        progress: tyLeDiLam,
      },
      {
        title: "Tổng ngày nghỉ",
        value: tongNgayNghi,
        suffix: "ngày",
        description: `TB nghỉ: ${nghiTrungBinh.toFixed(1)} ngày/người`,
        icon: <ClockCircleOutlined />,
        color: "#2563eb",
        bg: "linear-gradient(150deg, #f2f7ff 0%, #e2edff 55%, #d4e5ff 100%)",
        progress: tongNgay > 0 ? (tongNgayNghi / tongNgay) * 100 : 0,
      },
      {
        title: "Tổng giờ làm thêm",
        value: tongGioLamThem,
        suffix: "giờ",
        description: `TB tăng ca: ${gioLamThemTrungBinh.toFixed(1)} giờ/người`,
        icon: <BarChartOutlined />,
        color: "#0369a1",
        bg: "linear-gradient(150deg, #ebfbff 0%, #d6f3ff 55%, #c4ebff 100%)",
        progress: Math.min((gioLamThemTrungBinh / 4) * 100, 100),
      },
    ];
  }, [filteredReports]);

  return (
    <AdminPage title="Báo cáo và thống kê">
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <Card
          className="report-overview-card"
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
              <Text style={{ color: "#f8fbff", fontWeight: 800, fontSize: 24 }}>Trung tâm báo cáo nhân sự</Text>
              <div style={{ marginTop: 8 }}>
                <Text style={{ color: "rgba(241,245,249,0.9)" }}>
                  Tổng hợp hiệu suất theo tháng hoặc năm, trực quan hóa dữ liệu và xuất báo cáo nhanh.
                </Text>
              </div>
            </div>
            <Space size={8} wrap>
              <Tag color="cyan">Bản ghi: {filteredReports.length}</Tag>
              <Tag color="blue">{baoCaoType === "thang" ? "Theo tháng" : "Theo năm"}</Tag>
            </Space>
          </div>

          <Row gutter={[16, 16]}>
            {dashboardStats.map((stat) => (
              <Col xs={24} sm={12} lg={6} key={stat.title}>
                <Card
                  className="report-stat-card"
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
                    <span style={{ color: "rgb(15, 23, 42)", fontSize: 13, fontWeight: 700 }}>{stat.title}</span>
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
                    <span style={{ fontSize: 12, color: "rgb(71, 85, 105)", fontWeight: 600 }}>{stat.suffix}</span>
                  </div>

                  <Text style={{ color: "rgb(51, 65, 85)", fontSize: 12, fontWeight: 500 }}>{stat.description}</Text>
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

        <ReportFilters
          type={baoCaoType}
          setType={setBaoCaoType}
          month={thang}
          setMonth={setThang}
          year={nam}
          setYear={setNam}
          search={search}
          setSearch={setSearch}
          onExport={handleExportExcel}
          loading={loading}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Tag color="processing">Hiển thị: {filteredReports.length}</Tag>
          <Tag color="default">Loại báo cáo: {baoCaoType === "thang" ? "Theo tháng" : "Theo năm"}</Tag>
        </div>

        {error ? <Alert type="error" message={error} showIcon /> : null}

        {!loading && !error && filteredReports.length > 0 ? <ReportChart data={filteredReports} /> : null}

        <ReportTable data={filteredReports} loading={loading} />
      </Space>
      <style jsx global>{`
        .report-stat-card {
          transition:
            transform 220ms ease,
            box-shadow 220ms ease,
            filter 220ms ease;
          will-change: transform;
        }
        .report-stat-card:hover {
          transform: translateY(-5px);
          box-shadow:
            inset 0 0 0 1px rgba(12, 74, 110, 0.2),
            0 18px 30px rgba(12, 74, 110, 0.24) !important;
          filter: saturate(1.04);
        }
        .report-overview-card {
          overflow: hidden;
          position: relative;
        }
        .report-overview-card::after {
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
