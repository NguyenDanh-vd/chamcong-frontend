"use client";
import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import AdminPage from "@/components/AdminPage";
import { Button, Form, message, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

// Import Components đã tách
import ShiftModal from "@/components/admin/ca-lam-viec/ShiftModal";
import ShiftTable, { Shift } from "@/components/admin/ca-lam-viec/ShiftTable";

export default function AdminCaLamViec() {
  const [form] = Form.useForm();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Shift | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchShifts = () => {
    setLoading(true);
    api
      .get("/calamviec")
      .then((res) => {
        setShifts(res.data);
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
        message.success("Cập nhật ca làm thành công!");
      } else {
        await api.post("/calamviec", payload);
        message.success("Thêm ca làm mới thành công!");
      }
      handleCancel();
      fetchShifts();
    } catch (err) {
      console.error(err);
      message.error("Thao tác thất bại!");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (maCa: number) => {
    try {
      await api.delete(`/calamviec/${maCa}`);
      message.success("Xóa ca làm thành công!");
      fetchShifts();
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi xóa ca làm");
    }
  };

  // Tách logic đổi trạng thái ra đây để truyền vào Table
  const handleStatusChange = async (checked: boolean, record: Shift) => {
    try {
      await api.put(`/calamviec/${record.maCa}`, {
        ...record,
        trangThai: checked,
      });
      message.success("Cập nhật trạng thái thành công!");
      fetchShifts();
    } catch (err) {
      console.error(err);
      message.error("Cập nhật trạng thái thất bại!");
    }
  };

  return (
    <AdminPage title="Quản lý Ca làm việc">
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            size="large"
            style={{
              background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "10px 20px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.95";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            Thêm ca làm mới
          </Button>
        </div>

        {/* Gọi Component Table đã tách */}
        <ShiftTable 
            shifts={shifts}
            loading={loading}
            onEdit={showModal}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
        />
      </Card>

      {/* Gọi Component Modal đã tách */}
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