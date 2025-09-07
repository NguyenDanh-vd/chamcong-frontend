"use client";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import AdminPage from "@/components/AdminPage";
import { FileExcelOutlined } from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
type ReportItem = {
  hoTen: string;
  ngayCong: number;
  ngayNghi: number;
  gioLamThem: number;
};

type BaoCaoType = "thang" | "nam";

export default function AdminBaoCao() {
  const [baoCaoType, setBaoCaoType] = useState<BaoCaoType>("thang");
  const [thang, setThang] = useState(new Date().getMonth() + 1);
  const [nam, setNam] = useState(new Date().getFullYear());
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // ================== FETCH ==================
  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        baoCaoType === "thang"
          ? `/baocao/thang?thang=${thang}&nam=${nam}`
          : `/baocao/nam?nam=${nam}`;
      const res = await api.get<ReportItem[]>(url);
      setReports(res.data);
    } catch {
      setError("Lấy dữ liệu báo cáo thất bại.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [baoCaoType, thang, nam]);

  // ================== EXPORT EXCEL ==================
  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const baseUrl =
        baoCaoType === "thang" ? "/baocao/thang/export" : "/baocao/nam/export";
      const params =
        baoCaoType === "thang"
          ? { thang: String(thang), nam: String(nam) }
          : { nam: String(nam) };

      const searchParams = new URLSearchParams(params as Record<string, string>);
      const url = `${baseUrl}/excel?${searchParams.toString()}`;

      const response = await api.get(url, { responseType: "blob" });
      const blob = new Blob([response.data], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download =
        baoCaoType === "thang"
          ? `baocao-thang-${thang}-${nam}.xlsx`
          : `baocao-nam-${nam}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch {
      alert("Xuất Excel thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // ================== DATA SAU SEARCH ==================
  const filteredReports = reports.filter((r) =>
    r.hoTen.toLowerCase().includes(search.toLowerCase())
  );

  // ================== TỔNG ==================
  const totalCong = filteredReports.reduce((s, r) => s + r.ngayCong, 0);
  const totalNghi = filteredReports.reduce((s, r) => s + r.ngayNghi, 0);
  const totalGioLT = filteredReports.reduce((s, r) => s + r.gioLamThem, 0);

  return (
    <AdminPage title="Báo cáo chấm công">
      {/* Bộ lọc */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            checked={baoCaoType === "thang"}
            onChange={() => setBaoCaoType("thang")}
          />
          <span>Báo cáo tháng</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            checked={baoCaoType === "nam"}
            onChange={() => setBaoCaoType("nam")}
          />
          <span>Báo cáo năm</span>
        </label>

        {baoCaoType === "thang" && (
          <>
            <select
              value={thang}
              onChange={(e) => setThang(Number(e.target.value))}
              className="border rounded px-3 py-1"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={nam}
              onChange={(e) => setNam(Number(e.target.value))}
              className="border rounded px-3 py-1 w-24"
              min={2000}
              max={2100}
            />
          </>
        )}

        {baoCaoType === "nam" && (
          <input
            type="number"
            value={nam}
            onChange={(e) => setNam(Number(e.target.value))}
            className="border rounded px-3 py-1 w-24"
            min={2000}
            max={2100}
          />
        )}

        <input
          type="text"
          placeholder="Tìm nhân viên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-1 flex-1"
        />

        <div className="ml-auto flex space-x-2">
          <button
            onClick={handleExportExcel}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl 
             bg-gradient-to-r from-green-500 to-emerald-600 
             text-white font-medium shadow-md
             hover:from-green-600 hover:to-emerald-700 
             active:scale-95 transition-all duration-300
             disabled:opacity-50 disabled:cursor-not-allowed
             flex items-center gap-2"
          >
            <FileExcelOutlined />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-gray-700 rounded-full"></div>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-red-600 font-semibold text-center my-4">{error}</p>}

      {/* Bảng */}
      {!loading && !error && filteredReports.length === 0 && (
        <p className="text-center text-gray-600">Không có dữ liệu báo cáo.</p>
      )}

      {!loading && filteredReports.length > 0 && (
        <div className="overflow-x-auto mb-6">
          <table className="w-full border border-gray-300 border-collapse text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="border p-3 text-left">Nhân viên</th>
                <th className="border p-3 text-right">Ngày công</th>
                <th className="border p-3 text-right">Ngày nghỉ</th>
                <th className="border p-3 text-right">Giờ làm thêm</th>
                <th className="border p-3 text-right">% đi làm</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r, i) => {
                const total = r.ngayCong + r.ngayNghi;
                const percent =
                  total > 0 ? ((r.ngayCong / total) * 100).toFixed(1) : "0";
                return (
                  <tr
                    key={i}
                    className={`${
                      i % 2 === 0 
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-700"
                    } ${Number(percent) < 50 ? "bg-red-100 dark:bg-red-900" : ""} text-gray-900 dark:text-gray-100`}
                  >
                    <td className="border p-3">{r.hoTen}</td>
                    <td className="border p-3 text-right">{r.ngayCong}</td>
                    <td className="border p-3 text-right">{r.ngayNghi}</td>
                    <td className="border p-3 text-right">{r.gioLamThem}</td>
                    <td className="border p-3 text-right">{percent}%</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-200 dark:bg-gray-600 font-bold text-gray-900 dark:text-gray-100">
              <tr>
                <td className="border p-3 text-right">Tổng</td>
                <td className="border p-3 text-right">{totalCong}</td>
                <td className="border p-3 text-right">{totalNghi}</td>
                <td className="border p-3 text-right">{totalGioLT}</td>
                <td className="border p-3 text-right">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Biểu đồ */}
{!loading && filteredReports.length > 0 && (
  <div className="h-96 bg-white dark:bg-gray-900 rounded-xl p-4 shadow-md">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={filteredReports} barSize={40}>
        {/* Trục X và Y */}
        <XAxis
          dataKey="hoTen"
          stroke="currentColor"
          className="text-gray-700 dark:text-gray-200"
        />
        <YAxis
          stroke="currentColor"
          className="text-gray-700 dark:text-gray-200"
        />

        {/* Tooltip */}
        <ChartTooltip
          contentStyle={{
            backgroundColor: "var(--tw-bg-white, #fff)",
            color: "var(--tw-text-gray-900, #000)",
            borderRadius: "0.5rem",
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        />

        {/* Legend */}
        <Legend
          wrapperStyle={{ paddingTop: "10px" }}
          iconType="circle"
          iconSize={10}
          formatter={(value) => (
              <span className="text-gray-800 dark:text-gray-200">{value}</span>
            )}
        />

        {/* Cột dữ liệu */}
        <Bar
          dataKey="ngayCong"
          fill="url(#greenGrad)"
          name="Ngày công"
          radius={[6, 6, 0, 0]}
        />
        <Bar
          dataKey="ngayNghi"
          fill="url(#redGrad)"
          name="Ngày nghỉ"
          radius={[6, 6, 0, 0]}
        />
        <Bar
          dataKey="gioLamThem"
          fill="url(#blueGrad)"
          name="Giờ làm thêm"
          radius={[6, 6, 0, 0]}
        />

        {/* Gradient */}
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
      </BarChart>
    </ResponsiveContainer>
  </div>
)}
    </AdminPage>
  );
}
