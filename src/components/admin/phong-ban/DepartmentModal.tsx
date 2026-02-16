import { Button, Form, Input, Modal, Typography } from "antd";

interface DepartmentModalProps {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  loading: boolean;
  form: any;
  editingRecord: any;
}

const { Text } = Typography;

export default function DepartmentModal({
  open,
  onCancel,
  onFinish,
  loading,
  form,
  editingRecord,
}: DepartmentModalProps) {
  return (
    <Modal
      title={editingRecord ? `Chỉnh sửa phòng ban: ${editingRecord.tenPhong}` : "Thêm phòng ban mới"}
      open={open}
      onCancel={onCancel}
      afterClose={() => form.resetFields()}
      destroyOnClose
      okText={editingRecord ? "Lưu thay đổi" : "Tạo phòng ban"}
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
          Thông tin phòng ban
        </Text>

        <Form.Item
          name="tenPhong"
          label="Tên phòng ban"
          rules={[
            { required: true, message: "Vui lòng nhập tên phòng ban" },
            { min: 2, message: "Tên phòng ban phải có ít nhất 2 ký tự" },
          ]}
          style={{ marginTop: 10 }}
        >
          <Input placeholder="Ví dụ: Phòng Kỹ thuật" />
        </Form.Item>

        <Form.Item name="moTa" label="Mô tả">
          <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết cho phòng ban (không bắt buộc)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
