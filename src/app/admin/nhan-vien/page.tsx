"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Row,
  Col,
  Upload,
  Space,
  Tooltip,
  DatePicker,
  InputNumber,
  Popover,
  Avatar,
  Tag,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  EditOutlined,
  CameraOutlined,
  InfoCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Webcam from "react-webcam";
import dayjs from "dayjs";
import AdminPage from "@/components/AdminPage";
import CustomButton from "@/components/CustomButton";
import api from "@/utils/api";
import { API_URL } from "@/utils/config";


// Ánh xạ vai trò để hiển thị
const roleMap: Record<string, { label: string; color: string }> = {
  quantrivien: { label: "Quản trị viên", color: "red" },
  nhansu: { label: "Nhân sự", color: "gold" },
  nhanvien: { label: "Nhân viên", color: "blue" },
};

const getRole = (role: string | undefined) => {
  if (!role) return { label: "Chưa có vai trò", color: "default" };
  return roleMap[role.toLowerCase()] || { label: role, color: "default" };
};

export default function AdminNhanVien() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [fileList, setFileList] = useState<any[]>([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  // Lấy danh sách phòng ban
  const fetchDepartments = async () => {
    try {
      const res = await api.get("/phongban"); 
      setDepartments(res.data);
    } catch {
      message.error("Không thể tải danh sách phòng ban");
    }
  };

  // Lấy danh sách nhân viên
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/nhanvien", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mapped = res.data.map((nv: any) => ({
        key: nv.maNV,
        code: nv.maNV,
        name: nv.hoTen,
        email: nv.email,
        department: nv.phongBan ? nv.phongBan.tenPhong : "Chưa phân phòng",
        departmentId: nv.phongBan ? nv.phongBan.maPB : null,
        role: nv.vaiTro,
        soDienThoai: nv.soDienThoai,
        diaChi: nv.diaChi,
        cccd: nv.cccd,
        gioiTinh: nv.gioiTinh || "Không rõ",
        tuoi: nv.tuoi || null,
        ngayBatDauLam: nv.ngayBatDau ? dayjs(nv.ngayBatDau).format("DD/MM/YYYY") : "",
        ngayBatDau: nv.ngayBatDau,
        avatar: nv.avatar
        ? nv.avatar.startsWith("http")
        ? nv.avatar
        : nv.avatar.startsWith("/uploads")
        ? `${API_URL}${nv.avatar}`
        : `${API_URL}/uploads/avatars/${nv.avatar}`
         : null,
      }));

      setEmployees(mapped);
      setFilteredEmployees(mapped);
    } catch {
      message.error("Không thể tải danh sách nhân viên");
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchAll = async () => {
      await fetchDepartments();
      await fetchEmployees();
    };
    fetchAll();
  }, []);

  // Mở modal để thêm hoặc chỉnh sửa
  const openModal = (employee?: any) => {
    form.setFieldsValue({
      newPassword: "",
      confirm: "",
    });
    if (employee) {
      setEditingEmployee(employee);
      form.setFieldsValue({
        hoTen: employee.name,
        email: employee.email,
        vaiTro: employee.role,
        maPB: employee.departmentId,
        soDienThoai: employee.soDienThoai,
        gioiTinh: employee.gioiTinh || null,
        tuoi: employee.tuoi ? Number(employee.tuoi) : null,
        diaChi: employee.diaChi,
        cccd: employee.cccd,
        ngayBatDau: employee.ngayBatDau ? dayjs(employee.ngayBatDau) : null,
      });
      setFileList(
        employee.avatar
          ? [{ uid: "-1", name: "avatar.png", status: "done",  url: employee.avatar, }]
          : []
      );
    } else {
      setEditingEmployee(null);
      form.resetFields();
      setFileList([]);
    }
    setModalVisible(true);
  };

  // Lưu nhân viên (thêm hoặc sửa)
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem("token");

      if (editingEmployee) {
        // Cập nhật
        const textDataPayload = {
          hoTen: values.hoTen,
          email: values.email,
          vaiTro: values.vaiTro,
          maPB: values.maPB,
          soDienThoai: values.soDienThoai,
          gioiTinh: values.gioiTinh || null,
          tuoi: values.tuoi ? Number(values.tuoi) : null,
          diaChi: values.diaChi,
          cccd: values.cccd,
          ngayBatDau: values.ngayBatDau ? values.ngayBatDau.format("YYYY-MM-DD") : null,
        };

        await api.put(`/nhanvien/${editingEmployee.code}`, textDataPayload);

        const hasNewFile = fileList.length > 0 && fileList[0].originFileObj;
        if (hasNewFile) {
          const avatarFormData = new FormData();
          avatarFormData.append("avatar", fileList[0].originFileObj);
          await api.post(`/nhanvien/${editingEmployee.code}/avatar`, avatarFormData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });
        }

        if (values.newPassword) {
          await api.patch(
            `/nhanvien/${editingEmployee.code}/reset-password-admin`,
            { newPassword: values.newPassword },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        }

        message.success("Cập nhật nhân viên thành công");
      } else {
        const createPayload = {
          ...values,
          ngayBatDau: values.ngayBatDau ? values.ngayBatDau.format("YYYY-MM-DD") : null,
        };

        const response = await api.post("/nhanvien", createPayload);

        const newEmployee = response.data;
        const hasNewFile = fileList.length > 0 && fileList[0].originFileObj;
        if (hasNewFile && newEmployee && newEmployee.maNV) {
          const avatarFormData = new FormData();
          avatarFormData.append("avatar", fileList[0].originFileObj);
          await api.post(`/nhanvien/${newEmployee.maNV}/avatar`, avatarFormData);
        }

        message.success("Thêm nhân viên thành công");
      }

      setModalVisible(false);
      fetchEmployees();
    } catch (err: any) {
      console.error("Lỗi khi lưu nhân viên:", err);
      const errorMessage = err.response?.data?.message || "Lưu nhân viên thất bại";
      message.error(Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage);
    }
  };

  // Xóa một nhân viên
  const handleDelete = async (code: string) => {
    try {
      await api.delete(`/nhanvien/${code}`);
      message.success("Xóa nhân viên thành công");
      fetchEmployees();
    } catch {
      message.error("Xóa nhân viên thất bại");
    }
  };

  // Xóa hàng loạt nhân viên
  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một nhân viên để xóa");
      return;
    }
    try {
      await Promise.all(
        selectedRowKeys.map((id) =>
          api.delete(`/nhanvien/${id}`))
      );
      message.success("Đã xóa nhân viên đã chọn");
      setSelectedRowKeys([]);
      fetchEmployees();
    } catch {
      message.error("Xóa nhân viên thất bại");
    }
  };

  // Chức năng tìm kiếm
  const handleSearch = (value: string) => {
    setSearchText(value);
    if (!value) {
      setFilteredEmployees(employees);
    } else {
      const lowerValue = value.toLowerCase();
      const filtered = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(lowerValue) ||
          (emp.email && emp.email.toLowerCase().includes(lowerValue)) ||
          emp.department.toLowerCase().includes(lowerValue)
      );
      setFilteredEmployees(filtered);
    }
  };

  // Chụp ảnh từ webcam
  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const byteString = atob(imageSrc.split(",")[1]);
      const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const file = new File([blob], "avatar.jpg", { type: mimeString });
      setFileList([
        { uid: "-2", name: "avatar.jpg", status: "done", originFileObj: file, url: imageSrc },
      ]);
      setCameraVisible(false);
    }
  };

  const columns = [
    {
      title: "Mã NV",
      dataIndex: "code",
      key: "code",
      width: 100,
    },
    {
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {record.avatar ? (
            <Avatar src={record.avatar} style={{ marginRight: 8 }} />
          ) : (
            <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
          )}
          {text}
        </div>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "soDienThoai",
      key: "soDienThoai",
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "ngayBatDauLam",
      key: "ngayBatDauLam",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        const roleInfo = getRole(role);
        return <Tag color={roleInfo.color}>{roleInfo.label}</Tag>;
      }
    },
    {
      title: "Hành động",
      key: "action",
      align: "center" as const,
      width: 150,
      render: (_: any, record: any) => {
        const popoverContent = (
          <div style={{ width: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
              <Avatar size={64} src={record.avatar} icon={<UserOutlined />} />
              <div style={{ marginLeft: 16 }}>
                <strong style={{ display: 'block', fontSize: 16, lineHeight: '1.2' }}>{record.name}</strong>
                <Tag color={getRole(record.role).color} style={{ marginTop: 6 }}>
                  {getRole(record.role).label}
                </Tag>
              </div>
            </div>
            <p><strong><InfoCircleOutlined style={{marginRight: 8}}/>Email:</strong> {record.email || 'Chưa có'}</p>
            <p><strong><InfoCircleOutlined style={{marginRight: 8}}/>SĐT:</strong> {record.soDienThoai || 'Chưa có'}</p>
            <p><strong><InfoCircleOutlined style={{marginRight: 8}}/>Phòng ban:</strong> {record.department || 'Chưa có'}</p>
            <p><strong><InfoCircleOutlined style={{marginRight: 8}}/>CCCD:</strong> {record.cccd || 'Chưa có'}</p>
            <p><strong><InfoCircleOutlined style={{ marginRight: 8 }} />Giới tính:</strong>{" "}{record.gioiTinh || "Không rõ"}</p>
            <p><strong><InfoCircleOutlined style={{ marginRight: 8 }} />Tuổi:</strong>{" "}{record.tuoi || "Chưa có"}</p>
          </div>
        );
        
        
        return (
          <Space>
            <Popover content={popoverContent} title="Thông tin chi tiết nhân viên" trigger="click"
            >
              <CustomButton type="primary" icon={<InfoCircleOutlined />}>Thông tin</CustomButton>
            </Popover>
            <Tooltip title="Sửa thông tin">
            <CustomButton
              type="primary"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            />
            </Tooltip>
            <Tooltip title="Xóa nhân viên">
              <Popconfirm
                title="Bạn có chắc muốn xóa nhân viên này?"
                onConfirm={() => handleDelete(record.code)}
                okText="Xóa"
                cancelText="Hủy"
              >
                 <CustomButton type="primary" icon={<DeleteOutlined />} danger />
              </Popconfirm>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <AdminPage title="Quản lý nhân viên">
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        <Col flex="auto">
          <Input.Search
            placeholder="Tìm kiếm theo tên, email hoặc phòng ban"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
        </Col>
        <Col>
  <Button
    type="primary"
    icon={<PlusOutlined />}
    onClick={() => openModal()}
    style={{
      border: "none",
      borderRadius: "14px",
      padding: "12px 20px",
      fontWeight: 600,
      fontSize: "0.95rem",
      background: "linear-gradient(135deg, #34d399, #10b981)",
      color: "#fff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      transition: "all 0.3s ease",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.boxShadow =
        "0 6px 18px rgba(0,0,0,0.25)";
      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.boxShadow =
        "0 4px 12px rgba(0,0,0,0.15)";
      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
    }}
  >
    Thêm nhân viên
  </Button>
</Col>
        <Col>
  <Popconfirm
    title="Bạn có chắc muốn xóa những nhân viên đã chọn?"
    onConfirm={handleBulkDelete}
    okText="Xóa"
    cancelText="Hủy"
  >
    <Button
      type="primary"
      icon={<DeleteOutlined />}
      style={{
        border: "none",
        borderRadius: "14px",
        padding: "12px 20px",
        fontWeight: 600,
        fontSize: "0.95rem",
        background: "linear-gradient(135deg, #f87171, #ef4444)",
        color: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 6px 18px rgba(0,0,0,0.25)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 4px 12px rgba(0,0,0,0.15)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      Xóa đã chọn
    </Button>
  </Popconfirm>
</Col>

      </Row>

      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        columns={columns}
        dataSource={filteredEmployees}
        loading={loading}
        rowKey="code"
      />

      {/* Modal Thêm/Sửa */}
      <Modal
        title={editingEmployee ? "Sửa nhân viên" : "Thêm nhân viên"}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
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
        <Form form={form} layout="vertical">
          <Row gutter={16}>
          <Col span={12}>
          <Form.Item
            name="hoTen"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input />
          </Form.Item>
            </Col>
            <Col span={12}>
          <Form.Item
            name="soDienThoai"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input />
          </Form.Item>
          </Col>
          </Row>
          <Row gutter={16}>
          <Col span={12}>
              <Form.Item
                label="Giới tính"
                name="gioiTinh"
                rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
                <Select placeholder="Chọn giới tính">
                  <Select.Option value="Nam">Nam</Select.Option>
                  <Select.Option value="Nữ">Nữ</Select.Option>
                  <Select.Option value="Khác">Khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          <Col span={12}>
              <Form.Item
              label="Tuổi"
              name="tuoi"
                rules={[{ required: true, message: 'Vui lòng nhập tuổi' }]}>
                <InputNumber min={18} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Định dạng email không hợp lệ" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="diaChi" label="Địa chỉ">
            <Input.TextArea rows={3} placeholder="Nhập địa chỉ của nhân viên" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
          <Form.Item
            name="cccd"
            label="CCCD"
            rules={[{ required: true, message: "Vui lòng nhập số CCCD" }]}
          >
            <Input />
          </Form.Item>
          </Col>
            <Col span={12}>
          <Form.Item
            name="ngayBatDau"
            label="Ngày bắt đầu làm"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          </Col>
          </Row>
          {!editingEmployee && (
            <Form.Item
              name="matKhau"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={12}>
          <Form.Item
            name="vaiTro"
            label="Vai trò"
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Select placeholder="Chọn vai trò">
              <Select.Option value="nhanvien">Nhân viên</Select.Option>
              <Select.Option value="nhansu">Nhân sự</Select.Option>
              <Select.Option value="quantrivien">Quản trị viên</Select.Option>
            </Select>
          </Form.Item>
            </Col>
          <Col span={12}>
          <Form.Item
            name="maPB"
            label="Phòng ban"
            rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}
          >
            <Select
              placeholder="Chọn phòng ban"
              allowClear
              options={departments.map((pb: any) => ({
                value: pb.maPB,
                label: pb.tenPhong,
              }))}
            />
          </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Avatar">
            <Upload
              listType="picture"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              <Button icon={<UploadOutlined />}
              style={{
                background: "linear-gradient(135deg, #06b6d4, #3b82f6)", // giữ nguyên
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
                Chọn ảnh
              </Button>
            </Upload>
            <Button
              icon={<CameraOutlined />}
              onClick={() => setCameraVisible(true)}
              style={{
                background: "linear-gradient(135deg, #06b6d4, #3b82f6)", // giữ nguyên
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
              Chụp ảnh
            </Button>
          </Form.Item>
          {editingEmployee && (
            <>
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới (Bỏ trống nếu không đổi)"
                rules={[{ min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }]}
                hasFeedback
              >
                <Input.Password placeholder="Nhập mật khẩu mới" />
              </Form.Item>
              <Form.Item
                name="confirm"
                label="Xác nhận mật khẩu mới"
                dependencies={["newPassword"]}
                hasFeedback
                rules={[
                  ({ getFieldValue }) => ({
                    required: !!getFieldValue("newPassword"),
                    message: "Vui lòng xác nhận mật khẩu!",
                  }),
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Hai mật khẩu không khớp!"));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Nhập lại mật khẩu mới" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      {/* Modal Webcam */}
      <Modal
        title="Chụp ảnh"
        open={cameraVisible}
        onCancel={() => setCameraVisible(false)}
        footer={null}
      >
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width="100%"
          videoConstraints={{ facingMode: "user" }}
        />
        <Button type="primary" onClick={capturePhoto} block style={{ marginTop: 12 }}>
          Chụp & Lưu
        </Button>
      </Modal>
    </AdminPage>
  );
}
