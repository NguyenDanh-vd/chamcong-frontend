import { Form, InputNumber, Modal, Select, Typography } from "antd";

interface EditSalaryModalProps {
  editing: any;
  onCancel: () => void;
  onUpdate: () => void;
  form: any;
}

const { Text } = Typography;

export default function EditSalaryModal({ editing, onCancel, onUpdate, form }: EditSalaryModalProps) {
  return (
    <Modal
      title="Chỉnh sửa lương"
      open={!!editing}
      onCancel={onCancel}
      onOk={onUpdate}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      destroyOnClose
      okButtonProps={{
        style: {
          background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
          border: "none",
          borderRadius: 10,
          fontWeight: 700,
        },
      }}
      cancelButtonProps={{ style: { borderRadius: 10 } }}
    >
      <Form form={form} layout="vertical">
        <Text strong style={{ color: "#0f172a" }}>
          Cập nhật thông tin lương
        </Text>

        <Form.Item label="Lương cơ bản" name="luongCoBan" style={{ marginTop: 10 }}>
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item label="Thưởng" name="thuong">
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item label="Phạt" name="phat">
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item label="Làm thêm" name="lamThem">
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item label="Trạng thái" name="trangThai">
          <Select
            options={[
              { label: "Chưa trả", value: "chua-tra" },
              { label: "Đã trả", value: "da-tra" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
