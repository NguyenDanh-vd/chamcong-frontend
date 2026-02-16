import { Card, Form, Input, Typography } from "antd";
import CustomButton from "@/components/CustomButton";

interface PasswordFormProps {
  form: any;
  onFinish: (values: any) => void;
}

const { Text } = Typography;

export default function PasswordForm({ form, onFinish }: PasswordFormProps) {
  return (
    <Card
      bordered={false}
      title="Đổi mật khẩu"
      style={{ marginTop: 24, borderRadius: 16, boxShadow: "0 12px 24px rgba(15,23,42,.06)" }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Text type="secondary">Sử dụng mật khẩu mạnh gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</Text>

        <Form.Item
          name="oldPassword"
          label="Mật khẩu cũ"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ" }]}
          style={{ marginTop: 12 }}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[{ required: true, min: 6, message: "Mật khẩu phải từ 6 ký tự" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          dependencies={["newPassword"]}
          hasFeedback
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
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
  );
}
