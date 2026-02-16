import { format } from "date-fns";
import { useState } from "react";
import { Button, Card, Checkbox, Col, Popconfirm, Row, Space, Tag, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

export interface OvertimeItem {
  maLT: number;
  nhanVien: { hoTen: string };
  ngay: string;
  gioBatDau: string;
  gioKetThuc: string;
  soGio: number;
  lyDo: string;
  trangThai: string;
}

interface OvertimeListProps {
  data: OvertimeItem[];
  selectedIds: number[];
  onToggleSelect: (id: number, checked: boolean) => void;
  onUpdateStatus: (id: number, status: string) => void;
}

const { Text } = Typography;

export default function OvertimeList({ data, selectedIds, onToggleSelect, onUpdateStatus }: OvertimeListProps) {
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
      {data.map((ot) => (
        <Col xs={24} lg={12} key={ot.maLT}>
          <Card
            bordered={false}
            onMouseEnter={() => setHoveredId(ot.maLT)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              borderRadius: 14,
              transform: hoveredId === ot.maLT ? "translateY(-4px)" : "translateY(0)",
              boxShadow: selectedIds.includes(ot.maLT)
                ? hoveredId === ot.maLT
                  ? "0 0 0 2px rgba(37,99,235,.28), 0 18px 30px rgba(15,23,42,.12)"
                  : "0 0 0 2px rgba(37,99,235,.28), 0 12px 24px rgba(15,23,42,.06)"
                : hoveredId === ot.maLT
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
                    checked={selectedIds.includes(ot.maLT)}
                    onChange={(e) => onToggleSelect(ot.maLT, e.target.checked)}
                  />
                  <Text strong style={{ fontSize: 16 }}>
                    {ot.nhanVien?.hoTen || "Không có tên"}
                  </Text>
                </Space>
                {getStatusTag(ot.trangThai)}
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <Text type="secondary">Ngày: <Text>{formatDate(ot.ngay) || "-"}</Text></Text>
                <Text type="secondary">Thời gian: <Text>{ot.gioBatDau} - {ot.gioKetThuc} ({ot.soGio || 0} giờ)</Text></Text>
                <Text type="secondary">Lý do: <Text>{ot.lyDo || "Không có lý do"}</Text></Text>
              </div>

              {ot.trangThai === "cho-duyet" ? (
                <Space wrap>
                  <Popconfirm
                    title="Xác nhận duyệt đơn này?"
                    onConfirm={() => onUpdateStatus(ot.maLT, "da-duyet")}
                    okText="Duyệt"
                    cancelText="Hủy"
                  >
                    <Button type="primary" icon={<CheckOutlined />} style={{ borderRadius: 10 }}>
                      Duyệt
                    </Button>
                  </Popconfirm>

                  <Popconfirm
                    title="Xác nhận từ chối đơn này?"
                    onConfirm={() => onUpdateStatus(ot.maLT, "tu-choi")}
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
