"use client";
import React, { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import AdminPage from "@/components/AdminPage";
import { Button, Card, Col, Form, Input, Progress, Row, Select, Space, Tag, Typography, message } from "antd";
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
    const activeRate = total > 0 ? (active / total) * 100 : 0;
    const inactiveRate = total > 0 ? (inactive / total) * 100 : 0;
    const showingRate = total > 0 ? (showing / total) * 100 : 0;

    return [
      {
        title: "Tổng ca làm",
        value: total,
        suffix: "ca",
        description: "Tổng số ca toàn hệ thống",
        icon: <ClockCircleOutlined />,
        color: "#0b5ed7",
        bg: "linear-gradient(150deg, #eef6ff 0%, #dbeeff 55%, #cfe7ff 100%)",
        progress: 100,
      },
      {
        title: "Đang hoạt động",
        value: active,
        suffix: "ca",
        description: `Tỷ lệ: ${activeRate.toFixed(1)}%`,
        icon: <CheckCircleOutlined />,
        color: "#0284c7",
        bg: "linear-gradient(150deg, #effcff 0%, #d9f3ff 55%, #c8ecff 100%)",
        progress: activeRate,
      },
      {
        title: "Ngưng hoạt động",
        value: inactive,
        suffix: "ca",
        description: `Tỷ lệ: ${inactiveRate.toFixed(1)}%`,
        icon: <StopOutlined />,
        color: "#0369a1",
        bg: "linear-gradient(150deg, #ebfbff 0%, #d6f3ff 55%, #c4ebff 100%)",
        progress: inactiveRate,
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
  }, [shifts, filteredShifts]);

  return (
    <AdminPage title="Quản lý ca làm việc">
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <Card
          className="shift-overview-card"
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
                Trung tâm quản trị ca làm việc
              </Text>
              <div style={{ marginTop: 8 }}>
                <Text style={{ color: "rgba(241,245,249,0.9)" }}>
                  Theo dõi lịch làm, quản lý trạng thái ca và tối ưu vận hành chấm công theo thời gian thực.
                </Text>
              </div>
            </div>
            <Space size={8} wrap>
              <Tag color="cyan">Hiển thị: {filteredShifts.length}</Tag>
              <Tag color="blue">Tổng: {shifts.length}</Tag>
            </Space>
          </div>

          <Row gutter={[16, 16]}>
            {stats.map((stat) => (
              <Col xs={24} sm={12} lg={6} key={stat.title}>
                <Card
                  className="shift-stat-card"
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

        <Card
          className="shift-filter-card"
          bordered={false}
          style={{
            borderRadius: 18,
            boxShadow: "0 14px 28px rgba(15, 42, 96, 0.1)",
            background: "linear-gradient(145deg, #ffffff 0%, #f8fbff 45%, #eef7ff 100%)",
          }}
          bodyStyle={{ padding: 18 }}
        >
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} xl={12}>
              <Input.Search
                className="shift-search-input"
                allowClear
                size="large"
                placeholder="Tìm theo mã ca hoặc tên ca"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>

            <Col xs={24} sm={12} xl={4}>
              <Select
                className="shift-status-select"
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
      <style jsx global>{`
        .shift-stat-card {
          transition:
            transform 220ms ease,
            box-shadow 220ms ease,
            filter 220ms ease;
          will-change: transform;
        }
        .shift-stat-card:hover {
          transform: translateY(-5px);
          box-shadow:
            inset 0 0 0 1px rgba(12, 74, 110, 0.2),
            0 18px 30px rgba(12, 74, 110, 0.24) !important;
          filter: saturate(1.04);
        }
        .shift-overview-card {
          overflow: hidden;
          position: relative;
        }
        .shift-overview-card::after {
          content: "";
          position: absolute;
          inset: auto -80px -100px auto;
          width: 280px;
          height: 280px;
          background: radial-gradient(circle, rgba(125, 211, 252, 0.34) 0%, rgba(125, 211, 252, 0) 70%);
          pointer-events: none;
        }
        .shift-filter-card {
          border: 1px solid #dbeafe;
          overflow: hidden;
        }
        .shift-search-input .ant-input,
        .shift-search-input .ant-input-group-addon button,
        .shift-status-select .ant-select-selector {
          border-color: #bfdbfe !important;
        }
      `}</style>
    </AdminPage>
  );
}
