"use client";
import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import AdminPage from "@/components/AdminPage";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  TimePicker,
  Space,
  Popconfirm,
  message,
  Card,
  Tooltip,
  Switch,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import CustomButton from "@/components/CustomButton";
// Định nghĩa kiểu dữ liệu cho Ca làm việc
interface Shift {
  maCa: number;
  tenCa: string;
  gioBatDau: string; // Dạng "HH:mm:ss"
  gioKetThuc: string; // Dạng "HH:mm:ss"
  trangThai: boolean; // ✅ Thêm trạng thái
}

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

  const columns = [
    { title: "Mã Ca", dataIndex: "maCa", key: "maCa", width: 100 },
    { title: "Tên Ca", dataIndex: "tenCa", key: "tenCa" },
    { title: "Giờ Bắt Đầu", dataIndex: "gioBatDau", key: "gioBatDau" },
    { title: "Giờ Kết Thúc", dataIndex: "gioKetThuc", key: "gioKetThuc" },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center" as const,
      render: (value: boolean, record: Shift) => (
        <Switch
          checked={value}
          checkedChildren="Hoạt động"
          unCheckedChildren="Ngưng"
          onChange={async (checked) => {
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
          }}
        />
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center" as const,
      width: 120,
      render: (_: any, record: Shift) => (
        <Space size="middle">
          <Tooltip title="Sửa">
            <CustomButton
              type="primary"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa ca làm việc"
              description="Bạn có chắc muốn xóa ca làm này?"
              onConfirm={() => handleDelete(record.maCa)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <CustomButton type="primary" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

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
        <Table
          columns={columns}
          dataSource={shifts}
          rowKey="maCa"
          loading={loading}
          bordered
        />
      </Card>

      <Modal
        title={editingRecord ? "Chỉnh sửa ca làm việc" : "Thêm ca làm việc mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}
          style={{
            background: "linear-gradient(135deg, #dc2052ff, #b54242ff)", // giữ nguyên
            color: "#fff",
            border: "none",
            fontWeight: 600,
            borderRadius: "8px",
            padding: "8px 20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
            onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          }}
            onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={() => form.submit()}
            style={{
            background: "linear-gradient(135deg, #06b6d4, #3b82f6)", // giữ nguyên
            color: "#fff",
            border: "none",
            fontWeight: 600,
            borderRadius: "8px",
            padding: "8px 20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
            onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          }}
            onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
          >
            Lưu
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="tenCa"
            label="Tên ca"
            rules={[{ required: true, message: "Vui lòng nhập tên ca!" }]}
          >
            <Input placeholder="Ví dụ: Ca Hành chính" />
          </Form.Item>
          <Form.Item
            name="gioBatDau"
            label="Giờ bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu!" }]}
          >
            <TimePicker style={{ width: "100%" }} format="HH:mm:ss" />
          </Form.Item>
          <Form.Item
            name="gioKetThuc"
            label="Giờ kết thúc"
            rules={[{ required: true, message: "Vui lòng chọn giờ kết thúc!" }]}
          >
            <TimePicker style={{ width: "100%" }} format="HH:mm:ss" />
          </Form.Item>
        </Form>
      </Modal>
    </AdminPage>
  );
}
