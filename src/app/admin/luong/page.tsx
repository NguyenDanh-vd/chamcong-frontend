"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Col, ConfigProvider, Form, Row, Space, Statistic, Tag, Typography, message } from "antd";
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

    return [
      {
        title: "Tổng bảng lương",
        value: totalRecords,
        suffix: "bản ghi",
        icon: <FundOutlined />,
        color: "#1d4ed8",
        bg: "linear-gradient(145deg, #eff6ff, #dbeafe)",
      },
      {
        title: "Đã trả lương",
        value: daTra,
        suffix: "nhân viên",
        icon: <CheckCircleOutlined />,
        color: "#047857",
        bg: "linear-gradient(145deg, #ecfdf5, #dcfce7)",
      },
      {
        title: "Chưa trả lương",
        value: chuaTra,
        suffix: "nhân viên",
        icon: <WalletOutlined />,
        color: "#b45309",
        bg: "linear-gradient(145deg, #fff7ed, #ffedd5)",
      },
      {
        title: "Tổng quỹ lương",
        value: tongLuong,
        suffix: "VNĐ",
        icon: <DollarOutlined />,
        color: "#7c3aed",
        bg: "linear-gradient(145deg, #f5f3ff, #ede9fe)",
      },
    ];
  }, [data]);

  return (
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
          <Text style={{ color: "#0f172a", fontWeight: 700, fontSize: 22 }}>Trung tâm quản trị lương</Text>
          <div style={{ marginTop: 8 }}>
            <Text style={{ color: "#475569" }}>
              Quản lý bảng lương theo tháng, theo dõi trạng thái chi trả và xử lý điều chỉnh nhanh chóng.
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
                  formatter={(value) =>
                    stat.title === "Tổng quỹ lương" ? Number(value || 0).toLocaleString("vi-VN") : value
                  }
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
