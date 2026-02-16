import { format } from "date-fns";
import { useState } from "react";
import { Button, Card, Checkbox, Col, Popconfirm, Row, Space, Tag, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

export interface LeaveItem {
  maDon: number;
  nhanVien: { hoTen: string };
  ngayBatDau: string;
  ngayKetThuc: string;
  lyDo: string;
  trangThai: string;
}

interface LeaveListProps {
  data: LeaveItem[];
  selectedIds: number[];
  onToggleSelect: (id: number, checked: boolean) => void;
  onUpdateStatus: (id: number, status: string) => void;
}

const { Text } = Typography;

export default function LeaveList({ data, selectedIds, onToggleSelect, onUpdateStatus }: LeaveListProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const formatDate = (dateString: any) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : format(date, "dd/MM/yyyy");
  };

  const getStatusTag = (status: string) => {
    if (status === "da-duyet") return <Tag color="success">Đã duyệt</Tag>;
    if (status === "cho-duyet") return <Tag color="warning">Chờ duyệt</Tag>;
    return <Tag color="error">Từ chối</Tag>;
  };

  return (
    <Row gutter={[14, 14]}>
      {data.map((l) => (
        <Col xs={24} lg={12} key={l.maDon}>
          <Card
            bordered={false}
            onMouseEnter={() => setHoveredId(l.maDon)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              borderRadius: 14,
              transform: hoveredId === l.maDon ? "translateY(-4px)" : "translateY(0)",
              boxShadow: selectedIds.includes(l.maDon)
                ? hoveredId === l.maDon
                  ? "0 0 0 2px rgba(37,99,235,.28), 0 18px 30px rgba(15,23,42,.12)"
                  : "0 0 0 2px rgba(37,99,235,.28), 0 12px 24px rgba(15,23,42,.06)"
                : hoveredId === l.maDon
                ? "0 18px 30px rgba(15,23,42,.12)"
                : "0 12px 24px rgba(15,23,42,.06)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              height: "100%",
            }}
            bodyStyle={{ padding: 16 }}
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <Space>
                  <Checkbox
                    checked={selectedIds.includes(l.maDon)}
                    onChange={(e) => onToggleSelect(l.maDon, e.target.checked)}
                  />
                  <Text strong style={{ fontSize: 16 }}>
                    {l.nhanVien?.hoTen || "Không có tên"}
                  </Text>
                </Space>
                {getStatusTag(l.trangThai)}
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <Text type="secondary">Từ ngày: <Text>{formatDate(l.ngayBatDau) || "-"}</Text></Text>
                <Text type="secondary">Đến ngày: <Text>{formatDate(l.ngayKetThuc) || "-"}</Text></Text>
                <Text type="secondary">Lý do: <Text>{l.lyDo || "Không có lý do"}</Text></Text>
              </div>

              {l.trangThai === "cho-duyet" ? (
                <Space wrap>
                  <Popconfirm
                    title="Xác nhận duyệt đơn này?"
                    onConfirm={() => onUpdateStatus(l.maDon, "da-duyet")}
                    okText="Duyệt"
                    cancelText="Hủy"
                  >
                    <Button type="primary" icon={<CheckOutlined />} style={{ borderRadius: 10 }}>
                      Duyệt
                    </Button>
                  </Popconfirm>

                  <Popconfirm
                    title="Xác nhận từ chối đơn này?"
                    onConfirm={() => onUpdateStatus(l.maDon, "tu-choi")}
                    okText="Từ chối"
                    cancelText="Hủy"
                  >
                    <Button danger type="primary" icon={<CloseOutlined />} style={{ borderRadius: 10 }}>
                      Từ chối
                    </Button>
                  </Popconfirm>
                </Space>
              ) : null}
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
