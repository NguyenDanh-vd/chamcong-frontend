//Đây là nơi chứa Avatar và Nút cài đặt Face ID bạn cần thêm.

import { Card, Avatar, Upload, Button } from "antd";
import { UserOutlined, UploadOutlined, ScanOutlined } from "@ant-design/icons";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "next/navigation";

interface ProfileAvatarCardProps {
  user: any;
  avatarPreview: string;
  isEditing: boolean;
  onAvatarChange: (info: any) => void;
}

export default function ProfileAvatarCard({
  user,
  avatarPreview,
  isEditing,
  onAvatarChange,
}: ProfileAvatarCardProps) {
  const router = useRouter();

  return (
    <Card>
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <Avatar
          size={150}
          src={avatarPreview || <UserOutlined />}
          style={{ border: "4px solid #f0f2f5" }}
        />
        <h2 style={{ marginTop: 20, fontSize: "1.5rem", fontWeight: 700 }}>
          {user.hoTen}
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
          {user.email}
        </p>

        {/* 👇 4. NÚT CÀI ĐẶT FACE ID (ĐÃ THÊM) */}
        <CustomButton
          onClick={() => router.push("/employee/register-face")}
          icon={<ScanOutlined />}
          style={{
            width: "100%",
            marginBottom: 16,
            backgroundColor: "#f0f5ff",
            color: "#2f54eb",
            borderColor: "#adc6ff",
            fontWeight: 600,
          }}
        >
          Cài đặt Face ID
        </CustomButton>

        {isEditing && (
          <Upload
            maxCount={1}
            customRequest={onAvatarChange}
            showUploadList={false}
            accept="image/*"
          >
            <CustomButton
              type="primary"
              icon={<UploadOutlined />}
              style={{ width: "100%" }}
            >
              Chọn ảnh đại diện mới
            </CustomButton>
          </Upload>
        )}
      </div>
    </Card>
  );
}