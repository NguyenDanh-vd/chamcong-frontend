//Chứa Modal và Form chỉnh sửa.

import { Modal, Form, TimePicker, Select } from "antd";
const { Option } = Select;

const STATUS_MAP: Record<string, string> = {
  "chua-xac-nhan": "Chưa xác nhận",
  "hop-le": "Hợp lệ",
  "di-tre": "Đi trễ",
  "ve-som": "Về sớm",
  "tre-va-ve-som": "Trễ và Về sớm",
  "da-checkout": "Đã check-out",
  "dang-lam-viec": "Đang làm việc",
};

interface EditAttendanceModalProps {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  form: any;
}

export default function EditAttendanceModal({
  open,
  onCancel,
  onFinish,
  form,
}: EditAttendanceModalProps) {
  return (
    <Modal
      title="Chỉnh sửa chấm công"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Lưu"
      cancelText="Hủy"
      afterClose={() => form.resetFields()}
      okButtonProps={{
        style: {
          background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
          color: "#fff",
          border: "none",
          fontWeight: 600,
          borderRadius: "8px",
          padding: "8px 20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease",
        },
        onMouseEnter: (e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
        },
        onMouseLeave: (e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = "1";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
        },
      }}
      cancelButtonProps={{
        style: {
          background: "linear-gradient(135deg, #dc2052ff, #b54242ff)",
          color: "#fff",
          border: "none",
          fontWeight: 600,
          borderRadius: "8px",
          padding: "8px 20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease",
        },
        onMouseEnter: (e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
        },
        onMouseLeave: (e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = "1";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
        },
      }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="gioVao" label="Giờ vào">
          <TimePicker format="HH:mm:ss" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="gioRa" label="Giờ ra">
          <TimePicker format="HH:mm:ss" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="trangThai"
          label="Trạng thái"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
        >
          <Select placeholder="Chọn trạng thái">
            {Object.entries(STATUS_MAP).map(([key, value]) => (
              <Option key={key} value={key}>
                {value}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}