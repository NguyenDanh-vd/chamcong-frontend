//File này đóng gói logic của Recharts.

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { ReportItem } from "./ReportTable"; 

export default function ReportChart({ data }: { data: ReportItem[] }) {
  if (data.length === 0) return null;

  return (
    <div className="h-96 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Biểu đồ tổng quan</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={40}>
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
          <XAxis dataKey="hoTen" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend iconType="circle" />
          <Bar dataKey="ngayCong" fill="url(#greenGrad)" name="Ngày công" radius={[4, 4, 0, 0]} />
          <Bar dataKey="ngayNghi" fill="url(#redGrad)" name="Ngày nghỉ" radius={[4, 4, 0, 0]} />
          <Bar dataKey="gioLamThem" fill="url(#blueGrad)" name="Giờ làm thêm" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}