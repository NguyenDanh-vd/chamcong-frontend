//Chứa Form thông tin chi tiết (Họ tên, SĐT, CCCD...).

import { Card, Form, Input, Row, Col, Select, DatePicker, Descriptions, Space } from "antd";
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

export default function ProfileInfoForm({
  form,
  user,
  isEditing,
  setIsEditing,
  onFinish,
  loading,
  onCancel,
}: ProfileInfoFormProps) {
  return (
    <Card
      title="Thông tin chi tiết"
      extra={
        !isEditing && (
          <CustomButton
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setIsEditing(true)}
          >
            Chỉnh sửa
          </CustomButton>
        )
      }
    >
      {isEditing ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={user}
        >
          <Form.Item name="hoTen" label="Họ và Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="soDienThoai" label="Số điện thoại">
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gioiTinh" label="Giới tính">
                <Select placeholder="Chọn giới tính">
                  <Select.Option value="Nam">Nam</Select.Option>
                  <Select.Option value="Nữ">Nữ</Select.Option>
                  <Select.Option value="Khác">Khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tuoi" label="Tuổi">
                <Input type="number" placeholder="Nhập tuổi" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="cccd" label="CCCD">
            <Input readOnly className="bg-gray-50 text-gray-500" />
          </Form.Item>

          <Form.Item name="diaChi" label="Địa chỉ">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="ngayBatDau" label="Ngày bắt đầu làm việc">
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              disabled
              className="bg-gray-50"
            />
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
        <Descriptions column={1} bordered size="small" labelStyle={{ width: '150px', fontWeight: 600 }}>
          <Descriptions.Item label="Họ và Tên">{user.hoTen}</Descriptions.Item>
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
            <span className="capitalize">{user.role}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Phòng ban">
            {user.phongBan?.tenPhong || "Chưa có"}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
}