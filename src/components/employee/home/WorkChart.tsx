"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import api from "@/utils/api";
import { getUserFromToken } from "@/utils/auth";
import { FaChartLine } from "react-icons/fa";

interface DataPoint {
  date: string;
  hours: number;
}

export default function WorkChart() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUserFromToken();
    if (!user) return;

    const fetchData = async () => {
      try {
        const res = await api.get(`/chamcong/thongke/${user.maNV}`);
        // Giả lập dữ liệu nếu API chưa có để test giao diện (bạn có thể xóa dòng này khi API chạy thật)
        // const mockData = [
        //   { date: 'T2', hours: 8 }, { date: 'T3', hours: 7.5 }, { date: 'T4', hours: 9 }, 
        //   { date: 'T5', hours: 8 }, { date: 'T6', hours: 8.5 }, { date: 'T7', hours: 4 }
        // ]; 
        setData(res.data || []);
      } catch (err) {
        console.error("Lỗi thống kê:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-64 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 animate-pulse flex items-center justify-center">
        <span className="text-gray-400 text-sm">Đang tải biểu đồ...</span>
      </div>
    );
  }

  // Nếu không có dữ liệu thì ẩn luôn cho đỡ xấu
  if (data.length === 0) return null;

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300 mt-6">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
        <FaChartLine className="text-blue-500" /> Xu hướng làm việc tuần qua
      </h2>
      
      <div className="h-64 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF' }} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
            />
            <Area 
              type="monotone" 
              dataKey="hours" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorHours)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}