import { Card, Col, DatePicker, Descriptions, Form, Input, InputNumber, Row, Select, Space, Tag, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";
import CustomButton from "@/components/CustomButton";
import dayjs from "dayjs";

interface ProfileInfoFormProps {
  form: any;
  user: any;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  onFinish: (values: any) => void;
  loading: boolean;
  onCancel: () => void;
}

const { Text } = Typography;

export default function ProfileInfoForm({
  form,
  user,
  isEditing,
  setIsEditing,
  onFinish,
  loading,
  onCancel,
}: ProfileInfoFormProps) {
  const roleLabel = user?.vaiTro || user?.role || "--";

  return (
    <Card
      bordered={false}
      style={{ borderRadius: 16, boxShadow: "0 12px 24px rgba(15,23,42,.06)" }}
      title="Thông tin chi tiết"
      extra={
        !isEditing ? (
          <CustomButton type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
            Chỉnh sửa
          </CustomButton>
        ) : null
      }
    >
      {isEditing ? (
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={user}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="hoTen" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="soDienThoai" label="Số điện thoại">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="gioiTinh" label="Giới tính">
                <Select placeholder="Chọn giới tính">
                  <Select.Option value="Nam">Nam</Select.Option>
                  <Select.Option value="Nữ">Nữ</Select.Option>
                  <Select.Option value="Khác">Khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="tuoi" label="Tuổi">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="cccd" label="CCCD">
            <Input readOnly style={{ background: "#f8fafc" }} />
          </Form.Item>

          <Form.Item name="diaChi" label="Địa chỉ">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="ngayBatDau" label="Ngày bắt đầu làm việc">
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} disabled />
          </Form.Item>

          <Form.Item>
            <Space>
              <CustomButton type="primary" htmlType="submit" loading={loading}>
                Lưu thay đổi
              </CustomButton>
              <CustomButton danger onClick={onCancel}>
                Hủy
              </CustomButton>
            </Space>
          </Form.Item>
        </Form>
      ) : (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Descriptions column={1} bordered size="small" labelStyle={{ width: 170, fontWeight: 600 }}>
            <Descriptions.Item label="Họ và tên">{user.hoTen}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{user.soDienThoai || "Chưa cập nhật"}</Descriptions.Item>
            <Descriptions.Item label="Giới tính">{user.gioiTinh || "Chưa cập nhật"}</Descriptions.Item>
            <Descriptions.Item label="Tuổi">{user.tuoi || "Chưa cập nhật"}</Descriptions.Item>
            <Descriptions.Item label="CCCD">{user.cccd || "Chưa cập nhật"}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{user.diaChi || "Chưa cập nhật"}</Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">
              {user.ngayBatDau ? dayjs(user.ngayBatDau).format("DD/MM/YYYY") : "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              <Tag color="processing">{roleLabel}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Phòng ban">{user.phongBan?.tenPhong || "Chưa có"}</Descriptions.Item>
          </Descriptions>

          <Text type="secondary">Mẹo: Chuyển sang chế độ chỉnh sửa để cập nhật nhanh thông tin cá nhân.</Text>
        </Space>
      )}
    </Card>
  );
}
