//Chứa Form đổi mật khẩu.

import { Card, Form, Input } from "antd";
import CustomButton from "@/components/CustomButton";

interface PasswordFormProps {
  form: any;
  onFinish: (values: any) => void;
}

export default function PasswordForm({ form, onFinish }: PasswordFormProps) {
  return (
    <Card title="Đổi mật khẩu" style={{ marginTop: 24 }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="oldPassword"
          label="Mật khẩu cũ"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ" }]}
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
            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu không khớp!"));
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