"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button } from "antd";
import { toast } from "react-toastify";
import Link from "next/link";
import api from "@/utils/api";

export default function ResetPasswordPageClient() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token"));
  }, []);

  if (!token) return <p className="text-red-500">Token không hợp lệ hoặc đã hết hạn!</p>;

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: values.newPassword,
      });
      toast.success("Đặt lại mật khẩu thành công!");
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
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true }, { min: 6 }]}>
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item name="confirmPassword" label="Xác nhận mật khẩu mới" dependencies={["newPassword"]} rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                return Promise.reject(new Error("Mật khẩu nhập lại không khớp!"));
              }
            })
          ]}>
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" block loading={loading}>Xác nhận đặt lại</Button>
          </Form.Item>
        </Form>
        <p className="text-center mt-6">
          Quay lại <Link href="/auth/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
