"use client";
import React, { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import AdminPage from "@/components/AdminPage";
import { Button, Card, Col, Form, Input, Row, Select, Space, Statistic, Tag, Typography, message } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, PlusOutlined, SearchOutlined, StopOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import ShiftModal from "@/components/admin/ca-lam-viec/ShiftModal";
import ShiftTable, { Shift } from "@/components/admin/ca-lam-viec/ShiftTable";

const { Text } = Typography;

export default function AdminCaLamViec() {
  const [form] = Form.useForm();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Shift | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const fetchShifts = () => {
    setLoading(true);
    api
      .get("/calamviec")
      .then((res) => {
        const normalized = (Array.isArray(res.data) ? res.data : []).map((item: any) => ({
          ...item,
          trangThai:
            item.trangThai === true ||
            item.trangThai === 1 ||
            item.trangThai === "1" ||
            item.trangThai === "true",
        }));
        setShifts(normalized);
      })
      .catch(() => message.error("Lỗi khi tải danh sách ca làm việc"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const showModal = (record?: Shift) => {
    if (record) {
      setEditingRecord(record);
      form.setFieldsValue({
        tenCa: record.tenCa,
        gioBatDau: dayjs(record.gioBatDau, "HH:mm:ss"),
        gioKetThuc: dayjs(record.gioKetThuc, "HH:mm:ss"),
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
    setSubmitLoading(true);
    const payload = {
      tenCa: values.tenCa,
      gioBatDau: values.gioBatDau.format("HH:mm:ss"),
      gioKetThuc: values.gioKetThuc.format("HH:mm:ss"),
    };
    try {
      if (editingRecord) {
        await api.put(`/calamviec/${editingRecord.maCa}`, payload);
        message.success("Cập nhật ca làm thành công");
      } else {
        await api.post("/calamviec", payload);
        message.success("Thêm ca làm mới thành công");
      }
      handleCancel();
      fetchShifts();
    } catch (err) {
      console.error(err);
      message.error("Thao tác thất bại");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (maCa: number) => {
    try {
      await api.delete(`/calamviec/${maCa}`);
      message.success("Xóa ca làm thành công");
      fetchShifts();
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi xóa ca làm");
    }
  };

  const handleStatusChange = async (checked: boolean, record: Shift) => {
    try {
      await api.put(`/calamviec/${record.maCa}/status`, {
        trangThai: checked,
      });
      message.success("Cập nhật trạng thái thành công");
      fetchShifts();
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const filteredShifts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return shifts.filter((item) => {
      const matchKeyword = !keyword || item.tenCa.toLowerCase().includes(keyword) || String(item.maCa).includes(keyword);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.trangThai) ||
        (statusFilter === "inactive" && !item.trangThai);
      return matchKeyword && matchStatus;
    });
  }, [shifts, searchText, statusFilter]);

  const stats = useMemo(() => {
    const total = shifts.length;
    const active = shifts.filter((item) => item.trangThai).length;
    const inactive = total - active;
    const showing = filteredShifts.length;

    return [
      {
        title: "Tổng ca làm",
        value: total,
        suffix: "ca",
        icon: <ClockCircleOutlined />,
        color: "#1d4ed8",
        bg: "linear-gradient(145deg, #eff6ff, #dbeafe)",
      },
      {
        title: "Đang hoạt động",
        value: active,
        suffix: "ca",
        icon: <CheckCircleOutlined />,
        color: "#047857",
        bg: "linear-gradient(145deg, #ecfdf5, #dcfce7)",
      },
      {
        title: "Ngưng hoạt động",
        value: inactive,
        suffix: "ca",
        icon: <StopOutlined />,
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
  }, [shifts, filteredShifts]);

  return (
    <AdminPage title="Quản lý ca làm việc">
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
              Trung tâm quản trị ca làm việc
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text style={{ color: "#475569" }}>
                Theo dõi lịch làm, quản lý trạng thái ca và tối ưu vận hành chấm công theo thời gian thực.
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

        <Card
          bordered={false}
          style={{ borderRadius: 16, boxShadow: "0 12px 26px rgba(15, 23, 42, 0.06)" }}
          bodyStyle={{ padding: 16 }}
        >
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} xl={12}>
              <Input.Search
                allowClear
                size="large"
                placeholder="Tìm theo mã ca hoặc tên ca"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>

            <Col xs={24} sm={12} xl={4}>
              <Select
                size="large"
                value={statusFilter}
                style={{ width: "100%" }}
                onChange={(value) => setStatusFilter(value)}
                options={[
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "active", label: "Đang hoạt động" },
                  { value: "inactive", label: "Ngưng hoạt động" },
                ]}
              />
            </Col>

            <Col xs={24} sm={12} xl={4}>
              <Button
                size="large"
                style={{ width: "100%", borderRadius: 10 }}
                onClick={() => {
                  setSearchText("");
                  setStatusFilter("all");
                }}
              >
                Đặt lại
              </Button>
            </Col>

            <Col xs={24} xl={4}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
                size="large"
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                  color: "#fff",
                  border: "none",
                  fontWeight: 600,
                  borderRadius: 10,
                }}
              >
                Thêm ca làm
              </Button>
            </Col>
          </Row>
        </Card>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Tag color="processing">Hiển thị: {filteredShifts.length}</Tag>
          <Tag color="default">Tổng: {shifts.length}</Tag>
        </div>

        <ShiftTable
          shifts={filteredShifts}
          loading={loading}
          onEdit={showModal}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      </Space>

      <ShiftModal
        open={isModalVisible}
        onCancel={handleCancel}
        onFinish={handleFinish}
        loading={submitLoading}
        form={form}
        isEdit={!!editingRecord}
      />
    </AdminPage>
  );
}
