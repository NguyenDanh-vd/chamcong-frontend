//Bảng hiển thị danh sách nhân viên.

import { Table, Avatar, Tag, Popover, Space, Tooltip, Popconfirm } from "antd";
import { UserOutlined, InfoCircleOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomButton from "@/components/CustomButton";
import { getRole } from "./employee.utils";

interface EmployeeTableProps {
  loading: boolean;
  dataSource: any[];
  selectedRowKeys: React.Key[];
  onSelectChange: (keys: React.Key[]) => void;
  onEdit: (record: any) => void;
  onDelete: (code: string) => void;
}

export default function EmployeeTable({
  loading,
  dataSource,
  selectedRowKeys,
  onSelectChange,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
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
    { title: "Số điện thoại", dataIndex: "soDienThoai", key: "soDienThoai" },
    { title: "Phòng ban", dataIndex: "department", key: "department" },
    { title: "Ngày bắt đầu", dataIndex: "ngayBatDauLam", key: "ngayBatDauLam" },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        const roleInfo = getRole(role);
        return <Tag color={roleInfo.color}>{roleInfo.label}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      align: "center" as const,
      width: 150,
      render: (_: any, record: any) => {
        const popoverContent = (
          <div style={{ width: 280 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
              <Avatar size={64} src={record.avatar} icon={<UserOutlined />} />
              <div style={{ marginLeft: 16 }}>
                <strong style={{ display: "block", fontSize: 16, lineHeight: "1.2" }}>{record.name}</strong>
                <Tag color={getRole(record.role).color} style={{ marginTop: 6 }}>
                  {getRole(record.role).label}
                </Tag>
              </div>
            </div>
            <p><strong><InfoCircleOutlined style={{ marginRight: 8 }} />Email:</strong> {record.email || "Chưa có"}</p>
            <p><strong><InfoCircleOutlined style={{ marginRight: 8 }} />SĐT:</strong> {record.soDienThoai || "Chưa có"}</p>
            <p><strong><InfoCircleOutlined style={{ marginRight: 8 }} />Phòng ban:</strong> {record.department || "Chưa có"}</p>
            <p><strong><InfoCircleOutlined style={{ marginRight: 8 }} />CCCD:</strong> {record.cccd || "Chưa có"}</p>
            <p><strong><InfoCircleOutlined style={{ marginRight: 8 }} />Giới tính:</strong> {record.gioiTinh || "Không rõ"}</p>
            <p><strong><InfoCircleOutlined style={{ marginRight: 8 }} />Tuổi:</strong> {record.tuoi || "Chưa có"}</p>
          </div>
        );

        return (
          <Space>
            <Popover content={popoverContent} title="Thông tin chi tiết nhân viên" trigger="click">
              <CustomButton type="primary" icon={<InfoCircleOutlined />}>Thông tin</CustomButton>
            </Popover>
            <Tooltip title="Sửa thông tin">
              <CustomButton type="primary" icon={<EditOutlined />} onClick={() => onEdit(record)} />
            </Tooltip>
            <Tooltip title="Xóa nhân viên">
              <Popconfirm
                title="Bạn có chắc muốn xóa nhân viên này?"
                onConfirm={() => onDelete(record.code)}
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
    <Table
      rowSelection={{
        selectedRowKeys,
        onChange: onSelectChange,
      }}
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      rowKey="code"
    />
  );
}