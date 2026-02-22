import { format } from "date-fns";
import { useState } from "react";
import { Card, Checkbox, Col, Popconfirm, Row, Space, Tag, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import CustomButton from "@/components/CustomButton";

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
    if (status === "da-duyet") return <Tag color="success" style={{ borderRadius: 999, paddingInline: 10 }}>Đã duyệt</Tag>;
    if (status === "cho-duyet") return <Tag color="processing" style={{ borderRadius: 999, paddingInline: 10 }}>Chờ duyệt</Tag>;
    return <Tag color="error" style={{ borderRadius: 999, paddingInline: 10 }}>Từ chối</Tag>;
  };

  return (
    <Row gutter={[14, 14]}>
      {data.map((ot) => (
        <Col xs={24} lg={12} key={ot.maLT}>
          <Card
            className="ot-item-card"
            bordered={false}
            onMouseEnter={() => setHoveredId(ot.maLT)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              borderRadius: 16,
              border: "1px solid #dbeafe",
              background: "linear-gradient(160deg, #ffffff 0%, #f8fbff 55%, #f1f8ff 100%)",
              transform: hoveredId === ot.maLT ? "translateY(-4px)" : "translateY(0)",
              boxShadow: selectedIds.includes(ot.maLT)
                ? hoveredId === ot.maLT
                  ? "0 0 0 2px rgba(14,165,233,.26), 0 18px 30px rgba(15,42,96,.18)"
                  : "0 0 0 2px rgba(14,165,233,.22), 0 12px 24px rgba(15,42,96,.1)"
                : hoveredId === ot.maLT
                  ? "0 18px 30px rgba(15,42,96,.14)"
                  : "0 12px 24px rgba(15,42,96,.08)",
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
                <Text type="secondary">
                  Ngày: <Text>{formatDate(ot.ngay) || "-"}</Text>
                </Text>
                <Text type="secondary">
                  Thời gian: <Text>{ot.gioBatDau} - {ot.gioKetThuc} ({ot.soGio || 0} giờ)</Text>
                </Text>
                <Text type="secondary">
                  Lý do: <Text>{ot.lyDo || "Không có lý do"}</Text>
                </Text>
              </div>

              {ot.trangThai === "cho-duyet" ? (
                <Space wrap>
                  <Popconfirm
                    title="Xác nhận duyệt đơn này?"
                    onConfirm={() => onUpdateStatus(ot.maLT, "da-duyet")}
                    okText="Duyệt"
                    cancelText="Hủy"
                  >
                    <CustomButton icon={<CheckOutlined />} style={{ borderRadius: 10, background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                      Duyệt
                    </CustomButton>
                  </Popconfirm>

                  <Popconfirm
                    title="Xác nhận từ chối đơn này?"
                    onConfirm={() => onUpdateStatus(ot.maLT, "tu-choi")}
                    okText="Từ chối"
                    cancelText="Hủy"
                  >
                    <CustomButton icon={<CloseOutlined />} style={{ borderRadius: 10, background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
                      Từ chối
                    </CustomButton>
                  </Popconfirm>
                </Space>
              ) : null}
            </Space>
          </Card>
        </Col>
      ))}

      <style jsx global>{`
        .ot-item-card .ant-card-body {
          position: relative;
        }
        [data-theme="dark"] .ot-item-card {
          background: linear-gradient(160deg, #0f172a 0%, #111827 55%, #0b1220 100%) !important;
          border-color: #334155 !important;
          box-shadow: 0 14px 30px rgba(2, 6, 23, 0.55) !important;
        }
        [data-theme="dark"] .ot-item-card .ant-typography,
        [data-theme="dark"] .ot-item-card .ant-space-item,
        [data-theme="dark"] .ot-item-card .ant-checkbox + span {
          color: #e2e8f0 !important;
        }
        [data-theme="dark"] .ot-item-card .ant-typography-secondary {
          color: #cbd5e1 !important;
          opacity: 1 !important;
        }
        [data-theme="dark"] .ot-item-card .ant-typography .ant-typography {
          color: #f1f5f9 !important;
        }
        .ot-item-card .ant-card-body::after {
          content: "";
          position: absolute;
          right: -42px;
          bottom: -42px;
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(56, 189, 248, 0) 72%);
          pointer-events: none;
        }
      `}</style>
    </Row>
  );
}
