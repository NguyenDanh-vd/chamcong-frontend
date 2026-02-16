"use client";
import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import AdminPage from "@/components/AdminPage";
import { Card, Col, Form, Row, Space, Statistic, Tag, Typography, message } from "antd";
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

    return [
      {
        title: "Tổng phòng ban",
        value: total,
        suffix: "phòng",
        icon: <ApartmentOutlined />,
        color: "#1d4ed8",
        bg: "linear-gradient(145deg, #eff6ff, #dbeafe)",
      },
      {
        title: "Có mô tả",
        value: withDescription,
        suffix: "phòng",
        icon: <FileTextOutlined />,
        color: "#047857",
        bg: "linear-gradient(145deg, #ecfdf5, #dcfce7)",
      },
      {
        title: "Chưa có mô tả",
        value: noDescription,
        suffix: "phòng",
        icon: <CheckCircleOutlined />,
        color: "#b45309",
        bg: "linear-gradient(145deg, #fff7ed, #ffedd5)",
      },
      {
        title: "Kết quả lọc",
        value: showing,
        suffix: "hiển thị",
        icon: <SearchOutlined />,
        color: "#7c3aed",
        bg: "linear-gradient(145deg, #f5f3ff, #ede9fe)",
      },
    ];
  }, [departments, filteredDepartments]);

  return (
    <AdminPage title="Quản lý phòng ban">
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
              Trung tâm quản trị phòng ban
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text style={{ color: "#475569" }}>
                Theo dõi cơ cấu phòng ban, cập nhật nhanh thông tin và tối ưu vận hành nội bộ.
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
    </AdminPage>
  );
}
