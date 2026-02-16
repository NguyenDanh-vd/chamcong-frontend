"use client";

import React, { useEffect, useMemo, useState } from "react";
import AdminPage from "@/components/AdminPage";
import api from "@/utils/api";
import { App, Card, Col, Form, Row, Space, Spin, Statistic, Tag, Typography } from "antd";
import { CheckCircleOutlined, IdcardOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import ProfileAvatarCard from "@/components/admin/profile/ProfileAvatarCard";
import ProfileInfoForm from "@/components/admin/profile/ProfileInfoForm";
import PasswordForm from "@/components/admin/profile/PasswordForm";

const { Text } = Typography;

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
        ngayBatDau: res.data.ngayBatDau ? dayjs(res.data.ngayBatDau) : null,
      };
      setUser(profileData);
      profileForm.setFieldsValue(profileData);
      setAvatarPreview(res.data.avatarUrl || res.data.avatar || "");
    } catch {
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
        ngayBatDau: values.ngayBatDau ? dayjs(values.ngayBatDau).format("DD/MM/YYYY") : null,
      };
      await api.patch("/nhanvien/profile", payload);

      const userId = user?.id || user?.maNV;
      if (avatarFile && userId) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        await api.post(`/nhanvien/${userId}/avatar`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      message.success("Cập nhật thông tin thành công");
      setIsEditing(false);
      setAvatarFile(null);
      fetchProfile();
    } catch {
      message.error("Cập nhật thất bại");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePasswordUpdate = async (values: any) => {
    try {
      const userId = user?.id || user?.maNV;
      await api.put(`/nhanvien/${userId}/password`, {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success("Đổi mật khẩu thành công");
      passwordForm.resetFields();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Đổi mật khẩu thất bại";
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

  const profileStats = useMemo(() => {
    if (!user) return [];

    const hasPhone = !!user.soDienThoai;
    const hasAddress = !!user.diaChi;
    const hasId = !!user.cccd;

    return [
      {
        title: "Mức hoàn thiện",
        value: [hasPhone, hasAddress, hasId].filter(Boolean).length,
        suffix: "/ 3",
        icon: <CheckCircleOutlined />,
        color: "#047857",
        bg: "linear-gradient(145deg, #ecfdf5, #dcfce7)",
      },
      {
        title: "Mã nhân viên",
        value: user.maNV || user.id || "--",
        suffix: "",
        icon: <IdcardOutlined />,
        color: "#1d4ed8",
        bg: "linear-gradient(145deg, #eff6ff, #dbeafe)",
      },
      {
        title: "Vai trò",
        value: user.vaiTro || user.role || "--",
        suffix: "",
        icon: <UserOutlined />,
        color: "#7c3aed",
        bg: "linear-gradient(145deg, #f5f3ff, #ede9fe)",
      },
      {
        title: "Bảo mật",
        value: "Sẵn sàng",
        suffix: "",
        icon: <LockOutlined />,
        color: "#b45309",
        bg: "linear-gradient(145deg, #fff7ed, #ffedd5)",
      },
    ];
  }, [user]);

  return (
    <AdminPage title="Thông tin cá nhân">
      <Spin spinning={loading}>
        {user ? (
          <Space direction="vertical" size={18} style={{ width: "100%" }}>
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                background: "linear-gradient(145deg, #ffffff 0%, #f8fbff 50%, #eef7ff 100%)",
                boxShadow: "0 12px 28px rgba(2, 32, 71, 0.08)",
              }}
              bodyStyle={{ padding: 20 }}
            >
              <div style={{ marginBottom: 14 }}>
                <Text style={{ color: "#0f172a", fontWeight: 700, fontSize: 22 }}>Hồ sơ tài khoản</Text>
                <div style={{ marginTop: 8 }}>
                  <Text style={{ color: "#475569" }}>
                    Quản lý thông tin cá nhân, ảnh đại diện và cài đặt bảo mật trong một màn hình.
                  </Text>
                </div>
              </div>

              <Row gutter={[12, 12]}>
                {profileStats.map((stat) => (
                  <Col xs={24} sm={12} lg={6} key={stat.title}>
                    <Card
                      bordered={false}
                      style={{
                        borderRadius: 14,
                        background: stat.bg,
                        boxShadow: "inset 0 0 0 1px rgba(15, 23, 42, 0.08)",
                      }}
                      bodyStyle={{ padding: "12px 12px 10px" }}
                    >
                      <Statistic
                        title={<span style={{ color: "#334155", fontSize: 12, fontWeight: 600 }}>{stat.title}</span>}
                        value={stat.value}
                        suffix={stat.suffix ? <span style={{ fontSize: 11, color: "#64748b" }}>{stat.suffix}</span> : undefined}
                        prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
                        valueStyle={{ color: stat.color, fontWeight: 800, fontSize: 24 }}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Tag color="processing">Nhân viên: {user.hoTen || "--"}</Tag>
              <Tag color="default">Email: {user.email || "--"}</Tag>
            </div>

            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <ProfileAvatarCard
                  user={user}
                  avatarPreview={avatarPreview}
                  isEditing={isEditing}
                  onAvatarChange={handleAvatarChange}
                />
              </Col>

              <Col xs={24} md={16}>
                <ProfileInfoForm
                  form={profileForm}
                  user={user}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  onFinish={handleProfileUpdate}
                  loading={submitLoading}
                  onCancel={() => {
                    setIsEditing(false);
                    setAvatarFile(null);
                    fetchProfile();
                  }}
                />

                <PasswordForm form={passwordForm} onFinish={handlePasswordUpdate} />
              </Col>
            </Row>
          </Space>
        ) : null}
      </Spin>
    </AdminPage>
  );
}
