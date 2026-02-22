 "use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Loader2, ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "@/utils/api";

interface AttendanceItem {
  gioVao?: string;
  soGioLam?: number;
}

interface LeaveItem {
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: "cho-duyet" | "da-duyet" | "tu-choi";
}

interface SalaryItem {
  thang: string;
  tongLuong: number;
  nhanVien?: { maNV: number };
}

export default function PersonalStatsSection({ userId }: { userId?: number }) {
  const [showStats, setShowStats] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState<{ month: string; gioCong: number; luong: number }[]>([]);
  const [leaveStatusStats, setLeaveStatusStats] = useState<{ name: string; value: number; color: string }[]>([]);
  const [summary, setSummary] = useState({
    gioThangNay: 0,
    nghiPhepNamNay: 0,
    luongGanNhat: 0,
    thangLuongGanNhat: "",
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;
      setStatsLoading(true);
      try {
        const [attendanceRes, leaveRes, salaryRes] = await Promise.all([
          api.get("/chamcong/my-records"),
          api.get(`/nghiphep/nhanvien/${userId}`),
          api.get("/luong"),
        ]);

        const attendance: AttendanceItem[] = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
        const leaves: LeaveItem[] = Array.isArray(leaveRes.data) ? leaveRes.data : [];
        const salariesRaw: SalaryItem[] = Array.isArray(salaryRes.data) ? salaryRes.data : [];
        const salaries = salariesRaw.filter((s) => s?.nhanVien?.maNV === userId);

        const monthKeys = Array.from({ length: 6 }, (_, idx) =>
          dayjs().subtract(5 - idx, "month").format("YYYY-MM")
        );

        const mapByMonth = new Map(
          monthKeys.map((m) => [m, { month: dayjs(m + "-01").format("MM/YYYY"), gioCong: 0, luong: 0 }])
        );

        attendance.forEach((item) => {
          if (!item.gioVao) return;
          const key = dayjs(item.gioVao).format("YYYY-MM");
          if (!mapByMonth.has(key)) return;
          const current = mapByMonth.get(key)!;
          current.gioCong += Number(item.soGioLam || 0);
          mapByMonth.set(key, current);
        });

        salaries.forEach((item) => {
          const key = item.thang;
          if (!mapByMonth.has(key)) return;
          const current = mapByMonth.get(key)!;
          current.luong += Number(item.tongLuong || 0);
          mapByMonth.set(key, current);
        });

        const monthly = monthKeys.map((k) => mapByMonth.get(k)!);
        setMonthlyStats(monthly);

        const now = dayjs();
        const thisMonthKey = now.format("YYYY-MM");
        const gioThangNay = monthly.find((m, i) => monthKeys[i] === thisMonthKey)?.gioCong || 0;

        const leaveApprovedThisYear = leaves
          .filter((l) => l.trangThai === "da-duyet" && dayjs(l.ngayBatDau).year() === now.year())
          .reduce((sum, l) => {
            const start = dayjs(l.ngayBatDau);
            const end = dayjs(l.ngayKetThuc);
            return sum + Math.max(end.diff(start, "day") + 1, 0);
          }, 0);

        const sortedSalary = [...salaries].sort((a, b) => b.thang.localeCompare(a.thang));
        const latestSalary = sortedSalary[0];

        setSummary({
          gioThangNay,
          nghiPhepNamNay: leaveApprovedThisYear,
          luongGanNhat: Number(latestSalary?.tongLuong || 0),
          thangLuongGanNhat: latestSalary?.thang
            ? dayjs(latestSalary.thang + "-01").format("MM/YYYY")
            : "",
        });

        const leaveStatusMap = {
          "Chờ duyệt": leaves.filter((l) => l.trangThai === "cho-duyet").length,
          "Đã duyệt": leaves.filter((l) => l.trangThai === "da-duyet").length,
          "Từ chối": leaves.filter((l) => l.trangThai === "tu-choi").length,
        };

        setLeaveStatusStats([
          { name: "Chờ duyệt", value: leaveStatusMap["Chờ duyệt"], color: "#f59e0b" },
          { name: "Đã duyệt", value: leaveStatusMap["Đã duyệt"], color: "#10b981" },
          { name: "Từ chối", value: leaveStatusMap["Từ chối"], color: "#ef4444" },
        ]);
      } catch (err) {
        console.error("Không thể tải dữ liệu thống kê cá nhân:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_16px_42px_-30px_rgba(2,132,199,0.55)] dark:border-slate-700 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setShowStats((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-left dark:border-cyan-500/40 dark:bg-cyan-900/30"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="text-cyan-700 dark:text-cyan-300" size={18} />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">
              Thống kê cá nhân
            </p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Bấm để {showStats ? "thu gọn" : "xem"} bảng thống kê giờ công, lương, ngày nghỉ
            </p>
          </div>
        </div>
        {showStats ? (
          <ChevronUp className="text-cyan-700 dark:text-cyan-300" size={20} />
        ) : (
          <ChevronDown className="text-cyan-700 dark:text-cyan-300" size={20} />
        )}
      </button>

      {showStats ? (
        statsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-2xl text-sky-500" />
          </div>
        ) : (
          <>
            <div className="mb-4 mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3 dark:border-sky-500/40 dark:bg-sky-900/30">
                <p className="text-xs font-semibold text-sky-700 dark:text-sky-300">Giờ công tháng này</p>
                <p className="mt-1 text-2xl font-extrabold text-sky-700 dark:text-sky-200">
                  {summary.gioThangNay.toFixed(1)}h
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/40 dark:bg-emerald-900/30">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Ngày nghỉ đã duyệt (năm)
                </p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-700 dark:text-emerald-200">
                  {summary.nghiPhepNamNay} ngày
                </p>
              </div>
              <div className="rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/40 dark:bg-violet-900/30">
                <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                  Lương gần nhất {summary.thangLuongGanNhat ? `(${summary.thangLuongGanNhat})` : ""}
                </p>
                <p className="mt-1 text-2xl font-extrabold text-violet-700 dark:text-violet-200">
                  {summary.luongGanNhat.toLocaleString("vi-VN")}đ
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800 lg:col-span-2">
                <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Biểu đồ giờ công và lương (6 tháng gần nhất)
                </p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip
                        formatter={(value: any, name: any) =>
                          name === "luong"
                            ? [Number(value).toLocaleString("vi-VN") + " đ", "Lương"]
                            : [Number(value).toFixed(1) + " giờ", "Giờ công"]
                        }
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="gioCong"
                        name="gioCong"
                        stroke="#0ea5e9"
                        fill="#bae6fd"
                        fillOpacity={0.65}
                        strokeWidth={2}
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="luong"
                        name="luong"
                        stroke="#8b5cf6"
                        fill="#ddd6fe"
                        fillOpacity={0.45}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Tình trạng đơn nghỉ phép
                </p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leaveStatusStats}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={78}
                        label
                      >
                        {leaveStatusStats.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" height={36} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )
      ) : null}
    </section>
  );
}
