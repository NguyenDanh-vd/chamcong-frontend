//Hiển thị 4 thẻ thống kê (Card).

import { Card, Col, Row, Tag } from "antd";
import { ReactNode } from "react";

interface StatItem {
  title: string;
  value: number;
  sub: string;
  subColor?: string;
  icon: ReactNode;
  color: string;
  bg: string;
}

interface DashboardStatsProps {
  stats: StatItem[];
}

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return hex;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <Row gutter={[18, 18]}>
      {stats.map((item, idx) => (
        <Col xs={24} sm={12} lg={6} key={idx}>
          <Card
            bodyStyle={{ padding: "18px 18px 16px" }}
            style={{
              borderRadius: "18px",
              border: `1px solid ${hexToRgba(item.color, 0.16)}`,
              boxShadow: `0 10px 22px ${hexToRgba(item.color, 0.12)}`,
              height: "100%",
              overflow: "hidden",
              background: item.bg,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            hoverable
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    fontSize: "13px",
                    color: "#334155",
                    display: "block",
                    letterSpacing: 0.25,
                    fontWeight: 600,
                  }}
                >
                  {item.title}
                </span>
                <div
                  style={{
                    fontSize: "42px",
                    lineHeight: 1.1,
                    fontWeight: 900,
                    margin: "8px 0 10px",
                    color: item.color,
                  }}
                >
                  {item.value}
                </div>
                <Tag
                  style={{
                    border: "none",
                    background: hexToRgba(item.color, 0.14),
                    color: item.subColor || "#334155",
                    padding: "5px 9px",
                    borderRadius: 999,
                    fontWeight: 600,
                  }}
                >
                  {item.sub}
                </Tag>
              </div>

              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  background: hexToRgba(item.color, 0.16),
                  border: `1px solid ${hexToRgba(item.color, 0.28)}`,
                  color: item.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 8px 16px ${hexToRgba(item.color, 0.15)}`,
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
