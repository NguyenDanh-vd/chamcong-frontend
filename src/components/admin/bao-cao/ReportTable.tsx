import { Card, Empty, Spin, Table, Tag, Typography } from "antd";

export type ReportItem = {
  hoTen: string;
  ngayCong: number;
  ngayNghi: number;
  gioLamThem: number;
};

interface ReportTableProps {
  data: ReportItem[];
  loading: boolean;
}

const { Text } = Typography;

export default function ReportTable({ data, loading }: ReportTableProps) {
  const totalCong = data.reduce((s, r) => s + Number(r.ngayCong || 0), 0);
  const totalNghi = data.reduce((s, r) => s + Number(r.ngayNghi || 0), 0);
  const totalGioLT = data.reduce((s, r) => s + Number(r.gioLamThem || 0), 0);

  const tableData = data.map((r, index) => {
    const total = Number(r.ngayCong || 0) + Number(r.ngayNghi || 0);
    const percent = total > 0 ? Number(((Number(r.ngayCong || 0) / total) * 100).toFixed(1)) : 0;
    return {
      key: index,
      ...r,
      percent,
    };
  });

  const columns = [
    {
      title: "Nhân viên",
      dataIndex: "hoTen",
      key: "hoTen",
      width: 240,
      render: (value: string) => <Text strong>{value || "-"}</Text>,
    },
    { title: "Ngày công", dataIndex: "ngayCong", key: "ngayCong", width: 120 },
    { title: "Ngày nghỉ", dataIndex: "ngayNghi", key: "ngayNghi", width: 120 },
    { title: "Giờ làm thêm", dataIndex: "gioLamThem", key: "gioLamThem", width: 130 },
    {
      title: "% đi làm",
      dataIndex: "percent",
      key: "percent",
      width: 130,
      render: (value: number) => (
        <Tag
          color={value < 50 ? "error" : value < 80 ? "warning" : "success"}
          style={{ borderRadius: 999, paddingInline: 10 }}
        >
          {value}%
        </Tag>
      ),
    },
  ];

  return (
    <Card
      className="report-table-card"
      bordered={false}
      style={{ borderRadius: 18, boxShadow: "0 14px 28px rgba(15, 42, 96, 0.1)" }}
      bodyStyle={{ padding: 0, overflow: "hidden" }}
      title="Bảng dữ liệu báo cáo"
    >
      <Spin spinning={loading}>
        {tableData.length === 0 ? (
          <div style={{ padding: 24 }}>
            <Empty description="Không có dữ liệu báo cáo" />
          </div>
        ) : (
          <Table
            className="report-table"
            columns={columns}
            dataSource={tableData}
            pagination={{
              pageSize: 8,
              showSizeChanger: true,
              pageSizeOptions: ["8", "12", "20"],
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} nhân viên`,
            }}
            scroll={{ x: 900 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <b>Tổng cộng</b>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <b>{totalCong}</b>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <b>{totalNghi}</b>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    <b>{totalGioLT}</b>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>-</Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        )}
      </Spin>

      <style jsx global>{`
        .report-table-card {
          border: 1px solid #dbeafe;
        }
        .report-table .ant-table-thead > tr > th {
          background: linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%) !important;
          color: #0f172a !important;
          font-weight: 700;
          border-bottom: 1px solid #dbeafe !important;
        }
        .report-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #eff6ff !important;
        }
        .report-table .ant-table-tbody > tr:hover > td {
          background: #f7fcff !important;
        }
        .report-table .ant-pagination .ant-pagination-item-active {
          border-color: #0ea5e9;
        }
        .report-table .ant-pagination .ant-pagination-item-active a {
          color: #0284c7;
        }
      `}</style>
    </Card>
  );
}
