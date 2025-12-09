"use client";

import React, { useEffect, useState } from "react";
import AdminPage from "@/components/AdminPage";
import api from "@/utils/api";
import { App, Col, Form, Row, Spin } from "antd";
import dayjs from "dayjs";

// Import Components đã tách
import ProfileAvatarCard from "@/components/admin/profile/ProfileAvatarCard";
import ProfileInfoForm from "@/components/admin/profile/ProfileInfoForm";
import PasswordForm from "@/components/admin/profile/PasswordForm";

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
        ngayBatDau: values.ngayBatDau ? dayjs(values.ngayBatDau).format("DD/MM/YYYY") : null,
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
      const errMsg = err.response?.data?.message || "Đổi mật khẩu thất bại!";
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
              {/* Cột trái: Avatar + Nút FaceID */}
              <Col xs={24} md={8}>
                <ProfileAvatarCard 
                  user={user}
                  avatarPreview={avatarPreview}
                  isEditing={isEditing}
                  onAvatarChange={handleAvatarChange}
                />
              </Col>

              {/* Cột phải: Form thông tin + Đổi pass */}
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
                
                <PasswordForm 
                  form={passwordForm}
                  onFinish={handlePasswordUpdate}
                />
              </Col>
            </Row>
          )}
        </Spin>
      </App>
    </AdminPage>
  );
}