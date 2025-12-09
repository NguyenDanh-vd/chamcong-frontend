"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/utils/api";
import AdminPage from "@/components/AdminPage";

// Import các component đã tách
import ReportFilters from "@/components/admin/bao-cao/ReportFilters";
import ReportTable, { ReportItem } from "@/components/admin/bao-cao/ReportTable";
import ReportChart from "@/components/admin/bao-cao/ReportChart";

type BaoCaoType = "thang" | "nam";

export default function AdminBaoCao() {
  // State quản lý Filters
  const [baoCaoType, setBaoCaoType] = useState<BaoCaoType>("thang");
  const [thang, setThang] = useState(new Date().getMonth() + 1);
  const [nam, setNam] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");

  // State quản lý Data
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- LOGIC FETCH DATA ---
  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = baoCaoType === "thang"
          ? `/baocao/thang?thang=${thang}&nam=${nam}`
          : `/baocao/nam?nam=${nam}`;
      const res = await api.get<ReportItem[]>(url);
      setReports(res.data);
    } catch {
      setError("Không thể tải dữ liệu báo cáo.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [baoCaoType, thang, nam]);

  // --- LOGIC EXPORT EXCEL ---
  const handleExportExcel = async () => {
  try {
    setLoading(true);
    const baseUrl = baoCaoType === "thang" ? "/baocao/thang/export" : "/baocao/nam/export";
    
    // FIX: Khai báo rõ kiểu Record<string, string> để TS không báo lỗi undefined
    const params: Record<string, string> = baoCaoType === "thang" 
      ? { thang: String(thang), nam: String(nam) } 
      : { nam: String(nam) };

    const searchParams = new URLSearchParams(params);
    
    // ... (phần còn lại giữ nguyên)
    const response = await api.get(`${baseUrl}/excel?${searchParams.toString()}`, { responseType: "blob" });
    
    const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `baocao-${baoCaoType}-${baoCaoType === "thang" ? `${thang}-` : ""}${nam}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(link.href);
    } catch {
      alert("Xuất Excel thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC SEARCH (Dùng useMemo để tối ưu) ---
  const filteredReports = useMemo(() => {
    return reports.filter((r) => r.hoTen.toLowerCase().includes(search.toLowerCase()));
  }, [reports, search]);

  return (
    <AdminPage title="Báo cáo & Thống kê">
      
      {/* 1. Bộ lọc & Công cụ */}
      <ReportFilters
        type={baoCaoType} setType={setBaoCaoType}
        month={thang} setMonth={setThang}
        year={nam} setYear={setNam}
        search={search} setSearch={setSearch}
        onExport={handleExportExcel}
        loading={loading}
      />

      {/* Thông báo lỗi */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6 text-center">
          {error}
        </div>
      )}

      {/* 2. Biểu đồ */}
      {!loading && !error && filteredReports.length > 0 && (
         <div className="mb-8 animate-in slide-in-from-bottom duration-500">
            <ReportChart data={filteredReports} />
         </div>
      )}

      {/* 3. Bảng dữ liệu */}
      <div className="animate-in slide-in-from-bottom duration-700 delay-100">
         <ReportTable data={filteredReports} loading={loading} />
      </div>

    </AdminPage>
  );
}