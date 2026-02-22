"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Col, ConfigProvider, Form, Progress, Row, Space, Tag, Typography, message } from "antd";
import { CheckCircleOutlined, DollarOutlined, FundOutlined, WalletOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import api from "@/utils/api";
import AdminPage from "@/components/AdminPage";
import "dayjs/locale/vi";
import viVN from "antd/locale/vi_VN";

import SalaryFilters from "@/components/admin/luong/SalaryFilters";
import SalaryTable from "@/components/admin/luong/SalaryTable";
import EditSalaryModal from "@/components/admin/luong/EditSalaryModal";
import { exportSalaryExcel } from "@/components/admin/luong/salary.utils";

const { Text } = Typography;

const LuongPage = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [thang, setThang] = useState(dayjs());
  const [tinhLuongLoading, setTinhLuongLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchLuong = async () => {
    try {
      setLoading(true);
      const res = await api.get("/luong");
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải dữ liệu lương");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLuong();
  }, []);

  const tinhLuong = async () => {
    try {
      setTinhLuongLoading(true);
      const res = await api.post("/luong/tinh-luong", {
        thang: thang.format("YYYY-MM"),
      });
      message.success(res.data.message || "Đã tính lương tự động");
      fetchLuong();
    } catch (err) {
      console.error(err);
      message.error("Không thể tính lương");
    } finally {
      setTinhLuongLoading(false);
    }
  };

  const danhDauDaTra = async (id: number) => {
    try {
      setUpdating(id);
      await api.patch(`/luong/${id}/da-tra`);
      message.success("Đã đánh dấu đã trả lương");
      fetchLuong();
    } catch (err) {
      console.error(err);
      message.error("Không thể cập nhật trạng thái");
    } finally {
      setUpdating(null);
    }
  };

  const openEditModal = (record: any) => {
    setEditing(record);
    form.setFieldsValue(record);
  };

  const closeEditModal = () => {
    setEditing(null);
    form.resetFields();
  };

  const updateLuong = async () => {
    try {
      const values = await form.validateFields();
      await api.patch(`/luong/${editing.maLuong}/chinh-sua`, values);
      message.success("Cập nhật lương thành công");
      fetchLuong();
      closeEditModal();
    } catch (err) {
      console.error(err);
      message.error("Không thể cập nhật lương");
    }
  };

  const stats = useMemo(() => {
    const totalRecords = data.length;
    const daTra = data.filter((item) => item.trangThai === "da-tra").length;
    const chuaTra = totalRecords - daTra;
    const tongLuong = data.reduce((sum, item) => sum + Number(item.tongLuong || 0), 0);
    const tyLeDaTra = totalRecords > 0 ? (daTra / totalRecords) * 100 : 0;
    const tyLeChuaTra = totalRecords > 0 ? (chuaTra / totalRecords) * 100 : 0;
    const luongTrungBinh = totalRecords > 0 ? tongLuong / totalRecords : 0;

    return [
      {
        title: "Tổng bảng lương",
        value: totalRecords,
        suffix: "bản ghi",
        description: "Số nhân sự có bảng lương",
        icon: <FundOutlined />,
        color: "#0b5ed7",
        bg: "linear-gradient(150deg, #eef6ff 0%, #dbeeff 55%, #cfe7ff 100%)",
        progress: 100,
      },
      {
        title: "Đã trả lương",
        value: daTra,
        suffix: "nhân viên",
        description: `Tỷ lệ chi trả: ${tyLeDaTra.toFixed(1)}%`,
        icon: <CheckCircleOutlined />,
        color: "#0284c7",
        bg: "linear-gradient(150deg, #effcff 0%, #d9f3ff 55%, #c8ecff 100%)",
        progress: tyLeDaTra,
      },
      {
        title: "Chưa trả lương",
        value: chuaTra,
        suffix: "nhân viên",
        description: `Tỷ lệ chưa trả: ${tyLeChuaTra.toFixed(1)}%`,
        icon: <WalletOutlined />,
        color: "#0369a1",
        bg: "linear-gradient(150deg, #ebfbff 0%, #d6f3ff 55%, #c4ebff 100%)",
        progress: tyLeChuaTra,
      },
      {
        title: "Tổng quỹ lương",
        value: tongLuong,
        suffix: "VNĐ",
        description: `Lương TB: ${Math.round(luongTrungBinh).toLocaleString("vi-VN")} VNĐ`,
        icon: <DollarOutlined />,
        color: "#2563eb",
        bg: "linear-gradient(150deg, #f2f7ff 0%, #e2edff 55%, #d4e5ff 100%)",
        progress: Math.min((luongTrungBinh / 30000000) * 100, 100),
      },
    ];
  }, [data]);

  return (
    <Space direction="vertical" size={18} style={{ width: "100%" }}>
      <Card
        className="salary-overview-card"
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
            <Text style={{ color: "#f8fbff", fontWeight: 800, fontSize: 24 }}>Trung tâm quản trị lương</Text>
            <div style={{ marginTop: 8 }}>
              <Text style={{ color: "rgba(241,245,249,0.9)" }}>
                Quản lý bảng lương theo tháng, theo dõi trạng thái chi trả và xử lý điều chỉnh nhanh chóng.
              </Text>
            </div>
          </div>
          <Space size={8} wrap>
            <Tag color="cyan">Hiển thị: {data.length}</Tag>
            <Tag color="blue">Tháng: {thang.format("MM/YYYY")}</Tag>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          {stats.map((stat) => (
            <Col xs={24} sm={12} lg={6} key={stat.title}>
              <Card
                className="salary-stat-card"
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
                    {stat.suffix === "VNĐ" ? " VNĐ" : ""}
                  </span>
                  {stat.suffix !== "VNĐ" ? (
                    <span
                      style={{
                        fontSize: 11,
                        color: "#0f172a",
                        fontWeight: 700,
                        borderRadius: 999,
                        padding: "2px 8px",
                        border: "1px solid rgba(14,165,233,0.35)",
                        background: "rgba(255,255,255,0.72)",
                      }}
                    >
                      {stat.suffix}
                    </span>
                  ) : null}
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

      <SalaryFilters
        thang={thang}
        setThang={setThang}
        onTinhLuong={tinhLuong}
        tinhLuongLoading={tinhLuongLoading}
        onReload={fetchLuong}
        onExport={() => exportSalaryExcel(data, thang)}
      />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Tag color="processing">Hiển thị: {data.length}</Tag>
        <Tag color="default">Tháng chọn: {thang.format("MM/YYYY")}</Tag>
      </div>

      <SalaryTable data={data} loading={loading} onEdit={openEditModal} onMarkPaid={danhDauDaTra} updatingId={updating} />

      <EditSalaryModal editing={editing} onCancel={closeEditModal} onUpdate={updateLuong} form={form} />
      <style jsx global>{`
        .salary-stat-card {
          transition:
            transform 220ms ease,
            box-shadow 220ms ease,
            filter 220ms ease;
          will-change: transform;
        }
        .salary-stat-card:hover {
          transform: translateY(-5px);
          box-shadow:
            inset 0 0 0 1px rgba(12, 74, 110, 0.2),
            0 18px 30px rgba(12, 74, 110, 0.24) !important;
          filter: saturate(1.04);
        }
        .salary-overview-card {
          overflow: hidden;
          position: relative;
        }
        .salary-overview-card::after {
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
  );
};

export default function Page() {
  return (
    <ConfigProvider locale={viVN}>
      <AdminPage title="Quản lý lương nhân viên">
        <LuongPage />
      </AdminPage>
    </ConfigProvider>
  );
}
