"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/utils/api";
import { toast } from "react-toastify";
import Link from "next/link"; 
import { Form, Input, Button } from "antd"; 

export default function ResetPasswordPage() {
  const [form] = Form.useForm(); 
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    if (!token) {
      toast.error("Token không hợp lệ hoặc đã hết hạn!");
      return;
    }
    
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: values.newPassword,
      });
      toast.success("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.");
      router.push("/auth/login"); 
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Đặt lại mật khẩu</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Nhập mật khẩu mới của bạn bên dưới
        </p>

        {/* Chuyển sang dùng Form của Ant Design */}
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự." },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu nhập lại không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="h-11 text-base bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {loading ? "Đang xử lý..." : "Xác nhận đặt lại"}
            </Button>
          </Form.Item>
        </Form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Quay lại{" "}
          {/* Sửa lại thẻ <a> và đường dẫn */}
          <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}