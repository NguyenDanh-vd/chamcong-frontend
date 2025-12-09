"use client";

import { useEffect, useState } from "react";
import { message, Form, ConfigProvider } from "antd";
import dayjs from "dayjs";
import api from "@/utils/api";
import AdminPage from "@/components/AdminPage";
import "dayjs/locale/vi";
import viVN from "antd/locale/vi_VN";

// Import Components & Utils đã tách
import SalaryFilters from "@/components/admin/luong/SalaryFilters";
import SalaryTable from "@/components/admin/luong/SalaryTable";
import EditSalaryModal from "@/components/admin/luong/EditSalaryModal";
import { exportSalaryExcel } from "@/components/admin/luong/salary.utils";

const LuongPage = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [thang, setThang] = useState(dayjs());
  const [tinhLuongLoading, setTinhLuongLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  // 🔹 Lấy danh sách lương
  const fetchLuong = async () => {
    try {
      setLoading(true);
      const res = await api.get("/luong");
      setData(res.data);
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

  // 🔹 Gọi API tính lương tự động
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

  // 🔹 Đánh dấu đã trả lương
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

  // 🔹 Modal Logic
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

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>
        Quản lý lương nhân viên
      </h1>

      {/* 1. Bộ lọc */}
      <SalaryFilters 
        thang={thang} 
        setThang={setThang} 
        onTinhLuong={tinhLuong} 
        tinhLuongLoading={tinhLuongLoading} 
        onReload={fetchLuong}
        onExport={() => exportSalaryExcel(data, thang)} // Gọi hàm từ Utils
      />

      {/* 2. Bảng */}
      <SalaryTable 
        data={data} 
        loading={loading} 
        onEdit={openEditModal} 
        onMarkPaid={danhDauDaTra} 
        updatingId={updating}
      />

      {/* 3. Modal */}
      <EditSalaryModal 
        editing={editing} 
        onCancel={closeEditModal} 
        onUpdate={updateLuong} 
        form={form} 
      />
    </div>
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