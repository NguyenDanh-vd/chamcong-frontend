//Modal chứa Form chỉnh sửa.

import { Modal, Form, InputNumber, Select } from "antd";

interface EditSalaryModalProps {
  editing: any;
  onCancel: () => void;
  onUpdate: () => void;
  form: any;
}

export default function EditSalaryModal({
  editing,
  onCancel,
  onUpdate,
  form,
}: EditSalaryModalProps) {
  return (
    <Modal
      title="Chỉnh sửa lương"
      open={!!editing}
      onCancel={onCancel}
      onOk={onUpdate}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Lương cơ bản" name="luongCoBan">
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