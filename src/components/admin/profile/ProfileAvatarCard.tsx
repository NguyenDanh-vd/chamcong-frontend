import { Avatar, Card, Divider, Upload, Typography } from "antd";
import { UserOutlined, UploadOutlined, ScanOutlined, MailOutlined } from "@ant-design/icons";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "next/navigation";

interface ProfileAvatarCardProps {
  user: any;
  avatarPreview: string;
  isEditing: boolean;
  onAvatarChange: (info: any) => void;
}

const { Text } = Typography;

export default function ProfileAvatarCard({
  user,
  avatarPreview,
  isEditing,
  onAvatarChange,
}: ProfileAvatarCardProps) {
  const router = useRouter();

  return (
    <Card
      bordered={false}
      style={{ borderRadius: 16, boxShadow: "0 12px 24px rgba(15,23,42,.06)" }}
      bodyStyle={{ padding: 20 }}
    >
      <div style={{ textAlign: "center" }}>
        <Avatar
          size={156}
          src={avatarPreview || undefined}
          icon={!avatarPreview ? <UserOutlined /> : undefined}
          style={{ border: "4px solid #e2e8f0", boxShadow: "0 10px 20px rgba(37,99,235,.15)" }}
        />

        <h2 style={{ marginTop: 18, fontSize: "1.3rem", fontWeight: 700, color: "#0f172a" }}>{user.hoTen}</h2>
        <Text type="secondary">
          <MailOutlined style={{ marginRight: 6 }} />
          {user.email}
        </Text>

        <Divider style={{ margin: "18px 0 14px" }} />

        <CustomButton
          onClick={() => router.push("/employee/register-face")}
          icon={<ScanOutlined />}
          style={{
            width: "100%",
            marginBottom: isEditing ? 12 : 0,
            backgroundColor: "#f0f9ff",
            color: "#0369a1",
            borderColor: "#bae6fd",
            fontWeight: 600,
            borderRadius: 10,
          }}
        >
          Cài đặt Face ID
        </CustomButton>

        {isEditing ? (
          <Upload maxCount={1} customRequest={onAvatarChange} showUploadList={false} accept="image/*">
            <CustomButton type="primary" icon={<UploadOutlined />} style={{ width: "100%", borderRadius: 10 }}>
              Chọn ảnh đại diện mới
            </CustomButton>
          </Upload>
        ) : null}
      </div>
    </Card>
  );
}
