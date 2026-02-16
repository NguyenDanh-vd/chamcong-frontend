import { Card, Typography } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ReportItem } from "./ReportTable";

const { Text } = Typography;

export default function ReportChart({ data }: { data: ReportItem[] }) {
  if (data.length === 0) return null;

  return (
    <Card
      bordered={false}
      style={{ borderRadius: 16, boxShadow: "0 12px 26px rgba(15, 23, 42, 0.06)" }}
      bodyStyle={{ padding: 16 }}
    >
      <Text strong style={{ fontSize: 16, color: "#0f172a" }}>
        Biểu đồ tổng quan
      </Text>

      <div style={{ height: 360, marginTop: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={34}>
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#86efac" stopOpacity={0.9} />
              </linearGradient>
              <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#fca5a5" stopOpacity={0.9} />
              </linearGradient>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.9} />
              </linearGradient>
            </defs>

            <XAxis dataKey="hoTen" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}
            />
            <Legend iconType="circle" />
            <Bar dataKey="ngayCong" fill="url(#greenGrad)" name="Ngày công" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ngayNghi" fill="url(#redGrad)" name="Ngày nghỉ" radius={[4, 4, 0, 0]} />
            <Bar dataKey="gioLamThem" fill="url(#blueGrad)" name="Giờ làm thêm" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
