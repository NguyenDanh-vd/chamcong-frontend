import React, { useState } from "react";
import { Card, Descriptions, Modal, Popconfirm, Space, Table, Tag, Tooltip, Typography } from "antd";
import { ApartmentOutlined, DeleteOutlined, EditOutlined, InfoCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import CustomButton from "@/components/CustomButton";

export interface Department {
  maPB: number;
  tenPhong: string;
  moTa?: string | null;
}

interface DepartmentTableProps {
  dataSource: Department[];
  loading: boolean;
  onEdit: (record: Department) => void;
  onDelete: (maPB: number) => void;
}

const { Text } = Typography;

export default function DepartmentTable({ dataSource, loading, onEdit, onDelete }: DepartmentTableProps) {
  const [detailDepartment, setDetailDepartment] = useState<Department | null>(null);

  const columns: ColumnsType<Department> = [
    {
      title: "Mã PB",
      dataIndex: "maPB",
      key: "maPB",
      width: 100,
      render: (value: number) => <Text strong>{value}</Text>,
    },
    {
      title: "Tên phòng ban",
      dataIndex: "tenPhong",
      key: "tenPhong",
      render: (name: string) => (
        <Space>
          <ApartmentOutlined style={{ color: "#0b5ed7" }} />
          <Text strong className="department-name">
            {name}
          </Text>
        </Space>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "moTa",
      key: "moTa",
      render: (desc?: string | null) =>
        desc && desc.trim() ? (
          <span className="department-desc">{desc}</span>
        ) : (
          <Tag style={{ borderRadius: 999, paddingInline: 10 }}>Chưa có mô tả</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 170,
      render: (_: unknown, record: Department) => (
        <Space size="middle">
          <Tooltip title="Thông tin chi tiết">
            <CustomButton
              type="primary"
              icon={<InfoCircleOutlined />}
              onClick={() => setDetailDepartment(record)}
            />
          </Tooltip>

          <Tooltip title="Sửa">
            <CustomButton type="primary" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          </Tooltip>

          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa phòng ban"
              description="Bạn có chắc muốn xóa phòng ban này?"
              onConfirm={() => onDelete(record.maPB)}
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
        className="department-table-card"
        bordered={false}
        style={{ borderRadius: 18, boxShadow: "0 14px 28px rgba(15, 42, 96, 0.1)" }}
        bodyStyle={{ padding: 0, overflow: "hidden" }}
      >
        <Table
          className="department-table"
          columns={columns}
          dataSource={dataSource}
          rowKey="maPB"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: ["8", "12", "20"],
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} phòng ban`,
          }}
          locale={{
            emptyText: "Không có dữ liệu phòng ban phù hợp",
          }}
        />
      </Card>

      <Modal
        open={!!detailDepartment}
        title="Thông tin chi tiết phòng ban"
        onCancel={() => setDetailDepartment(null)}
        footer={null}
        width={640}
        centered
        styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
      >
        {detailDepartment ? (
          <Descriptions
            size="middle"
            bordered
            column={1}
            items={[
              { key: "1", label: "Mã phòng ban", children: detailDepartment.maPB },
              { key: "2", label: "Tên phòng ban", children: detailDepartment.tenPhong || "-" },
              {
                key: "3",
                label: "Mô tả",
                children: (
                  <div style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-word" }}>
                    {detailDepartment.moTa?.trim() ? detailDepartment.moTa : "Chưa có mô tả"}
                  </div>
                ),
              },
            ]}
            labelStyle={{ width: 160, color: "#64748b", fontWeight: 600 }}
          />
        ) : null}
      </Modal>

      <style jsx global>{`
        .department-table-card {
          border: 1px solid #dbeafe;
        }
        .department-table .ant-table-thead > tr > th {
          background: linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%) !important;
          color: #0f172a !important;
          font-weight: 700;
          border-bottom: 1px solid #dbeafe !important;
        }
        .department-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #eff6ff !important;
        }
        .department-table .department-name {
          color: var(--text-primary) !important;
        }
        .department-table .department-desc {
          color: var(--text-secondary) !important;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }
        .department-table .ant-table-tbody > tr:hover > td {
          background: #f7fcff !important;
        }
        .department-table .ant-pagination .ant-pagination-item-active {
          border-color: #0ea5e9;
        }
        .department-table .ant-pagination .ant-pagination-item-active a {
          color: #0284c7;
        }
        [data-theme="dark"] .department-table .department-name {
          color: #f1f5f9 !important;
        }
        [data-theme="dark"] .department-table .department-desc {
          color: #cbd5e1 !important;
        }
      `}</style>
    </>
  );
}
