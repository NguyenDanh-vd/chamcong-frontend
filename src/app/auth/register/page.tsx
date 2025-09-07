"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  message,
  Row,
  Col,
  Avatar,
  Modal,
} from "antd";
import { CameraOutlined, UserOutlined } from "@ant-design/icons";
import axios from "axios";
import Webcam from "react-webcam";
import dayjs from "dayjs";
import Link from "next/link";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState<any[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get("/phongban")
      .then((res) => setDepartments(res.data))
      .catch(() => message.error("Không thể tải danh sách phòng ban"));
  }, []);

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    const byteString = atob(imageSrc.split(",")[1]);
    const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], "avatar.jpg", { type: mimeString });

    setFileList([{ uid: "-2", name: "avatar.jpg", originFileObj: file, url: imageSrc }]);
    setCameraVisible(false);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("hoTen", values.hoTen);
      formData.append("email", values.email);
      formData.append("matKhau", values.matKhau);
      formData.append("soDienThoai", values.soDienThoai);
      formData.append("gioiTinh", values.gioiTinh || "");
      formData.append("tuoi", values.tuoi.toString());
      formData.append("diaChi", values.diaChi || "");
      formData.append("vaiTro", "nhanvien"); // mặc định
      formData.append("cccd", values.cccd);
      formData.append("maPB", values.maPB);
      if (values.ngayBatDau) formData.append("ngayBatDau", values.ngayBatDau.format("YYYY-MM-DD"));
      if (fileList[0]?.originFileObj) formData.append("avatar", fileList[0].originFileObj);

      await api.post("auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Đăng ký nhân viên thành công!");
      form.resetFields();
      setFileList([]);
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

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                setFileList([{ uid: "-1", name: file.name, originFileObj: file, url }]);
              }
            }}
          />
          <Avatar
            size={100}
            src={fileList[0]?.url}
            icon={<UserOutlined />}
            style={{ cursor: "pointer", border: "2px dashed #d9d9d9" }}
            onClick={() => fileInputRef.current?.click()}
          />
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Họ và tên"
                name="hoTen"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Mật khẩu"
                name="matKhau"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              >
                <Input.Password />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item label="Giới tính" name="gioiTinh">
                <Select
                  placeholder="Chọn giới tính"
                  options={[
                    { value: "Nam", label: "Nam" },
                    { value: "Nữ", label: "Nữ" },
                    { value: "Khác", label: "Khác" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Tuổi"
                name="tuoi"
                rules={[
                  { required: true, message: "Vui lòng nhập tuổi" },
                  { type: "number", min: 18, message: "Tuổi phải từ 18 trở lên" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} min={18} placeholder="Nhập tuổi" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Số điện thoại"
                name="soDienThoai"
                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Số CCCD"
                name="cccd"
                rules={[{ required: true, message: "Vui lòng nhập CCCD" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Phòng ban"
                name="maPB"
                rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}
              >
                <Select
                  placeholder="Chọn phòng ban"
                  options={departments.map((pb) => ({ value: pb.maPB, label: pb.tenPhong }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Ngày bắt đầu"
                name="ngayBatDau"
                rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  disabledDate={(current) => current && current < dayjs().startOf("day")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item label="Địa chỉ" name="diaChi">
                <Input.TextArea rows={1} placeholder="Nhập địa chỉ thường trú" />
              </Form.Item>
            </Col>
          </Row>

          <Button
            icon={<CameraOutlined />}
            style={{ marginBottom: 16 }}
            onClick={() => setCameraVisible(true)}
          >
            Chụp ảnh
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Đăng ký ngay
          </Button>

          <p className="text-sm text-gray-500 text-center mt-6">
            Đã có tài khoản?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </Form>

        <Modal
          title="Chụp ảnh"
          open={cameraVisible}
          onCancel={() => setCameraVisible(false)}
          footer={null}
        >
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            videoConstraints={{ facingMode: "user" }}
          />
          <Button type="primary" onClick={capturePhoto} block style={{ marginTop: 12 }}>
            Chụp & Lưu
          </Button>
        </Modal>
      </div>
    </div>
  );
}
