"use client";

import React, { useEffect, useState } from "react";
import AdminPage from "@/components/AdminPage";
import api from "@/utils/api";
import {
  App,
  Card,
  Row,
  Col,
  Avatar,
  Form,
  Input,
  Button,
  Spin,
  Upload,
  Descriptions,
  Space,
  DatePicker,
  Select,
} from "antd";
import { UserOutlined, UploadOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import CustomButton from "@/components/CustomButton";
const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function ProfilePage() {
  const { message } = App.useApp();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/nhanvien/profile");
      const profileData = {
        ...res.data,
        ngayBatDau: res.data.ngayBatDau
          ? dayjs(res.data.ngayBatDau)
          : null,
      };
      setUser(profileData);
      profileForm.setFieldsValue(profileData);
      setAvatarPreview(res.data.avatarUrl || "");
    } catch (error) {
      message.error("Không thể tải thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (values: any) => {
    setSubmitLoading(true);
    try {
      const payload = {
        ...values,
        ngayBatDau: values.ngayBatDau
          ? dayjs(values.ngayBatDau).format("DD/MM/YYYY")
          : null,
      };
      await api.patch("/nhanvien/profile", payload);

      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        await api.post(`/nhanvien/${user.id}/avatar`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      message.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
      setAvatarFile(null);
      fetchProfile();
    } catch (error) {
      message.error("Cập nhật thất bại!");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePasswordUpdate = async (values: any) => {
    try {
      await api.put(`/nhanvien/${user.id}/password`, {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success("Đổi mật khẩu thành công!");
      passwordForm.resetFields();
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || "Đổi mật khẩu thất bại!";
      message.error(errMsg);
    }
  };

  const handleAvatarChange = async ({ file }: any) => {
    if (file) {
      setAvatarFile(file);
      const preview = await getBase64(file);
      setAvatarPreview(preview);
    }
  };

  return (
    <AdminPage title="Thông tin cá nhân">
      <App>
        <Spin spinning={loading}>
          {user && (
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card>
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <Avatar
                      size={150}
                      src={avatarPreview || <UserOutlined />}
                    />
                    <h2 style={{ marginTop: 20, fontSize: "1.5rem" }}>
                      {user.hoTen}
                    </h2>
                    <p style={{ color: "var(--text-secondary)" }}>
                      {user.email}
                    </p>
                    {isEditing && (
                      <Upload
                        maxCount={1}
                        customRequest={({ file }) =>
                          handleAvatarChange({ file })
                        }
                        showUploadList={false}
                        accept="image/*"
                      >
                        <CustomButton
                          type="primary"
                          icon={<UploadOutlined />}
                          style={{ marginTop: 10 }}
                        >
                          Chọn ảnh mới
                        </CustomButton>
                      </Upload>
                    )}
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={16}>
                <Card
                  title="Thông tin chi tiết"
                  extra={
                    !isEditing && (
                      <CustomButton
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => setIsEditing(true)}
                      >
                        Chỉnh sửa
                      </CustomButton>
                    )
                  }
                >
                  {isEditing ? (
                    <Form
                      form={profileForm}
                      layout="vertical"
                      onFinish={handleProfileUpdate}
                      initialValues={user}
                    >
                      <Form.Item
                        name="hoTen"
                        label="Họ và Tên"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item name="soDienThoai" label="Số điện thoại">
                        <Input />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="gioiTinh" label="Giới tính">
                            <Select placeholder="Chọn giới tính">
                              <Select.Option value="Nam">Nam</Select.Option>
                              <Select.Option value="Nữ">Nữ</Select.Option>
                              <Select.Option value="Khác">Khác</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="tuoi" label="Tuổi">
                            <Input type="number" placeholder="Nhập tuổi" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item name="cccd" label="CCCD">
                        <Input readOnly title="CCCD không thể thay đổi" />
                      </Form.Item>

                      <Form.Item name="diaChi" label="Địa chỉ">
                        <Input.TextArea rows={3} />
                      </Form.Item>

                      <Form.Item
                        name="ngayBatDau"
                        label="Ngày bắt đầu làm việc"
                      >
                        <DatePicker
                          format="DD/MM/YYYY"
                          style={{ width: "100%" }}
                          disabled
                          title="Ngày bắt đầu làm việc không thể thay đổi"
                        />
                      </Form.Item>

                      <Form.Item>
                        <Space>
                          <CustomButton
                            type="primary"
                            htmlType="submit"
                            loading={submitLoading}
                          >
                            Lưu thay đổi
                          </CustomButton>
                          <CustomButton
                          danger
                            onClick={() => {
                              setIsEditing(false);
                              setAvatarFile(null);
                              fetchProfile();
                            }}
                          >
                            Hủy
                          </CustomButton>
                        </Space>
                      </Form.Item>
                    </Form>
                  ) : (
                    <Descriptions column={1} bordered>
                      <Descriptions.Item label="Họ và Tên">
                        {user.hoTen}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        {user.email}
                      </Descriptions.Item>
                      <Descriptions.Item label="Số điện thoại">
                        {user.soDienThoai || "Chưa cập nhật"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Giới tính">
                        {user.gioiTinh || "Chưa cập nhật"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tuổi">
                        {user.tuoi || "Chưa cập nhật"}
                      </Descriptions.Item>
                      <Descriptions.Item label="CCCD">
                        {user.cccd || "Chưa cập nhật"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Địa chỉ">
                        {user.diaChi || "Chưa cập nhật"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày bắt đầu">
                        {user.ngayBatDau
                          ? dayjs(user.ngayBatDau).format("DD/MM/YYYY")
                          : "Chưa cập nhật"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Vai trò">
                        {user.role}
                      </Descriptions.Item>
                      <Descriptions.Item label="Phòng ban">
                        {user.phongBan?.tenPhong || "Chưa có"}
                      </Descriptions.Item>
                    </Descriptions>
                  )}
                </Card>

                <Card title="Đổi mật khẩu" style={{ marginTop: 24 }}>
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordUpdate}
                  >
                    <Form.Item
                      name="oldPassword"
                      label="Mật khẩu cũ"
                      rules={[{ required: true }]}
                    >
                      <Input.Password />
                    </Form.Item>

                    <Form.Item
                      name="newPassword"
                      label="Mật khẩu mới"
                      rules={[{ required: true, min: 6 }]}
                    >
                      <Input.Password />
                    </Form.Item>

                    <Form.Item
                      name="confirmPassword"
                      label="Xác nhận mật khẩu mới"
                      dependencies={["newPassword"]}
                      hasFeedback
                      rules={[
                        { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("newPassword") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error("Hai mật khẩu không khớp!")
                            );
                          },
                        }),
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>

                    <Form.Item>
                      <CustomButton type="primary" htmlType="submit">
                        Đổi mật khẩu
                      </CustomButton>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
            </Row>
          )}
        </Spin>
      </App>
    </AdminPage>
  );
}
