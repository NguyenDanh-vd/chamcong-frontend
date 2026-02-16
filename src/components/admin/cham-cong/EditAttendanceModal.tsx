import { Form, Modal, Select, TimePicker, Typography } from "antd";

const STATUS_MAP: Record<string, string> = {
  "chua-xac-nhan": "Chưa xác nhận",
  "hop-le": "Hợp lệ",
  "di-tre": "Đi trễ",
  "ve-som": "Về sớm",
  "tre-va-ve-som": "Trễ và về sớm",
  "da-checkout": "Đã check-out",
  "dang-lam-viec": "Đang làm việc",
};

interface EditAttendanceModalProps {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  form: any;
}

const { Text } = Typography;

export default function EditAttendanceModal({ open, onCancel, onFinish, form }: EditAttendanceModalProps) {
  return (
    <Modal
      title="Chỉnh sửa chấm công"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      destroyOnClose
      afterClose={() => form.resetFields()}
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
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Text strong style={{ color: "#0f172a" }}>
          Cập nhật thông tin
        </Text>

        <Form.Item name="gioVao" label="Giờ vào" style={{ marginTop: 10 }}>
          <TimePicker format="HH:mm:ss" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="gioRa" label="Giờ ra">
          <TimePicker format="HH:mm:ss" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="trangThai"
          label="Trạng thái"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select
            placeholder="Chọn trạng thái"
            options={Object.entries(STATUS_MAP).map(([key, value]) => ({ value: key, label: value }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
