"use client";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import AdminPage from "@/components/AdminPage";
import { message, Card, Form } from "antd";

// Import các component đã tách
import DepartmentToolbar from "@/components/admin/phong-ban/DepartmentToolbar";
import DepartmentTable, { Department } from "@/components/admin/phong-ban/DepartmentTable";
import DepartmentModal from "@/components/admin/phong-ban/DepartmentModal";

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

  return (
    <AdminPage title="Quản lý phòng ban">
      <Card>
        {/* 1. Toolbar */}
        <DepartmentToolbar 
          onAdd={() => showModal()} 
          searchText={searchText} 
          onSearch={handleSearch} 
        />

        {/* 2. Table */}
        <DepartmentTable 
          dataSource={filteredDepartments} 
          loading={loading} 
          onEdit={showModal} 
          onDelete={handleDelete} 
        />
      </Card>

      {/* 3. Modal */}
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