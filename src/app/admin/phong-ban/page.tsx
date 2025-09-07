"use client";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import AdminPage from "@/components/AdminPage";
import {
  Table,
  Button,
  Input,
  Space,
  Popconfirm,
  message,
  Card,
  Tooltip,
  Modal,
  Form,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomButton from "@/components/CustomButton";
interface Department {
  maPB: number;
  tenPhong: string;
  moTa?: string;
}

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
    } catch (err) {
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
      message.error("Tên phòng ban không hợp lệ!");
      return;
    }

    setSubmitLoading(true);
    const payload: Partial<Department> = {
      tenPhong: values.tenPhong.trim(),
      moTa: values.moTa?.trim() || null,
    };

    console.log("PUT payload:", payload, "ID:", editingRecord?.maPB);

    try {
      if (editingRecord) {
        await api.put(`/phongban/${editingRecord.maPB}`, payload);
        message.success("Cập nhật phòng ban thành công!");
      } else {
        await api.post("/phongban", payload);
        message.success("Thêm phòng ban mới thành công!");
      }
      handleCancel();
      fetchDepartments();
    } catch (err: any) {
      console.error("Lỗi khi PUT/POST phòng ban:", err.response?.data || err);
      message.error(err.response?.data?.message || "Thao tác thất bại!");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (maPB: number) => {
    try {
      await api.delete(`/phongban/${maPB}`);
      message.success("Xóa phòng ban thành công!");
      fetchDepartments();
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || "Lỗi khi xóa phòng ban");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    const lowercasedValue = value.toLowerCase();
    const filteredData = departments.filter(
      (item) =>
        item.tenPhong.toLowerCase().includes(lowercasedValue) ||
        (item.moTa && item.moTa.toLowerCase().includes(lowercasedValue))
    );
    setFilteredDepartments(filteredData);
  };

  const columns = [
    { title: "Mã PB", dataIndex: "maPB", key: "maPB", width: 100 },
    { title: "Tên phòng ban", dataIndex: "tenPhong", key: "tenPhong" },
    { title: "Mô tả", dataIndex: "moTa", key: "moTa" },
    {
      title: "Hành động",
      key: "action",
      align: "center" as const,
      width: 120,
      render: (_: any, record: Department) => (
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
              title="Xóa phòng ban"
              description="Bạn có chắc muốn xóa phòng ban này?"
              onConfirm={() => handleDelete(record.maPB)}
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
    <AdminPage title="Quản lý phòng ban">
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
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
            Thêm phòng ban mới
           </Button>

          <Input.Search
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
            value={searchText}
            onChange={handleSearch}
            allowClear
            size="large"
            style={{ width: 300 }}
          />
        </div>

        <Table columns={columns} dataSource={filteredDepartments} rowKey="maPB" loading={loading} bordered />
      </Card>

      <Modal
        title={editingRecord ? `Chỉnh sửa phòng ban: ${editingRecord.tenPhong}` : "Thêm phòng ban mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        afterClose={() => form.resetFields()}
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
          <Button key="submit" type="primary" loading={submitLoading} onClick={() => form.submit()}
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
            name="tenPhong"
            label="Tên phòng ban"
            rules={[{ required: true, message: "Vui lòng nhập tên phòng ban!" }]}
          >
            <Input placeholder="Ví dụ: Phòng Kỹ thuật" />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả">
            <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết (không bắt buộc)" />
          </Form.Item>
        </Form>
      </Modal>
    </AdminPage>
  );
}
