import React, { useState } from "react";
import { Avatar, Button, Descriptions, Modal, Popconfirm, Space, Table, Tag, Tooltip, Typography } from "antd";
import {
  UserOutlined,
  InfoCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { getRole } from "./employee.utils";

interface EmployeeTableProps {
  loading: boolean;
  dataSource: any[];
  selectedRowKeys: React.Key[];
  onSelectChange: (keys: React.Key[]) => void;
  onEdit: (record: any) => void;
  onDelete: (code: string) => void;
}

const { Text } = Typography;

export default function EmployeeTable({
  loading,
  dataSource,
  selectedRowKeys,
  onSelectChange,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  const [detailEmployee, setDetailEmployee] = useState<any | null>(null);

  const columns: ColumnsType<any> = [
    {
      title: "Mã NV",
      dataIndex: "code",
      key: "code",
      width: 110,
      render: (code: string) => <Text strong>{code}</Text>,
    },
    {
      title: "Nhân viên",
      dataIndex: "name",
      key: "name",
      width: 260,
      render: (_: string, record: any) => (
        <Space size={10}>
          <Avatar src={record.avatar} icon={!record.avatar ? <UserOutlined /> : undefined} />
          <div>
            <div style={{ fontWeight: 600, color: "#0f172a" }}>{record.name || "-"}</div>
            <Space size={6}>
              <MailOutlined style={{ color: "#64748b" }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.email || "Chưa có email"}
              </Text>
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: "Liên hệ",
      dataIndex: "soDienThoai",
      key: "soDienThoai",
      width: 150,
      render: (phone: string) => (
        <Space size={6}>
          <PhoneOutlined style={{ color: "#475569" }} />
          <span>{phone || "-"}</span>
        </Space>
      ),
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
      width: 170,
      render: (department: string) => <Tag color="geekblue">{department || "Chưa phân phòng"}</Tag>,
    },
    { title: "Ngày bắt đầu", dataIndex: "ngayBatDauLam", key: "ngayBatDauLam", width: 140 },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 130,
      render: (role: string) => {
        const roleInfo = getRole(role);
        return <Tag color={roleInfo.color}>{roleInfo.label}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      fixed: "right",
      width: 150,
      render: (_: any, record: any) => {
        return (
          <Space size={2}>
            <Tooltip title="Thông tin chi tiết">
              <Button
                type="text"
                icon={<InfoCircleOutlined />}
                style={{ color: "#0f766e" }}
                onClick={() => setDetailEmployee(record)}
              />
            </Tooltip>

            <Tooltip title="Sửa thông tin">
              <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(record)} style={{ color: "#1d4ed8" }} />
            </Tooltip>

            <Tooltip title="Xóa nhân viên">
              <Popconfirm
                title="Bạn có chắc muốn xóa nhân viên này?"
                onConfirm={() => onDelete(record.code)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectChange,
        }}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey="code"
        bordered={false}
        scroll={{ x: 1080 }}
        pagination={{
          pageSize: 8,
          showSizeChanger: true,
          pageSizeOptions: ["8", "12", "20", "30"],
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} nhân viên`,
        }}
        locale={{
          emptyText: "Không có dữ liệu nhân viên phù hợp với bộ lọc hiện tại",
        }}
      />

      <Modal
        open={!!detailEmployee}
        title="Thông tin chi tiết nhân viên"
        onCancel={() => setDetailEmployee(null)}
        footer={null}
        width={680}
        centered
        styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
      >
        {detailEmployee ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <Avatar size={72} src={detailEmployee.avatar} icon={!detailEmployee.avatar ? <UserOutlined /> : undefined} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{detailEmployee.name || "-"}</div>
                <Tag color={getRole(detailEmployee.role).color} style={{ marginTop: 4 }}>
                  {getRole(detailEmployee.role).label}
                </Tag>
              </div>
            </div>

            <Descriptions
              size="middle"
              bordered
              column={1}
              items={[
                { key: "1", label: "Mã nhân viên", children: detailEmployee.code || "-" },
                { key: "2", label: "Email", children: detailEmployee.email || "Chưa có" },
                { key: "3", label: "Số điện thoại", children: detailEmployee.soDienThoai || "Chưa có" },
                { key: "4", label: "Phòng ban", children: detailEmployee.department || "Chưa phân phòng" },
                { key: "5", label: "CCCD", children: detailEmployee.cccd || "Chưa có" },
                { key: "6", label: "Giới tính", children: detailEmployee.gioiTinh || "Không rõ" },
                { key: "7", label: "Tuổi", children: detailEmployee.tuoi || "Chưa có" },
                { key: "8", label: "Ngày bắt đầu", children: detailEmployee.ngayBatDauLam || "-" },
                {
                  key: "9",
                  label: "Địa chỉ",
                  children: (
                    <div style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-word" }}>
                      {detailEmployee.diaChi || "Chưa có"}
                    </div>
                  ),
                },
              ]}
              labelStyle={{ width: 150, color: "#64748b", fontWeight: 600 }}
            />
          </>
        ) : null}
      </Modal>
    </>
  );
}
