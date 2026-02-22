"use client";
import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import AdminPage from "@/components/AdminPage";
import { Card, Col, Form, Progress, Row, Space, Tag, Typography, message } from "antd";
import {
  ApartmentOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import DepartmentToolbar from "@/components/admin/phong-ban/DepartmentToolbar";
import DepartmentTable, { Department } from "@/components/admin/phong-ban/DepartmentTable";
import DepartmentModal from "@/components/admin/phong-ban/DepartmentModal";

const { Text } = Typography;

export default function AdminPhongBan() {
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Department | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/phongban");
      setDepartments(res.data);
      setFilteredDepartments(res.data);
    } catch {
      message.error("Lỗi khi tải danh sách phòng ban");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const showModal = (record?: Department) => {
    if (record) {
      setEditingRecord(record);
      form.setFieldsValue({
        tenPhong: record.tenPhong,
        moTa: record.moTa,
      });
    } else {
      setEditingRecord(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleFinish = async (values: any) => {
    if (!values.tenPhong || values.tenPhong.trim() === "") {
      message.error("Tên phòng ban không hợp lệ");
      return;
    }

    setSubmitLoading(true);
    const payload: Partial<Department> = {
      tenPhong: values.tenPhong.trim(),
      moTa: values.moTa?.trim() || null,
    };

    try {
      if (editingRecord) {
        await api.put(`/phongban/${editingRecord.maPB}`, payload);
        message.success("Cập nhật phòng ban thành công");
      } else {
        await api.post("/phongban", payload);
        message.success("Thêm phòng ban mới thành công");
      }
      handleCancel();
      fetchDepartments();
    } catch (err: any) {
      console.error("Lỗi khi thêm/sửa phòng ban:", err.response?.data || err);
      message.error(err.response?.data?.message || "Thao tác thất bại");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (maPB: number) => {
    try {
      await api.delete(`/phongban/${maPB}`);
      message.success("Xóa phòng ban thành công");
      fetchDepartments();
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || "Lỗi khi xóa phòng ban");
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    const lowercasedValue = value.toLowerCase();
    const filteredData = departments.filter(
      (item) =>
        item.tenPhong.toLowerCase().includes(lowercasedValue) ||
        (item.moTa && item.moTa.toLowerCase().includes(lowercasedValue))
    );
    setFilteredDepartments(filteredData);
  };

  const stats = useMemo(() => {
    const total = departments.length;
    const withDescription = departments.filter((item) => item.moTa && item.moTa.trim() !== "").length;
    const noDescription = total - withDescription;
    const showing = filteredDepartments.length;
    const withDescRate = total > 0 ? (withDescription / total) * 100 : 0;
    const noDescRate = total > 0 ? (noDescription / total) * 100 : 0;
    const showingRate = total > 0 ? (showing / total) * 100 : 0;

    return [
      {
        title: "Tổng phòng ban",
        value: total,
        suffix: "phòng",
        description: "Toàn bộ phòng ban hiện có",
        icon: <ApartmentOutlined />,
        color: "#0b5ed7",
        bg: "linear-gradient(150deg, #eef6ff 0%, #dbeeff 55%, #cfe7ff 100%)",
        progress: 100,
      },
      {
        title: "Có mô tả",
        value: withDescription,
        suffix: "phòng",
        description: `Tỷ lệ: ${withDescRate.toFixed(1)}%`,
        icon: <FileTextOutlined />,
        color: "#0284c7",
        bg: "linear-gradient(150deg, #effcff 0%, #d9f3ff 55%, #c8ecff 100%)",
        progress: withDescRate,
      },
      {
        title: "Chưa có mô tả",
        value: noDescription,
        suffix: "phòng",
        description: `Tỷ lệ: ${noDescRate.toFixed(1)}%`,
        icon: <CheckCircleOutlined />,
        color: "#0369a1",
        bg: "linear-gradient(150deg, #ebfbff 0%, #d6f3ff 55%, #c4ebff 100%)",
        progress: noDescRate,
      },
      {
        title: "Kết quả lọc",
        value: showing,
        suffix: "hiển thị",
        description: `Tỷ lệ hiển thị: ${showingRate.toFixed(1)}%`,
        icon: <SearchOutlined />,
        color: "#2563eb",
        bg: "linear-gradient(150deg, #f2f7ff 0%, #e2edff 55%, #d4e5ff 100%)",
        progress: showingRate,
      },
    ];
  }, [departments, filteredDepartments]);

  return (
    <AdminPage title="Quản lý phòng ban">
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <Card
          className="department-overview-card"
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
              <Text style={{ color: "#f8fbff", fontWeight: 800, fontSize: 24 }}>
                Trung tâm quản trị phòng ban
              </Text>
              <div style={{ marginTop: 8 }}>
                <Text style={{ color: "rgba(241,245,249,0.9)" }}>
                  Theo dõi cơ cấu phòng ban, cập nhật nhanh thông tin và tối ưu vận hành nội bộ.
                </Text>
              </div>
            </div>
            <Space size={8} wrap>
              <Tag color="cyan">Hiển thị: {filteredDepartments.length}</Tag>
              <Tag color="blue">Tổng: {departments.length}</Tag>
            </Space>
          </div>

          <Row gutter={[16, 16]}>
            {stats.map((stat) => (
              <Col xs={24} sm={12} lg={6} key={stat.title}>
                <Card
                  className="department-stat-card"
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

        <DepartmentToolbar onAdd={() => showModal()} searchText={searchText} onSearch={handleSearch} />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Tag color="processing">Hiển thị: {filteredDepartments.length}</Tag>
          <Tag color="default">Tổng: {departments.length}</Tag>
        </div>

        <DepartmentTable
          dataSource={filteredDepartments}
          loading={loading}
          onEdit={showModal}
          onDelete={handleDelete}
        />
      </Space>

      <DepartmentModal
        open={isModalVisible}
        onCancel={handleCancel}
        onFinish={handleFinish}
        loading={submitLoading}
        form={form}
        editingRecord={editingRecord}
      />

      <style jsx global>{`
        .department-stat-card {
          transition:
            transform 220ms ease,
            box-shadow 220ms ease,
            filter 220ms ease;
          will-change: transform;
        }
        .department-stat-card:hover {
          transform: translateY(-5px);
          box-shadow:
            inset 0 0 0 1px rgba(12, 74, 110, 0.2),
            0 18px 30px rgba(12, 74, 110, 0.24) !important;
          filter: saturate(1.04);
        }
        .department-overview-card {
          overflow: hidden;
          position: relative;
        }
        .department-overview-card::after {
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
