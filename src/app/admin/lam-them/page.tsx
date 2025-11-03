"use client";
import React, { useEffect, useState, useRef } from "react"; // ✅ CẬP NHẬT: Thêm useRef
import api from "@/utils/api";
import { format } from "date-fns";
import AdminPage from "@/components/AdminPage";
import XLSX from "xlsx-js-style";
import { FileExcelOutlined } from "@ant-design/icons";
export default function AdminLamThem() {
  const [overtimes, setOvertimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  //  Ref cho checkbox "Chọn tất cả"
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

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

  const filteredOvertimes = overtimes.filter((ot) =>
    ot.nhanVien?.hoTen?.toLowerCase().includes(searchName.toLowerCase())
  );

  // Effect để cập nhật trạng thái của checkbox "Chọn tất cả"
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const numSelected = selectedIds.length;
      const numVisible = filteredOvertimes.length;
      selectAllCheckboxRef.current.checked = numSelected === numVisible && numVisible > 0;
      selectAllCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numVisible;
    }
  }, [selectedIds, filteredOvertimes]);


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

  const formatDate = (dateString: any) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : format(date, "dd/MM/yyyy");
  };

  // Hàm tạo Excel có style
  const exportToExcel = (rows: any[], fileName: string) => {
    if (rows.length === 0) {
      alert("⚠️ Không có dữ liệu để xuất Excel");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const headers = Object.keys(rows[0] || {});
    headers.forEach((header, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      if (!ws[cellAddress]) return;
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F81BD" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };
    });
    const colWidths = headers.map((h) => ({
      wch: Math.max(
        h.length,
        ...rows.map((row) => (row[h] ? row[h].toString().length : 0))
      ) + 2,
    }));
    ws["!cols"] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LamThem");
    XLSX.writeFile(wb, fileName);
  };

  // Export toàn bộ
  const exportAllToExcel = () => {
    const data = overtimes.map((ot) => ({
      "Mã đơn": ot.maLT,
      "Tên nhân viên": ot.nhanVien?.hoTen,
      "Ngày": formatDate(ot.ngay),
      "Giờ bắt đầu": ot.gioBatDau,
      "Giờ kết thúc": ot.gioKetThuc,
      "Số giờ": ot.soGio,
      "Lý do": ot.lyDo,
      "Trạng thái":
        ot.trangThai === "cho-duyet"
          ? "Chờ duyệt"
          : ot.trangThai === "da-duyet"
          ? "Đã duyệt"
          : "Từ chối",
    }));
    exportToExcel(data, "danh_sach_lam_them.xlsx");
  };

  // Export theo checkbox
  const exportSelectedToExcel = () => {
    const data = overtimes
      .filter((ot) => selectedIds.includes(ot.maLT))
      .map((ot) => ({
        "Mã đơn": ot.maLT,
        "Tên nhân viên": ot.nhanVien?.hoTen,
        "Ngày": formatDate(ot.ngay),
        "Giờ bắt đầu": ot.gioBatDau,
        "Giờ kết thúc": ot.gioKetThuc,
        "Số giờ": ot.soGio,
        "Lý do": ot.lyDo,
        "Trạng thái":
          ot.trangThai === "cho-duyet"
            ? "Chờ duyệt"
            : ot.trangThai === "da-duyet"
            ? "Đã duyệt"
            : "Từ chối",
      }));

    if (data.length === 0) {
      alert("⚠️ Chưa chọn đơn nào để xuất Excel");
      return;
    }
    exportToExcel(data, "lam_them_da_chon.xlsx");
  };

  // Hàm xử lý khi nhấn vào checkbox "Chọn tất cả"
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allVisibleIds = filteredOvertimes.map((ot) => ot.maLT);
      setSelectedIds(allVisibleIds);
    } else {
      setSelectedIds([]);
    }
  };

  if (loading) return <p>⏳ Đang tải...</p>;

  return (
    <AdminPage title="Quản lý đơn làm thêm">
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-4">
        <input
          type="text"
          placeholder="🔍 Tìm theo tên nhân viên"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-64"
        />
        <button
          onClick={exportAllToExcel}
          style={{
              background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "10px 20px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
            onMouseEnter={(e) => {
             (e.currentTarget as HTMLButtonElement).style.opacity = "0.95";
             (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
             (e.currentTarget as HTMLButtonElement).style.opacity = "1";
             (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
          <FileExcelOutlined />
           Xuất toàn bộ
        </button>
        <button
          onClick={exportSelectedToExcel}
          disabled={selectedIds.length === 0}
          style={{
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff",
          border: "none",
          fontWeight: 600,
          borderRadius: "8px",
          padding: "10px 20px",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "15px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          opacity: selectedIds.length === 0 ? 0.5 : 1, // khi disabled thì mờ
          cursor: selectedIds.length === 0 ? "not-allowed" : "pointer",
          transition: "all 0.2s ease-in-out",
          }}
           onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "0.95";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          }}
           onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
          >
          <FileExcelOutlined />
          Xuất đã chọn
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        {/* THÊM MỚI: Checkbox "Chọn tất cả" */}
        {filteredOvertimes.length > 0 && (
          <div className="flex items-center gap-2 border-r pr-4">
            <input
              ref={selectAllCheckboxRef}
              type="checkbox"
              onChange={handleSelectAll}
              className="h-3 w-3"
            />
            <label className="font-medium">Chọn tất cả</label>
          </div>
        )}
        
        <button
          disabled={selectedIds.length === 0}
          onClick={() => bulkUpdate("da-duyet")}
          style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "10px 20px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              opacity: selectedIds.length === 0 ? 0.5 : 1, // khi disabled thì mờ
              cursor: selectedIds.length === 0 ? "not-allowed" : "pointer",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
             (e.currentTarget as HTMLButtonElement).style.opacity = "0.95";
             (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
             (e.currentTarget as HTMLButtonElement).style.opacity = "1";
             (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
        >
          ✅ Duyệt hàng loạt ({selectedIds.length})
        </button>
        <button
          disabled={selectedIds.length === 0}
          onClick={() => bulkUpdate("tu-choi")}
          style={{
              background: "linear-gradient(135deg, #ef4444, #b91c1c)", 
              color: "#fff",
              border: "none",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "10px 20px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              opacity: selectedIds.length === 0 ? 0.5 : 1, // khi disabled thì mờ
              cursor: selectedIds.length === 0 ? "not-allowed" : "pointer",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
             (e.currentTarget as HTMLButtonElement).style.opacity = "0.95";
             (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
             (e.currentTarget as HTMLButtonElement).style.opacity = "1";
             (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
        >
          ❌ Từ chối hàng loạt ({selectedIds.length})
        </button>
      </div>

      {filteredOvertimes.length === 0 ? (
        <p className="text-gray-500">Không có đơn làm thêm nào.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredOvertimes.map((ot) => (
            <div
              key={ot.maLT}
              className={`leave-card shadow rounded-xl border p-5 hover:shadow-lg transition ${
                selectedIds.includes(ot.maLT) ? 'border-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(ot.maLT)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds([...selectedIds, ot.maLT]);
                      } else {
                        setSelectedIds(
                          selectedIds.filter((id) => id !== ot.maLT)
                        );
                      }
                    }}
                    className="h-3 w-3"
                  />
                  <h2 className="text-lg font-semibold text-gray-800">
                    {ot.nhanVien?.hoTen || "Không có tên"}
                  </h2>
                </div>

                <span
                  className={`status-tag ${
                    ot.trangThai === "da-duyet"
                      ? "status-approved"
                      : ot.trangThai === "cho-duyet"
                      ? "status-pending"
                      : "status-rejected"
                  }`}
                >
                  {ot.trangThai === "da-duyet"
                    ? "✅ Đã duyệt"
                    : ot.trangThai === "cho-duyet"
                    ? "⏳ Chờ duyệt"
                    : "❌ Từ chối"}
                </span>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p><b>Ngày:</b> {formatDate(ot.ngay)}</p>
                <p><b>Số giờ:</b> {ot.soGio || 0} giờ</p>
                <p><b>Lý do:</b> {ot.lyDo || "Không có lý do"}</p>
              </div>

              {ot.trangThai === "cho-duyet" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleUpdate(ot.maLT, "da-duyet")}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    ✅ Duyệt
                  </button>
                  <button
                    onClick={() => handleUpdate(ot.maLT, "tu-choi")}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    ❌ Từ chối
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminPage>
  );
}