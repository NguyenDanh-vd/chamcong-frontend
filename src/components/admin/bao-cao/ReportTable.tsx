import { Card, Empty, Spin, Table, Tag } from "antd";

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
    { title: "Nhân viên", dataIndex: "hoTen", key: "hoTen", width: 240 },
    { title: "Ngày công", dataIndex: "ngayCong", key: "ngayCong", width: 120 },
    { title: "Ngày nghỉ", dataIndex: "ngayNghi", key: "ngayNghi", width: 120 },
    { title: "Giờ làm thêm", dataIndex: "gioLamThem", key: "gioLamThem", width: 130 },
    {
      title: "% đi làm",
      dataIndex: "percent",
      key: "percent",
      width: 130,
      render: (value: number) => (
        <Tag color={value < 50 ? "error" : value < 80 ? "warning" : "success"}>{value}%</Tag>
      ),
    },
  ];

  return (
    <Card
      bordered={false}
      style={{ borderRadius: 16, boxShadow: "0 12px 26px rgba(15, 23, 42, 0.06)" }}
      title="Bảng dữ liệu báo cáo"
    >
      <Spin spinning={loading}>
        {tableData.length === 0 ? (
          <Empty description="Không có dữ liệu báo cáo" />
        ) : (
          <Table
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
                  <Table.Summary.Cell index={0}><b>Tổng cộng</b></Table.Summary.Cell>
                  <Table.Summary.Cell index={1}><b>{totalCong}</b></Table.Summary.Cell>
                  <Table.Summary.Cell index={2}><b>{totalNghi}</b></Table.Summary.Cell>
                  <Table.Summary.Cell index={3}><b>{totalGioLT}</b></Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>-</Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        )}
      </Spin>
    </Card>
  );
}
