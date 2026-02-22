import React, { useState } from "react";
import { Card, Descriptions, Modal, Popconfirm, Space, Switch, Table, Tag, Tooltip, Typography } from "antd";
import { ClockCircleOutlined, DeleteOutlined, EditOutlined, InfoCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import CustomButton from "@/components/CustomButton";

export interface Shift {
  maCa: number;
  tenCa: string;
  gioBatDau: string;
  gioKetThuc: string;
  trangThai: boolean;
}

interface ShiftTableProps {
  shifts: Shift[];
  loading: boolean;
  onEdit: (record: Shift) => void;
  onDelete: (maCa: number) => void;
  onStatusChange: (checked: boolean, record: Shift) => void;
}

const { Text } = Typography;

export default function ShiftTable({
  shifts,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
}: ShiftTableProps) {
  const [detailShift, setDetailShift] = useState<Shift | null>(null);

  const columns: ColumnsType<Shift> = [
    { title: "Mã ca", dataIndex: "maCa", key: "maCa", width: 100, render: (value: number) => <Text strong>{value}</Text> },
    {
      title: "Tên ca",
      dataIndex: "tenCa",
      key: "tenCa",
      render: (name: string) => (
        <Space>
          <ClockCircleOutlined style={{ color: "#0b5ed7" }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    { title: "Giờ bắt đầu", dataIndex: "gioBatDau", key: "gioBatDau", width: 130 },
    { title: "Giờ kết thúc", dataIndex: "gioKetThuc", key: "gioKetThuc", width: 130 },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      width: 180,
      render: (value: boolean, record: Shift) => (
        <Space direction="vertical" size={6} align="center">
          <Tag color={value ? "success" : "default"} style={{ borderRadius: 999, paddingInline: 10 }}>
            {value ? "Đang hoạt động" : "Ngưng hoạt động"}
          </Tag>
          <Switch
            checked={value}
            checkedChildren="Bật"
            unCheckedChildren="Tắt"
            onChange={(checked) => onStatusChange(checked, record)}
          />
        </Space>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 170,
      render: (_: unknown, record: Shift) => (
        <Space size="middle">
          <Tooltip title="Thông tin chi tiết">
            <CustomButton type="primary" icon={<InfoCircleOutlined />} onClick={() => setDetailShift(record)} />
          </Tooltip>

          <Tooltip title="Sửa">
            <CustomButton type="primary" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          </Tooltip>

          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa ca làm việc"
              description="Bạn có chắc muốn xóa ca làm này?"
              onConfirm={() => onDelete(record.maCa)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <CustomButton type="primary" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        className="shift-table-card"
        bordered={false}
        style={{ borderRadius: 18, boxShadow: "0 14px 28px rgba(15, 42, 96, 0.1)" }}
        bodyStyle={{ padding: 0, overflow: "hidden" }}
      >
        <Table
          className="shift-table"
          columns={columns}
          dataSource={shifts}
          rowKey="maCa"
          loading={loading}
          scroll={{ x: 980 }}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: ["8", "12", "20"],
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} ca làm`,
          }}
          locale={{
            emptyText: "Không có dữ liệu ca làm phù hợp",
          }}
        />
      </Card>

      <Modal
        open={!!detailShift}
        title="Thông tin chi tiết ca làm"
        onCancel={() => setDetailShift(null)}
        footer={null}
        width={620}
        centered
      >
        {detailShift ? (
          <Descriptions
            size="middle"
            bordered
            column={1}
            items={[
              { key: "1", label: "Mã ca", children: detailShift.maCa },
              { key: "2", label: "Tên ca", children: detailShift.tenCa || "-" },
              { key: "3", label: "Giờ bắt đầu", children: detailShift.gioBatDau || "-" },
              { key: "4", label: "Giờ kết thúc", children: detailShift.gioKetThuc || "-" },
              {
                key: "5",
                label: "Trạng thái",
                children: (
                  <Tag color={detailShift.trangThai ? "success" : "default"} style={{ borderRadius: 999, paddingInline: 10 }}>
                    {detailShift.trangThai ? "Đang hoạt động" : "Ngưng hoạt động"}
                  </Tag>
                ),
              },
            ]}
            labelStyle={{ width: 150, color: "#64748b", fontWeight: 600 }}
          />
        ) : null}
      </Modal>

      <style jsx global>{`
        .shift-table-card {
          border: 1px solid #dbeafe;
        }
        .shift-table .ant-table-thead > tr > th {
          background: linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%) !important;
          color: #0f172a !important;
          font-weight: 700;
          border-bottom: 1px solid #dbeafe !important;
        }
        .shift-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #eff6ff !important;
        }
        .shift-table .ant-table-tbody > tr:hover > td {
          background: #f7fcff !important;
        }
        .shift-table .ant-pagination .ant-pagination-item-active {
          border-color: #0ea5e9;
        }
        .shift-table .ant-pagination .ant-pagination-item-active a {
          color: #0284c7;
        }
      `}</style>
    </>
  );
}
