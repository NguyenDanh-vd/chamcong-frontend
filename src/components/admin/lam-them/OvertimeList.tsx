//Component này hiển thị danh sách các Card đơn làm thêm.

import { format } from "date-fns";

export interface OvertimeItem {
  maLT: number;
  nhanVien: { hoTen: string };
  ngay: string;
  gioBatDau: string;
  gioKetThuc: string;
  soGio: number;
  lyDo: string;
  trangThai: string;
}

interface OvertimeListProps {
  data: OvertimeItem[];
  selectedIds: number[];
  onToggleSelect: (id: number, checked: boolean) => void;
  onUpdateStatus: (id: number, status: string) => void;
}

export default function OvertimeList({
  data,
  selectedIds,
  onToggleSelect,
  onUpdateStatus,
}: OvertimeListProps) {
  const formatDate = (dateString: any) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : format(date, "dd/MM/yyyy");
  };

  if (data.length === 0) {
    return <p className="text-gray-500 text-center py-10">Không có đơn làm thêm nào.</p>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {data.map((ot) => (
        <div
          key={ot.maLT}
          className={`shadow rounded-xl border p-5 hover:shadow-lg transition bg-white ${
            selectedIds.includes(ot.maLT) ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.includes(ot.maLT)}
                onChange={(e) => onToggleSelect(ot.maLT, e.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
              <h2 className="text-lg font-semibold text-gray-800">
                {ot.nhanVien?.hoTen || "Không có tên"}
              </h2>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                ot.trangThai === "da-duyet"
                  ? "bg-green-100 text-green-700"
                  : ot.trangThai === "cho-duyet"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {ot.trangThai === "da-duyet"
                ? "✅ Đã duyệt"
                : ot.trangThai === "cho-duyet"
                ? "⏳ Chờ duyệt"
                : "❌ Từ chối"}
            </span>
          </div>

          <div className="text-sm text-gray-600 space-y-1 ml-6">
            <p><b>Ngày:</b> {formatDate(ot.ngay)}</p>
            <p><b>Thời gian:</b> {ot.gioBatDau} - {ot.gioKetThuc} ({ot.soGio || 0} giờ)</p>
            <p><b>Lý do:</b> {ot.lyDo || "Không có lý do"}</p>
          </div>

          {ot.trangThai === "cho-duyet" && (
            <div className="mt-4 flex gap-2 ml-6">
              <button
                onClick={() => onUpdateStatus(ot.maLT, "da-duyet")}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
              >
                ✅ Duyệt
              </button>
              <button
                onClick={() => onUpdateStatus(ot.maLT, "tu-choi")}
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