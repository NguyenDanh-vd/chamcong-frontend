//ile này chứa giao diện Modal nhập liệu (Thêm/Sửa).

import { Modal, Form, Input, TimePicker, Button, FormInstance } from "antd";

interface ShiftModalProps {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  loading: boolean;
  form: FormInstance;
  isEdit: boolean;
}

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
          name="tenCa"
          label="Tên ca"
          rules={[{ required: true, message: "Vui lòng nhập tên ca!" }]}
        >
          <Input placeholder="Ví dụ: Ca Hành chính" />
        </Form.Item>
        <Form.Item
          name="gioBatDau"
          label="Giờ bắt đầu"
          rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu!" }]}
        >
          <TimePicker style={{ width: "100%" }} format="HH:mm:ss" />
        </Form.Item>
        <Form.Item
          name="gioKetThuc"
          label="Giờ kết thúc"
          rules={[{ required: true, message: "Vui lòng chọn giờ kết thúc!" }]}
        >
          <TimePicker style={{ width: "100%" }} format="HH:mm:ss" />
        </Form.Item>
      </Form>
    </Modal>
  );
}