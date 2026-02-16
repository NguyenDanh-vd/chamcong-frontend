import React, { useState } from "react";
import { Descriptions, Modal, Popconfirm, Space, Table, Tag, Tooltip, Typography } from "antd";
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
          <ApartmentOutlined style={{ color: "#1d4ed8" }} />
          <Text strong style={{ color: "#0f172a" }}>
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
          <span style={{ color: "#334155", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{desc}</span>
        ) : (
          <Tag>Chưa có mô tả</Tag>
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
      <Table
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
    </>
  );
}
