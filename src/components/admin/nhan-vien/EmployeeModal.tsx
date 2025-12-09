//Form Modal để thêm/sửa nhân viên.

import { Modal, Form, Row, Col, Input, Select, InputNumber, DatePicker, Upload, Button } from "antd";
import { UploadOutlined, CameraOutlined } from "@ant-design/icons";

interface EmployeeModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
  form: any;
  editingEmployee: any;
  departments: any[];
  fileList: any[];
  setFileList: (fileList: any[]) => void;
  onOpenCamera: () => void;
}

export default function EmployeeModal({
  open,
  onCancel,
  onOk,
  form,
  editingEmployee,
  departments,
  fileList,
  setFileList,
  onOpenCamera,
}: EmployeeModalProps) {
  return (
    <Modal
      title={editingEmployee ? "Sửa nhân viên" : "Thêm nhân viên"}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      afterClose={() => form.resetFields()}
      okText="Lưu"
      cancelText="Hủy"
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
      }}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="hoTen" label="Họ tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="soDienThoai" label="Số điện thoại" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="gioiTinh" label="Giới tính" rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}>
              <Select placeholder="Chọn giới tính">
                <Select.Option value="Nam">Nam</Select.Option>
                <Select.Option value="Nữ">Nữ</Select.Option>
                <Select.Option value="Khác">Khác</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="tuoi" label="Tuổi" rules={[{ required: true, message: "Vui lòng nhập tuổi" }]}>
              <InputNumber min={18} max={100} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="email" label="Email" rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Định dạng email không hợp lệ" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="diaChi" label="Địa chỉ">
          <Input.TextArea rows={3} placeholder="Nhập địa chỉ của nhân viên" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="cccd" label="CCCD" rules={[{ required: true, message: "Vui lòng nhập số CCCD" }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="ngayBatDau" label="Ngày bắt đầu làm" rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}>
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>
        {!editingEmployee && (
          <Form.Item name="matKhau" label="Mật khẩu" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}>
            <Input.Password />
          </Form.Item>
        )}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="vaiTro" label="Vai trò" rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}>
              <Select placeholder="Chọn vai trò">
                <Select.Option value="nhanvien">Nhân viên</Select.Option>
                <Select.Option value="nhansu">Nhân sự</Select.Option>
                <Select.Option value="quantrivien">Quản trị viên</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="maPB" label="Phòng ban" rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}>
              <Select placeholder="Chọn phòng ban" allowClear options={departments.map((pb: any) => ({ value: pb.maPB, label: pb.tenPhong }))} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Avatar">
          <Upload listType="picture" fileList={fileList} beforeUpload={() => false} onChange={({ fileList }) => setFileList(fileList)}>
            <Button icon={<UploadOutlined />} style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)", color: "#fff", border: "none", borderRadius: "8px" }}>Chọn ảnh</Button>
          </Upload>
          <Button icon={<CameraOutlined />} onClick={onOpenCamera} style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)", color: "#fff", border: "none", borderRadius: "8px", marginLeft: 8 }}>Chụp ảnh</Button>
        </Form.Item>
        {editingEmployee && (
          <>
            <Form.Item name="newPassword" label="Mật khẩu mới (Bỏ trống nếu không đổi)" rules={[{ min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }]} hasFeedback>
              <Input.Password placeholder="Nhập mật khẩu mới" />
            </Form.Item>
            <Form.Item name="confirm" label="Xác nhận mật khẩu mới" dependencies={["newPassword"]} hasFeedback rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu!" }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue("newPassword") === value) { return Promise.resolve(); } return Promise.reject(new Error("Hai mật khẩu không khớp!")); }, })]}>
              <Input.Password placeholder="Nhập lại mật khẩu mới" />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}