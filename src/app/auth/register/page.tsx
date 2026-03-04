"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Col, DatePicker, Form, Input, InputNumber, Row, Select, message } from "antd";
import api from "@/utils/api";
import AvatarUpload from "@/components/auth/register/AvatarUpload";

interface Department {
  maPB: number;
  tenPhong: string;
}

interface RegisterFormValues {
  hoTen: string;
  email: string;
  matKhau: string;
  xacNhanMatKhau: string;
  soDienThoai?: string;
  gioiTinh?: "Nam" | "Nữ" | "Khác";
  tuoi?: number;
  diaChi?: string;
  cccd?: string;
  maPB?: number;
  ngayBatDau?: Dayjs;
}

export default function RegisterPage() {
  const [form] = Form.useForm<RegisterFormValues>();
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get<Department[]>("/phongban");
        setDepartments(Array.isArray(res.data) ? res.data : []);
      } catch {
        message.error("Không thể tải danh sách phòng ban");
      }
    };

    fetchDepartments();
  }, []);

  const departmentOptions = useMemo(
    () =>
      departments.map((item) => ({
        value: item.maPB,
        label: item.tenPhong,
      })),
    [departments]
  );

  const disabledNgayBatDau = (current: Dayjs) => current.isAfter(dayjs().endOf("day"));

  const handleSubmit = async (values: RegisterFormValues) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("hoTen", values.hoTen.trim());
      formData.append("email", values.email.trim());
      formData.append("matKhau", values.matKhau);
      formData.append("vaiTro", "nhanvien");

      if (values.soDienThoai) formData.append("soDienThoai", values.soDienThoai.trim());
      if (values.gioiTinh) formData.append("gioiTinh", values.gioiTinh);
      if (typeof values.tuoi === "number") formData.append("tuoi", String(values.tuoi));
      if (values.diaChi) formData.append("diaChi", values.diaChi.trim());
      if (values.cccd) formData.append("cccd", values.cccd.trim());
      if (typeof values.maPB === "number") formData.append("maPB", String(values.maPB));
      if (values.ngayBatDau) formData.append("ngayBatDau", values.ngayBatDau.format("YYYY-MM-DD"));
      if (avatarFile) formData.append("avatar", avatarFile);

      await api.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Đăng ký thành công. Tài khoản đang chờ quản trị viên phê duyệt.");
      form.resetFields();
      setAvatarFile(null);
      setTimeout(() => router.push("/auth/login"), 900);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-200 p-4 md:p-8">
      <section className="mx-auto grid min-h-[86vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-2xl backdrop-blur-md lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-sky-700 via-cyan-700 to-teal-700 p-8 text-white lg:flex">
          <div>
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-xl font-bold">
              IT
            </div>
            <h1 className="text-3xl font-extrabold leading-tight">Tạo tài khoản nhân viên IT-GLOBAL</h1>
            <p className="mt-3 text-sm text-cyan-100">
              Hoàn tất thông tin cá nhân để bắt đầu sử dụng hệ thống chấm công, nghỉ phép và quản trị công việc.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-cyan-50">
            Mẹo: dùng ảnh chân dung rõ mặt để hỗ trợ các tính năng xác thực khuôn mặt.
          </div>
        </div>

        <div className="overflow-y-auto p-6 sm:p-8 md:p-10">
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-800">Đăng ký tài khoản</h2>
            <p className="mt-1 text-sm text-slate-500">Điền đầy đủ thông tin bên dưới</p>
          </div>

          <AvatarUpload value={avatarFile || undefined} onChange={setAvatarFile} />

          <Form<RegisterFormValues> form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Họ và tên"
                  name="hoTen"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ và tên" },
                    { min: 2, message: "Họ và tên tối thiểu 2 ký tự" },
                  ]}
                >
                  <Input size="large" placeholder="Nguyễn Văn A" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input size="large" placeholder="name@itglobal.vn" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Mật khẩu"
                  name="matKhau"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu" },
                    { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                  ]}
                >
                  <Input.Password size="large" placeholder="Tối thiểu 6 ký tự" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Xác nhận mật khẩu"
                  name="xacNhanMatKhau"
                  dependencies={["matKhau"]}
                  rules={[
                    { required: true, message: "Vui lòng xác nhận mật khẩu" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("matKhau") === value) {
                          return Promise.resolve();
                        }

                        return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                      },
                    }),
                  ]}
                >
                  <Input.Password size="large" placeholder="Nhập lại mật khẩu" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="soDienThoai"
                  rules={[
                    {
                      pattern: /^(0|\+84)([0-9]{9,10})$/,
                      message: "Số điện thoại không hợp lệ",
                    },
                  ]}
                >
                  <Input size="large" placeholder="0912345678" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Giới tính" name="gioiTinh">
                  <Select
                    size="large"
                    placeholder="Chọn giới tính"
                    options={[
                      { label: "Nam", value: "Nam" },
                      { label: "Nữ", value: "Nữ" },
                      { label: "Khác", value: "Khác" },
                    ]}
                    allowClear
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Tuổi"
                  name="tuoi"
                  rules={[{ type: "number", min: 18, max: 65, message: "Tuổi từ 18 đến 65" }]}
                >
                  <InputNumber size="large" className="w-full" min={18} max={65} placeholder="18 - 65" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="CCCD"
                  name="cccd"
                  rules={[{ pattern: /^[0-9]{12}$/, message: "CCCD gồm 12 chữ số" }]}
                >
                  <Input size="large" placeholder="012345678901" maxLength={12} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Phòng ban" name="maPB">
                  <Select size="large" placeholder="Chọn phòng ban" options={departmentOptions} allowClear />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Ngày bắt đầu" name="ngayBatDau">
                  <DatePicker size="large" className="w-full" format="DD/MM/YYYY" disabledDate={disabledNgayBatDau} />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item label="Địa chỉ" name="diaChi">
                  <Input.TextArea rows={3} placeholder="Nhập địa chỉ hiện tại" />
                </Form.Item>
              </Col>
            </Row>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="h-11 border-0 bg-gradient-to-r from-sky-600 to-cyan-500 font-semibold shadow-lg shadow-cyan-200/70"
            >
              Đăng ký ngay
            </Button>

            <div className="mt-4 text-center text-sm text-slate-500">
              Đã có tài khoản? {" "}
              <Link href="/auth/login" className="font-semibold text-sky-700 hover:underline">
                Đăng nhập
              </Link>
            </div>
          </Form>
        </div>
      </section>
    </main>
  );
}
