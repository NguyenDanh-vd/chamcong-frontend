import { Card, Col, Progress, Row } from "antd";
import { ReactNode } from "react";

interface StatItem {
  title: string;
  value: number;
  sub: string;
  icon: ReactNode;
  color: string;
  bg: string;
  rate?: number;
}

interface DashboardStatsProps {
  stats: StatItem[];
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <Row gutter={[16, 16]}>
      {stats.map((item, idx) => (
        <Col xs={24} sm={12} lg={6} key={idx}>
          <Card
            className="dashboard-stat-card"
            bordered={false}
            bodyStyle={{ padding: "16px 16px 14px" }}
            style={{
              borderRadius: 18,
              minHeight: 168,
              background: item.bg,
              boxShadow: "inset 0 0 0 1px rgba(12, 74, 110, 0.14), 0 14px 24px rgba(12, 74, 110, 0.16)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#0f172a", fontSize: 13, fontWeight: 700 }}>{item.title}</span>
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: item.color,
                  background: "rgba(255,255,255,0.72)",
                  boxShadow: "0 6px 14px rgba(12, 74, 110, 0.18)",
                  fontSize: 16,
                }}
              >
                {item.icon}
              </span>
            </div>

            <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ color: item.color, fontWeight: 900, fontSize: 30, lineHeight: 1 }}>
                {Number(item.value || 0).toLocaleString("vi-VN")}
              </span>
            </div>
            <span style={{ color: "#334155", fontSize: 12, fontWeight: 500 }}>{item.sub}</span>
            <Progress
              percent={Number((item.rate ?? 100).toFixed(1))}
              size="small"
              strokeColor={item.color}
              trailColor="rgba(148, 163, 184, 0.26)"
              showInfo={false}
              style={{ marginTop: 10, marginBottom: 0 }}
            />
          </Card>
        </Col>
      ))}

      <style jsx global>{`
        .dashboard-stat-card {
          transition:
            transform 220ms ease,
            box-shadow 220ms ease,
            filter 220ms ease;
          will-change: transform;
        }
        .dashboard-stat-card:hover {
          transform: translateY(-5px);
          box-shadow:
            inset 0 0 0 1px rgba(12, 74, 110, 0.2),
            0 18px 30px rgba(12, 74, 110, 0.24) !important;
          filter: saturate(1.04);
        }
      `}</style>
    </Row>
  );
}
