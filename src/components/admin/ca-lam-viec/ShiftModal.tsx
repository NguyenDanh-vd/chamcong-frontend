import { Button, Form, FormInstance, Input, Modal, TimePicker, Typography } from "antd";

interface ShiftModalProps {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  loading: boolean;
  form: FormInstance;
  isEdit: boolean;
}

const { Text } = Typography;

export default function ShiftModal({
  open,
  onCancel,
  onFinish,
  loading,
  form,
  isEdit,
}: ShiftModalProps) {
  return (
    <Modal
      title={isEdit ? "Chỉnh sửa ca làm việc" : "Thêm ca làm việc mới"}
      open={open}
      onCancel={onCancel}
      destroyOnClose
      okText={isEdit ? "Lưu thay đổi" : "Tạo ca làm"}
      cancelText="Hủy"
      onOk={() => form.submit()}
      confirmLoading={loading}
      okButtonProps={{
        style: {
          background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
          border: "none",
          borderRadius: 10,
          fontWeight: 700,
        },
      }}
      cancelButtonProps={{
        style: {
          borderRadius: 10,
        },
      }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Text strong style={{ color: "#0f172a" }}>
          Thông tin ca làm
        </Text>

        <Form.Item
          name="tenCa"
          label="Tên ca"
          rules={[
            { required: true, message: "Vui lòng nhập tên ca" },
            { min: 2, message: "Tên ca phải có ít nhất 2 ký tự" },
          ]}
          style={{ marginTop: 10 }}
        >
          <Input placeholder="Ví dụ: Ca hành chính" />
        </Form.Item>

        <Form.Item
          name="gioBatDau"
          label="Giờ bắt đầu"
          rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu" }]}
        >
          <TimePicker style={{ width: "100%" }} format="HH:mm:ss" />
        </Form.Item>

        <Form.Item
          name="gioKetThuc"
          label="Giờ kết thúc"
          dependencies={["gioBatDau"]}
          rules={[
            { required: true, message: "Vui lòng chọn giờ kết thúc" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const start = getFieldValue("gioBatDau");
                if (!start || !value) return Promise.resolve();
                if (value.isAfter(start)) return Promise.resolve();
                return Promise.reject(new Error("Giờ kết thúc phải lớn hơn giờ bắt đầu"));
              },
            }),
          ]}
        >
          <TimePicker style={{ width: "100%" }} format="HH:mm:ss" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
