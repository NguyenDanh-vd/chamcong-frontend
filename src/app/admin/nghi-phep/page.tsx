"use client";
import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import { format } from "date-fns";
import AdminPage from "@/components/AdminPage";
import XLSX from "xlsx-js-style";

// Import Components đã tách
import LeaveFilters from "@/components/admin/nghi-phep/LeaveFilters";
import LeaveList, { LeaveItem } from "@/components/admin/nghi-phep/LeaveList";

export default function AdminNghiPhep() {
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchLeaves = () => {
    setLoading(true);
    api
      .get("/nghiphep")
      .then((res) => setLeaves(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Filter Data
  const filteredLeaves = leaves.filter((l) =>
    l.nhanVien?.hoTen?.toLowerCase().includes(searchName.toLowerCase())
  );

  // Logic Select All Checkbox
  const numSelected = selectedIds.length;
  const numVisible = filteredLeaves.length;
  const isAllSelected = numSelected === numVisible && numVisible > 0;
  const isIndeterminate = numSelected > 0 && numSelected < numVisible;

  // Handlers
  const handleUpdate = async (maDon: number, status: string) => {
    try {
      await api.put(`/nghiphep/duyet/${maDon}`, { trangThai: status });
      fetchLeaves();
      setSelectedIds((ids) => ids.filter((id) => id !== maDon));
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật trạng thái");
    }
  };

  const bulkUpdate = async (status: string) => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          api.put(`/nghiphep/duyet/${id}`, { trangThai: status })
        )
      );
      alert("✅ Cập nhật hàng loạt thành công");
      setSelectedIds([]);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi cập nhật hàng loạt");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredLeaves.map((l) => l.maDon));
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
    XLSX.utils.book_append_sheet(wb, ws, "NghiPhep");
    XLSX.writeFile(wb, fileName);
  };

  const getExportData = (sourceData: LeaveItem[]) => {
    return sourceData.map((l) => ({
        "Mã đơn": l.maDon,
        "Tên nhân viên": l.nhanVien?.hoTen,
        "Ngày bắt đầu": formatDate(l.ngayBatDau),
        "Ngày kết thúc": formatDate(l.ngayKetThuc),
        "Lý do": l.lyDo,
        "Trạng thái": l.trangThai === "cho-duyet" ? "Chờ duyệt" : l.trangThai === "da-duyet" ? "Đã duyệt" : "Từ chối",
    }));
  };

  return (
    <AdminPage title="Quản lý đơn nghỉ phép">
      {loading ? (
        <p className="text-center py-10">⏳ Đang tải dữ liệu...</p>
      ) : (
        <>
          <LeaveFilters 
            searchName={searchName}
            setSearchName={setSearchName}
            selectedCount={selectedIds.length}
            hasData={filteredLeaves.length > 0}
            onExportAll={() => exportToExcel(getExportData(leaves), "danh_sach_nghi_phep.xlsx")}
            onExportSelected={() => exportToExcel(getExportData(leaves.filter(l => selectedIds.includes(l.maDon))), "nghi_phep_da_chon.xlsx")}
            onBulkUpdate={bulkUpdate}
            onSelectAll={handleSelectAll}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
          />

          <LeaveList 
            data={filteredLeaves}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onUpdateStatus={handleUpdate}
          />
        </>
      )}
    </AdminPage>
  );
}