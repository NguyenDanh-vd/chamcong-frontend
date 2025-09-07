"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "@/utils/api";
import { getUserFromToken } from "@/utils/auth";

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
        setData(res.data);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu thống kê:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full h-64 mt-6">
      <h2 className="text-lg font-semibold mb-2">📊 Thống kê giờ làm</h2>
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: "Giờ", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Line type="monotone" dataKey="hours" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}