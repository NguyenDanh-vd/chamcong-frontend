//Component này hiển thị danh sách các Card đơn nghỉ phép.

import { format } from "date-fns";

export interface LeaveItem {
  maDon: number;
  nhanVien: { hoTen: string };
  ngayBatDau: string;
  ngayKetThuc: string;
  lyDo: string;
  trangThai: string;
}

interface LeaveListProps {
  data: LeaveItem[];
  selectedIds: number[];
  onToggleSelect: (id: number, checked: boolean) => void;
  onUpdateStatus: (id: number, status: string) => void;
}

export default function LeaveList({
  data,
  selectedIds,
  onToggleSelect,
  onUpdateStatus,
}: LeaveListProps) {
  const formatDate = (dateString: any) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : format(date, "dd/MM/yyyy");
  };

  if (data.length === 0) {
    return <p className="text-gray-500 text-center py-10">Không có đơn nghỉ phép nào.</p>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {data.map((l) => (
        <div
          key={l.maDon}
          className={`shadow rounded-xl border p-5 hover:shadow-lg transition bg-white ${
            selectedIds.includes(l.maDon) ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.includes(l.maDon)}
                onChange={(e) => onToggleSelect(l.maDon, e.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
              <h2 className="text-lg font-semibold text-gray-800">
                {l.nhanVien?.hoTen || "Không có tên"}
              </h2>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                l.trangThai === "da-duyet"
                  ? "bg-green-100 text-green-700"
                  : l.trangThai === "cho-duyet"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {l.trangThai === "da-duyet"
                ? "✅ Đã duyệt"
                : l.trangThai === "cho-duyet"
                ? "⏳ Chờ duyệt"
                : "❌ Từ chối"}
            </span>
          </div>

          <div className="text-sm text-gray-600 space-y-1 ml-6">
            <p><b>Từ ngày:</b> {formatDate(l.ngayBatDau)}</p>
            <p><b>Đến ngày:</b> {formatDate(l.ngayKetThuc)}</p>
            <p><b>Lý do:</b> {l.lyDo || "Không có lý do"}</p>
          </div>

          {l.trangThai === "cho-duyet" && (
            <div className="mt-4 flex gap-2 ml-6">
              <button
                onClick={() => onUpdateStatus(l.maDon, "da-duyet")}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
              >
                ✅ Duyệt
              </button>
              <button
                onClick={() => onUpdateStatus(l.maDon, "tu-choi")}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
              >
                ❌ Từ chối
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}