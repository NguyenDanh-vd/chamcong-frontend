import { Button, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select, Space, Typography, Upload } from "antd";
import { UploadOutlined, CameraOutlined, LockOutlined } from "@ant-design/icons";

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

const { Text } = Typography;

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
      title={editingEmployee ? "Cập nhật nhân viên" : "Tạo nhân viên mới"}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      destroyOnClose
      width={860}
      afterClose={() => form.resetFields()}
      okText={editingEmployee ? "Lưu thay đổi" : "Tạo nhân viên"}
      cancelText="Hủy bỏ"
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
      <Form form={form} layout="vertical">
        <Text strong style={{ color: "#0f172a" }}>
          Thong tin co ban
        </Text>

        <Row gutter={16} style={{ marginTop: 10 }}>
          <Col xs={24} md={12}>
            <Form.Item name="hoTen" label="Ho ten" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
              <Input placeholder="Nguyen Van A" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="soDienThoai"
              label="So dien thoai"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                { pattern: /^(0|\+84)\d{9,10}$/, message: "Số điện thoại không hợp lệ" },
              ]}
            >
              <Input placeholder="09xxxxxxxx" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Định dạng email không hợp lệ" },
              ]}
            >
              <Input placeholder="name@company.com" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="cccd" label="CCCD" rules={[{ required: true, message: "Vui lòng nhập CCCD" }, { pattern: /^\d{9,12}$/, message: "CCCD phải có 9-12 chữ số" }]}>
              <Input placeholder="012345678901" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item name="gioiTinh" label="Gioi tinh" rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}>
              <Select placeholder="Chọn giới tính">
                <Select.Option value="Nam">Nam</Select.Option>
                <Select.Option value="Nu">Nu</Select.Option>
                <Select.Option value="Khac">Khac</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="tuoi" label="Tuoi" rules={[{ required: true, message: "Vui lòng nhập tuổi" }]}>
              <InputNumber min={18} max={100} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="ngayBatDau" label="Ngay bat dau" rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}>
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="diaChi" label="Địa chỉ">
          <Input.TextArea rows={3} placeholder="Nhập địa chỉ liên hệ" />
        </Form.Item>

        <Text strong style={{ color: "#0f172a" }}>
          Phan quyen va phong ban
        </Text>

        <Row gutter={16} style={{ marginTop: 10 }}>
          <Col xs={24} md={12}>
            <Form.Item name="vaiTro" label="Vai tro" rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}>
              <Select placeholder="Chọn vai trò">
                <Select.Option value="nhanvien">Nhan vien</Select.Option>
                <Select.Option value="nhansu">Nhan su</Select.Option>
                <Select.Option value="quantrivien">Quan tri vien</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="maPB" label="Phong ban" rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}>
              <Select
                placeholder="Chon phong ban"
                allowClear
                options={departments.map((pb: any) => ({ value: String(pb.maPB), label: pb.tenPhong }))}
              />
            </Form.Item>
          </Col>
        </Row>

        {!editingEmployee ? (
          <Form.Item
            name="matKhau"
            label="Mat khau"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu" },
              { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu khởi tạo" />
          </Form.Item>
        ) : (
          <>
            <Text strong style={{ color: "#0f172a" }}>
              Doi mat khau (tuy chon)
            </Text>
            <Row gutter={16} style={{ marginTop: 10 }}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="newPassword"
                  label="Mat khau moi"
                  rules={[{ min: 6, message: "Mật khẩu tối thiểu 6 ký tự" }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Bỏ trong nếu không đổi" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="confirm"
                  label="Xac nhan mat khau"
                  dependencies={["newPassword"]}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const newPassword = getFieldValue("newPassword");
                        if (!newPassword && !value) return Promise.resolve();
                        if (!value) return Promise.reject(new Error("Vui lòng xác nhận mật khẩu mới"));
                        if (newPassword === value) return Promise.resolve();
                        return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        <Text strong style={{ color: "#0f172a" }}>
          Ảnh đại diện
        </Text>
        <Row gutter={12} style={{ marginTop: 10 }}>
          <Col xs={24} md={16}>
            <Upload
              listType="picture"
              maxCount={1}
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: nextFileList }) => setFileList(nextFileList)}
            >
              <Button icon={<UploadOutlined />} style={{ borderRadius: 10 }}>
                Chọn ảnh từ máy
              </Button>
            </Upload>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <Button icon={<CameraOutlined />} onClick={onOpenCamera} style={{ borderRadius: 10 }}>
                Chụp bằng webcam
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
