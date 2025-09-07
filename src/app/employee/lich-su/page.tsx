"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/layouts/MobileLayout";
import api from "@/utils/api";
import { format } from "date-fns";
import { getUserFromToken } from "@/utils/auth";
import { FaSpinner, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx-js-style";

interface ChamCong {
  gioVao: string;
  gioRa?: string;
  soGioLam?: number | null;
  trangThai: string;
  hinhThuc: string;
  caLamViec: {
    tenCa: string;
  };
  soPhutDiTre?: number;
  soPhutVeSom?: number;
  trangThaiText?: string;
}

const STATUS_INFO: Record<
  string,
  { text: string; style: string; icon: string }
> = {
  "hop-le": {
    text: "Hợp lệ",
    style:
      "border-green-400 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    icon: "✅",
  },
  "da-checkout": {
    text: "Đã check-out",
    style:
      "border-green-400 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    icon: "✅",
  },
  "di-tre": {
    text: "Đi trễ",
    style:
      "border-red-400 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    icon: "❌",
  },
  "ve-som": {
    text: "Về sớm",
    style:
      "border-orange-400 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    icon: "⚠️",
  },
  "tre-va-ve-som": {
    text: "Trễ và Về sớm",
    style:
      "border-fuchsia-400 bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300",
    icon: "❗",
  },
  "chua-xac-nhan": {
    text: "Chưa xác nhận",
    style:
      "border-yellow-400 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    icon: "⏳",
  },
  default: {
    text: "Không xác định",
    style:
      "border-gray-300 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    icon: "❔",
  },
};

function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0
    ? m > 0
      ? `${h} giờ ${m} phút`
      : `${h} giờ`
    : `${m} phút`;
}

function formatHours(hours: number | null | undefined): string {
  if (!hours || hours <= 0) return "-";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return h > 0
    ? m > 0
      ? `${h} giờ ${m} phút`
      : `${h} giờ`
    : `${m} phút`;
}

export default function HistoryPage() {
  const router = useRouter();
  const [records, setRecords] = useState<ChamCong[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState<ChamCong | null>(null);
  const [filter, setFilter] = useState("all");
  const [monthSelect, setMonthSelect] = useState<number | null>(null);
  const [trangThai, setTrangThai] = useState("");
  const [totalHours, setTotalHours] = useState<number>(0);
  const [totalLateMinutes, setTotalLateMinutes] = useState<number>(0);
  const [totalEarlyMinutes, setTotalEarlyMinutes] = useState<number>(0);

  useEffect(() => {
    const user = getUserFromToken();
    if (!user) return router.push("/login");

    const fetchRecords = async () => {
      setLoading(true);
      let query: any = {};
      const today = new Date();

      if (filter === "week") {
        const start = new Date(today);
        const day = start.getDay() || 7;
        start.setDate(start.getDate() - day + 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        query.tuNgay = start.toISOString();
        query.denNgay = end.toISOString();
      } else if (filter === "month") {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
          23,
          59,
          59
        );
        query.tuNgay = start.toISOString();
        query.denNgay = end.toISOString();
      } else if (filter === "month-select" && monthSelect !== null) {
        const year = today.getFullYear();
        const start = new Date(year, monthSelect, 1);
        const end = new Date(year, monthSelect + 1, 0, 23, 59, 59);
        query.tuNgay = start.toISOString();
        query.denNgay = end.toISOString();
      }

      if (trangThai) query.trangThai = trangThai;

      try {
        const res = await api.get(`/chamcong/my-records`, { params: query });
        const data: ChamCong[] = res.data;
        setRecords(data);
        setTotalHours(data.reduce((s, r) => s + (r.soGioLam ?? 0), 0));
        setTotalLateMinutes(data.reduce((s, r) => s + (r.soPhutDiTre ?? 0), 0));
        setTotalEarlyMinutes(
          data.reduce((s, r) => s + (r.soPhutVeSom ?? 0), 0)
        );

        const recordToday = data.find((r) => {
          const d = new Date(r.gioVao);
          return (
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
          );
        });
        setTodayRecord(recordToday || null);
      } catch (err) {
        console.error(err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [filter, monthSelect, trangThai, router]);

  return (
    <MobileLayout>
      <div className="p-4 min-h-screen transition-colors duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Lịch sử chấm công</h1>
          <button
            onClick={() => alert("Export Excel")}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-white transition"
          >
            <FaFileExcel /> Xuất Excel
          </button>
        </div>

        {/* Tổng hợp */}
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-md font-medium">
            Tổng số giờ làm:{" "}
            <span className="text-blue-600 dark:text-blue-400">
              {formatHours(totalHours)}
            </span>
          </h2>
          {totalLateMinutes > 0 && (
            <h2 className="text-md font-medium">
              Tổng thời gian đi trễ:{" "}
              <span className="text-red-600 dark:text-red-400">
                {formatDuration(totalLateMinutes)}
              </span>
            </h2>
          )}
          {totalEarlyMinutes > 0 && (
            <h2 className="text-md font-medium">
              Tổng thời gian về sớm:{" "}
              <span className="text-orange-600 dark:text-orange-400">
                {formatDuration(totalEarlyMinutes)}
              </span>
            </h2>
          )}
        </div>

        {/* Cảnh báo hôm nay chưa check-in */}
        {!loading && !todayRecord && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded-lg mb-4 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200">
            ⚠️ Bạn chưa check-in hôm nay!
            <button
              onClick={() => router.push("/employee/home")}
              className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold px-4 py-2 rounded-md transition w-full mt-2"
            >
              Đi đến chấm công
            </button>
          </div>
        )}

        {/* Bộ lọc */}
        <div className="mb-4 flex gap-2 flex-wrap items-center">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter("week")}
            className={`px-3 py-1 rounded ${
              filter === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            Tuần này
          </button>
          <button
            onClick={() => setFilter("month")}
            className={`px-3 py-1 rounded ${
              filter === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            Tháng này
          </button>
          <select
            value={monthSelect ?? ""}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value) : null;
              setMonthSelect(val);
              setFilter(val !== null ? "month-select" : "all");
            }}
            className="border px-2 py-1 rounded bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            <option value="">Chọn tháng</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                Tháng {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Lọc theo trạng thái */}
        <div className="mb-4">
          <select
            value={trangThai}
            onChange={(e) => setTrangThai(e.target.value)}
            className="border px-2 py-1 rounded w-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_INFO)
              .filter(([key]) => key !== "default")
              .map(([key, { text }]) => (
                <option key={key} value={key}>
                  {text}
                </option>
              ))}
          </select>
        </div>

        {/* Nội dung */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <FaSpinner className="animate-spin text-blue-500 text-3xl" />
          </div>
        ) : records.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Không có dữ liệu chấm công.
          </p>
        ) : (
          <div className="flex flex-col gap-3 overflow-y-auto pb-10">
            {records.map((r, i) => {
              const statusInfo = STATUS_INFO[r.trangThai] || STATUS_INFO.default;
              return (
                <div
                  key={i}
                  className={`p-4 rounded-lg shadow-md border transition-colors duration-300 
                              bg-white text-gray-900 border-gray-300 
                              dark:bg-gray-800 dark:text-white dark:border-gray-700 ${statusInfo.style}`}
                >
                  <div className="flex justify-between items-center font-semibold mb-2">
                    <span>{format(new Date(r.gioVao), "dd/MM/yyyy")}</span>
                    <span className="flex items-center gap-1.5 text-sm font-bold">
                      {statusInfo.icon} {statusInfo.text}
                    </span>
                  </div>
                  <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
                    <p>🕒 Giờ vào: {format(new Date(r.gioVao), "HH:mm")}</p>
                    <p>
                      🏁 Giờ ra:{" "}
                      {r.gioRa ? format(new Date(r.gioRa), "HH:mm") : "--:--"}
                    </p>
                    <p>⏳ Số giờ: {formatHours(r.soGioLam)}</p>
                    <p>📅 Ca: {r.caLamViec?.tenCa ?? "--"}</p>
                    {r.soPhutDiTre && r.soPhutDiTre > 0 && (
                      <p className="text-red-600 dark:text-red-400 col-span-2">
                        Đi trễ: {formatDuration(r.soPhutDiTre)}
                      </p>
                    )}
                    {r.soPhutVeSom && r.soPhutVeSom > 0 && (
                      <p className="text-orange-600 dark:text-orange-400 col-span-2">
                        Về sớm: {formatDuration(r.soPhutVeSom)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
