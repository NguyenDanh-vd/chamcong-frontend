"use client";
import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { Alert, Card, Col, Row, Space, Statistic, Tag, Typography, message } from "antd";
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

  const stats = useMemo(() => {
    const totalNhanVien = filteredReports.length;
    const tongNgayCong = filteredReports.reduce((s, r) => s + Number(r.ngayCong || 0), 0);
    const tongNgayNghi = filteredReports.reduce((s, r) => s + Number(r.ngayNghi || 0), 0);
    const tongGioLamThem = filteredReports.reduce((s, r) => s + Number(r.gioLamThem || 0), 0);

    return [
      {
        title: "Nhân viên trong báo cáo",
        value: totalNhanVien,
        suffix: "người",
        icon: <TeamOutlined />,
        color: "#1d4ed8",
        bg: "linear-gradient(145deg, #eff6ff, #dbeafe)",
      },
      {
        title: "Tổng ngày công",
        value: tongNgayCong,
        suffix: "ngày",
        icon: <CheckCircleOutlined />,
        color: "#047857",
        bg: "linear-gradient(145deg, #ecfdf5, #dcfce7)",
      },
      {
        title: "Tổng ngày nghỉ",
        value: tongNgayNghi,
        suffix: "ngày",
        icon: <ClockCircleOutlined />,
        color: "#b45309",
        bg: "linear-gradient(145deg, #fff7ed, #ffedd5)",
      },
      {
        title: "Tổng giờ làm thêm",
        value: tongGioLamThem,
        suffix: "giờ",
        icon: <BarChartOutlined />,
        color: "#7c3aed",
        bg: "linear-gradient(145deg, #f5f3ff, #ede9fe)",
      },
    ];
  }, [filteredReports]);

  return (
    <AdminPage title="Báo cáo và thống kê">
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
              Trung tâm báo cáo nhân sự
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text style={{ color: "#475569" }}>
                Tổng hợp hiệu suất theo tháng hoặc năm, trực quan hóa dữ liệu và xuất báo cáo nhanh.
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
    </AdminPage>
  );
}
