"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/layouts/MobileLayout";
import api from "@/utils/api";
import { format } from "date-fns";
import { getUserFromToken } from "@/utils/auth";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx-js-style";

// Import các component tách
import { STATUS_INFO, formatHours, formatDuration } from "@/components/employee/lich-su/history.utils";
import HistoryStats from "@/components/employee/lich-su/HistoryStats";
import HistoryFilters from "@/components/employee/lich-su/HistoryFilters";
import HistoryList from "@/components/employee/lich-su/HistoryList";

// Interface này dùng cho cả Page và Components
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

  // --- LOGIC XUẤT EXCEL ---
  const handleExportExcel = () => {
    if (!records || records.length === 0) {
      alert("Không có dữ liệu để xuất Excel");
      return;
    }

    const sheetData = [
      ["STT", "Ngày", "Giờ vào", "Giờ ra", "Số giờ làm", "Ca", "Đi trễ", "Về sớm", "Trạng thái"],
      ...records.map((r, i) => [
        i + 1,
        format(new Date(r.gioVao), "dd/MM/yyyy"),
        format(new Date(r.gioVao), "HH:mm"),
        r.gioRa ? format(new Date(r.gioRa), "HH:mm") : "--:--",
        formatHours(r.soGioLam),
        r.caLamViec?.tenCa ?? "--",
        formatDuration(r.soPhutDiTre ?? 0),
        formatDuration(r.soPhutVeSom ?? 0),
        STATUS_INFO[r.trangThai]?.text || "Không xác định",
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const range = XLSX.utils.decode_range(ws["!ref"]!);

    // Style Header
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        fill: { fgColor: { rgb: "1E90FF" } },
        font: { bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };
    }
    // Style Body
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cellAddress]) continue;
          ws[cellAddress].s = { ...ws[cellAddress].s, alignment: { horizontal: "center", vertical: "center" }, border: { top: { style: "thin", color: { rgb: "000000" } }, bottom: { style: "thin", color: { rgb: "000000" } }, left: { style: "thin", color: { rgb: "000000" } }, right: { style: "thin", color: { rgb: "000000" } } } };
        }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ChamCong");
    XLSX.writeFile(wb, "lich-su-cham-cong.xlsx");
  };

  // --- LOGIC FETCH DATA ---
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
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
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
        setTotalEarlyMinutes(data.reduce((s, r) => s + (r.soPhutVeSom ?? 0), 0));

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

  // --- PHẦN HIỂN THỊ  ---
  return (
    <MobileLayout>
      <div className="p-4 min-h-screen transition-colors duration-300">
        
        {/* 1. Header & Excel Button */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Lịch sử chấm công</h1>
          <button
            onClick={handleExportExcel}
            disabled={records.length === 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-md hover:from-green-600 hover:to-emerald-700 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FaFileExcel /> Xuất Excel
          </button>
        </div>

        {/* 2. Thống kê */}
        <HistoryStats 
            totalHours={totalHours} 
            totalLateMinutes={totalLateMinutes} 
            totalEarlyMinutes={totalEarlyMinutes} 
        />

        {/* 3. Cảnh báo chưa check-in */}
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

        {/* 4. Bộ lọc */}
        <HistoryFilters 
            filter={filter} setFilter={setFilter}
            monthSelect={monthSelect} setMonthSelect={setMonthSelect}
            trangThai={trangThai} setTrangThai={setTrangThai}
        />

        {/* 5. Danh sách bản ghi */}
        <HistoryList loading={loading} records={records} />

      </div>
    </MobileLayout>
  );
}