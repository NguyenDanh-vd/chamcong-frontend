"use client";
import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber, Select, DatePicker, Button, message, Row, Col } from "antd";
import api from "@/utils/api";
import dayjs from "dayjs";
import Link from "next/link";
import AvatarUpload from "@/components/auth/register/AvatarUpload"; 

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State lưu file avatar riêng
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    api.get("/phongban")
      .then((res) => setDepartments(res.data))
      .catch(() => message.error("Lỗi tải phòng ban"));
  }, []);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      // ... append các trường thông thường ...
      formData.append("hoTen", values.hoTen);
      formData.append("email", values.email);
      formData.append("matKhau", values.matKhau);
      formData.append("soDienThoai", values.soDienThoai);
      formData.append("gioiTinh", values.gioiTinh || "");
      formData.append("tuoi", values.tuoi.toString());
      formData.append("diaChi", values.diaChi || "");
      formData.append("vaiTro", "nhanvien");
      formData.append("cccd", values.cccd);
      formData.append("maPB", values.maPB);
      if (values.ngayBatDau) formData.append("ngayBatDau", values.ngayBatDau.format("YYYY-MM-DD"));
      
      // CHỈ CẦN APPEND FILE TỪ STATE
      if (avatarFile) formData.append("avatar", avatarFile);

      await api.post("auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Đăng ký thành công!");
      form.resetFields();
      setAvatarFile(null); 
    } catch (err: any) {
      message.error(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-blue-500 py-10">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Đăng Ký Nhân Viên</h1>

        <AvatarUpload 
            value={avatarFile || undefined} 
            onChange={(file) => setAvatarFile(file)} 
        />

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
           <Row gutter={16}>
             <Col xs={24} sm={12}>
                <Form.Item label="Họ và tên" name="hoTen" rules={[{ required: true }]}>
                   <Input />
                </Form.Item>
             </Col>
           </Row>

          <Button type="primary" htmlType="submit" block loading={loading} className="bg-gradient-to-r from-blue-600 to-purple-600">
            Đăng ký ngay
          </Button>

          <p className="text-sm text-gray-500 text-center mt-6">
            Đã có tài khoản? <Link href="/auth/login" className="text-blue-600 hover:underline">Đăng nhập</Link>
          </p>
        </Form>
      </div>
    </div>
  );
}