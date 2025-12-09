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

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const cardStyle: React.CSSProperties = {
    borderRadius: "16px",
    border: "none",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    height: "100%",
    padding: "10px 0"
  };

  return (
    <Row gutter={[20, 20]}>
      {stats.map((item, idx) => (
        <Col xs={24} sm={12} lg={6} key={idx}>
          <Card bodyStyle={{ padding: '20px' }} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>{item.title}</span>
                <div style={{ fontSize: '28px', fontWeight: 700, margin: '5px 0' }}>{item.value}</div>
                <Tag color={item.subColor ? "success" : "default"} style={{ border: 'none', background: item.bg }}>{item.sub}</Tag>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}