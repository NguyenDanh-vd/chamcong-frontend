"use client";
import { useState } from "react";
import api from "@/utils/api";
import { toast } from "react-toastify";
import Link from "next/link";
import { Form, Input, Button, App } from "antd"; 
import { FaArrowLeft } from "react-icons/fa";

export default function ForgotPasswordPage() {
  const [form] = Form.useForm(); 
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: values.email });
      toast.success(
        "Yêu cầu thành công! Vui lòng kiểm tra email để nhận liên kết đặt lại mật khẩu.",
      );
      form.resetFields(); 
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi gửi yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <App>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Quên mật khẩu
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Nhập email để nhận liên kết đặt lại mật khẩu
          </p>

          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
              name="email"
              label="Email đã đăng ký"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Địa chỉ email không hợp lệ!" },
              ]}
            >
              <Input placeholder="Email của bạn" size="large" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="h-11 text-base bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {loading ? "Đang xử lý..." : "Gửi liên kết đặt lại"}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-4">
            <Link
              href="/auth/login" 
              className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium"
            >
              <FaArrowLeft /> Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </App>
  );
}
