"use client";
import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import { format } from "date-fns";
import AdminPage from "@/components/AdminPage";
import XLSX from "xlsx-js-style";

// Import Components đã tách
import OvertimeFilters from "@/components/admin/lam-them/OvertimeFilters";
import OvertimeList, { OvertimeItem } from "@/components/admin/lam-them/OvertimeList";

export default function AdminLamThem() {
  const [overtimes, setOvertimes] = useState<OvertimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchOvertimes = () => {
    setLoading(true);
    api
      .get("/lamthem/")
      .then((res) => setOvertimes(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOvertimes();
  }, []);

  // Filter Data
  const filteredOvertimes = overtimes.filter((ot) =>
    ot.nhanVien?.hoTen?.toLowerCase().includes(searchName.toLowerCase())
  );

  // Logic Select All Checkbox
  const numSelected = selectedIds.length;
  const numVisible = filteredOvertimes.length;
  const isAllSelected = numSelected === numVisible && numVisible > 0;
  const isIndeterminate = numSelected > 0 && numSelected < numVisible;

  // Handlers
  const handleUpdate = async (id: number, status: string) => {
    try {
      await api.put(`/lamthem/duyet/${id}`, { trangThai: status });
      fetchOvertimes();
      setSelectedIds((ids) => ids.filter((i) => i !== id));
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật trạng thái");
    }
  };

  const bulkUpdate = async (status: string) => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          api.put(`/lamthem/duyet/${id}`, { trangThai: status })
        )
      );
      alert("✅ Cập nhật hàng loạt thành công");
      setSelectedIds([]);
      fetchOvertimes();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi cập nhật hàng loạt");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredOvertimes.map((ot) => ot.maLT));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    }
  };

  // Logic Excel
  const formatDate = (dateString: any) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : format(date, "dd/MM/yyyy");
  };

  const exportToExcel = (rows: any[], fileName: string) => {
    if (rows.length === 0) {
      alert("⚠️ Không có dữ liệu để xuất Excel");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const headers = Object.keys(rows[0] || {});
    
    // Style Header
    headers.forEach((header, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
        if (!ws[cellAddress]) return;
        ws[cellAddress].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4F81BD" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: { top: { style: "thin", color: { rgb: "000000" } }, bottom: { style: "thin", color: { rgb: "000000" } }, left: { style: "thin", color: { rgb: "000000" } }, right: { style: "thin", color: { rgb: "000000" } } }
        };
    });

    // Auto Width
    ws["!cols"] = headers.map((h) => ({
      wch: Math.max(h.length, ...rows.map((row) => (row[h] ? row[h].toString().length : 0))) + 2,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LamThem");
    XLSX.writeFile(wb, fileName);
  };

  const getExportData = (sourceData: OvertimeItem[]) => {
    return sourceData.map((ot) => ({
        "Mã đơn": ot.maLT,
        "Tên nhân viên": ot.nhanVien?.hoTen,
        "Ngày": formatDate(ot.ngay),
        "Giờ bắt đầu": ot.gioBatDau,
        "Giờ kết thúc": ot.gioKetThuc,
        "Số giờ": ot.soGio,
        "Lý do": ot.lyDo,
        "Trạng thái": ot.trangThai === "cho-duyet" ? "Chờ duyệt" : ot.trangThai === "da-duyet" ? "Đã duyệt" : "Từ chối",
    }));
  };

  return (
    <AdminPage title="Quản lý đơn làm thêm">
      {loading ? (
        <p className="text-center py-10">⏳ Đang tải dữ liệu...</p>
      ) : (
        <>
          <OvertimeFilters 
            searchName={searchName}
            setSearchName={setSearchName}
            selectedCount={selectedIds.length}
            hasData={filteredOvertimes.length > 0}
            onExportAll={() => exportToExcel(getExportData(overtimes), "danh_sach_lam_them.xlsx")}
            onExportSelected={() => exportToExcel(getExportData(overtimes.filter(ot => selectedIds.includes(ot.maLT))), "lam_them_da_chon.xlsx")}
            onBulkUpdate={bulkUpdate}
            onSelectAll={handleSelectAll}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
          />

          <OvertimeList 
            data={filteredOvertimes}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onUpdateStatus={handleUpdate}
          />
        </>
      )}
    </AdminPage>
  );
}