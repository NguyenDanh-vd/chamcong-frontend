import { Card, Typography } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ReportItem } from "./ReportTable";

const { Text } = Typography;

export default function ReportChart({ data }: { data: ReportItem[] }) {
  if (data.length === 0) return null;

  return (
    <Card
      className="report-chart-card"
      bordered={false}
      style={{
        borderRadius: 18,
        boxShadow: "0 14px 28px rgba(15, 42, 96, 0.1)",
        background: "linear-gradient(145deg, #ffffff 0%, #f8fbff 45%, #eef7ff 100%)",
      }}
      bodyStyle={{ padding: 18 }}
    >
      <Text strong style={{ fontSize: 16, color: "#0f172a" }}>
        Biểu đồ tổng quan
      </Text>

      <div style={{ height: 360, marginTop: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={32}>
            <defs>
              <linearGradient id="reportBlueA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.95} />
                <stop offset="95%" stopColor="#7dd3fc" stopOpacity={0.95} />
              </linearGradient>
              <linearGradient id="reportBlueB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.95} />
                <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.95} />
              </linearGradient>
              <linearGradient id="reportBlueC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0369a1" stopOpacity={0.95} />
                <stop offset="95%" stopColor="#67e8f9" stopOpacity={0.95} />
              </linearGradient>
            </defs>

            <XAxis dataKey="hoTen" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(14,165,233,0.08)" }}
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: 10,
                border: "1px solid #dbeafe",
                boxShadow: "0 10px 24px rgba(15,42,96,0.14)",
                color: "rgb(15, 23, 42)",
              }}
              labelStyle={{ color: "rgb(15, 23, 42)", fontWeight: 700 }}
              itemStyle={{ color: "rgb(51, 65, 85)" }}
            />
            <Legend iconType="circle" />
            <Bar dataKey="ngayCong" fill="url(#reportBlueA)" name="Ngày công" radius={[6, 6, 0, 0]} />
            <Bar dataKey="ngayNghi" fill="url(#reportBlueB)" name="Ngày nghỉ" radius={[6, 6, 0, 0]} />
            <Bar dataKey="gioLamThem" fill="url(#reportBlueC)" name="Giờ làm thêm" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <style jsx global>{`
        .report-chart-card {
          border: 1px solid #dbeafe;
        }
        .report-chart-card .recharts-legend-item-text {
          color: rgb(51, 65, 85) !important;
          fill: rgb(51, 65, 85) !important;
          opacity: 1 !important;
        }
        .report-chart-card .recharts-cartesian-axis-tick-value {
          fill: rgb(51, 65, 85) !important;
        }
        .report-chart-card .recharts-label {
          fill: rgb(51, 65, 85) !important;
        }
        .report-chart-card .recharts-default-tooltip,
        .report-chart-card .recharts-tooltip-label,
        .report-chart-card .recharts-tooltip-item,
        .report-chart-card .recharts-tooltip-item-list,
        .report-chart-card .recharts-tooltip-item-name,
        .report-chart-card .recharts-tooltip-item-value {
          color: rgb(15, 23, 42) !important;
          fill: rgb(15, 23, 42) !important;
          opacity: 1 !important;
        }
      `}</style>
    </Card>
  );
}
