"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/layouts/MobileLayout";
import api from "@/utils/api";
import { format } from "date-fns";
import { getUserFromToken } from "@/utils/auth";
import { FaFileExcel } from "react-icons/fa";
import { MdInfoOutline, MdOutlineHistory } from "react-icons/md";
import * as XLSX from "xlsx-js-style";

import { STATUS_INFO, formatHours, formatDuration } from "@/components/employee/lich-su/history.utils";
import HistoryStats from "@/components/employee/lich-su/HistoryStats";
import HistoryFilters from "@/components/employee/lich-su/HistoryFilters";
import HistoryList from "@/components/employee/lich-su/HistoryList";

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

    for (let c = range.s.c; c <= range.e.c; ++c) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        fill: { fgColor: { rgb: "0EA5E9" } },
        font: { bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }

    for (let r = range.s.r; r <= range.e.r; ++r) {
      for (let c = range.s.c; c <= range.e.c; ++c) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
          ...ws[cellAddress].s,
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "D4D4D8" } },
            bottom: { style: "thin", color: { rgb: "D4D4D8" } },
            left: { style: "thin", color: { rgb: "D4D4D8" } },
            right: { style: "thin", color: { rgb: "D4D4D8" } },
          },
        };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ChamCong");
    XLSX.writeFile(wb, "lich-su-cham-cong.xlsx");
  };

  useEffect(() => {
    const user = getUserFromToken();
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchRecords = async () => {
      setLoading(true);
      const query: any = {};
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
        const res = await api.get("/chamcong/my-records", { params: query });
        const data: ChamCong[] = res.data;

        setRecords(data);
        setTotalHours(data.reduce((sum, r) => sum + (r.soGioLam ?? 0), 0));
        setTotalLateMinutes(data.reduce((sum, r) => sum + (r.soPhutDiTre ?? 0), 0));
        setTotalEarlyMinutes(data.reduce((sum, r) => sum + (r.soPhutVeSom ?? 0), 0));

        const recordToday = data.find((r) => {
          const d = new Date(r.gioVao);
          return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/25 to-white p-4 transition-colors duration-300 md:p-6">
        <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(2,132,199,0.45)] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-sky-700">
                <MdOutlineHistory className="mr-2 text-sm" /> Lịch sử chấm công
              </div>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-900 md:text-3xl">Theo dõi bản ghi chấm công của bạn</h1>
              <p className="mt-1 text-sm text-slate-600">Lọc nhanh theo thời gian và trạng thái, xuất dữ liệu ra Excel khi cần.</p>
            </div>

            <button
              onClick={handleExportExcel}
              disabled={records.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaFileExcel /> Xuất Excel
            </button>
          </div>
        </div>

        <HistoryStats totalHours={totalHours} totalLateMinutes={totalLateMinutes} totalEarlyMinutes={totalEarlyMinutes} />

        {!loading && !todayRecord ? (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <p className="flex items-center gap-2 font-semibold">
              <MdInfoOutline className="text-lg" /> Bạn chưa check-in hôm nay.
            </p>
            <button
              onClick={() => router.push("/employee/home")}
              className="mt-3 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-500"
            >
              Đi đến chấm công
            </button>
          </div>
        ) : null}

        <HistoryFilters
          filter={filter}
          setFilter={setFilter}
          monthSelect={monthSelect}
          setMonthSelect={setMonthSelect}
          trangThai={trangThai}
          setTrangThai={setTrangThai}
        />

        <HistoryList loading={loading} records={records} />
      </div>
    </MobileLayout>
  );
}
