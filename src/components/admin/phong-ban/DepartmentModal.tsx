//Chứa Modal Form để Thêm mới hoặc Chỉnh sửa.

import { Modal, Form, Input, Button } from "antd";

interface DepartmentModalProps {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  loading: boolean;
  form: any;
  editingRecord: any;
}

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
      footer={[
        <Button
          key="back"
          onClick={onCancel}
          style={{
            background: "linear-gradient(135deg, #dc2052ff, #b54242ff)",
            color: "#fff",
            border: "none",
            fontWeight: 600,
            borderRadius: "8px",
            padding: "8px 20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
        >
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
          style={{
            background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
            color: "#fff",
            border: "none",
            fontWeight: 600,
            borderRadius: "8px",
            padding: "8px 20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
        >
          Lưu
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="tenPhong"
          label="Tên phòng ban"
          rules={[{ required: true, message: "Vui lòng nhập tên phòng ban!" }]}
        >
          <Input placeholder="Ví dụ: Phòng Kỹ thuật" />
        </Form.Item>
        <Form.Item name="moTa" label="Mô tả">
          <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết (không bắt buộc)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}