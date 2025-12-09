//Component này chứa toàn bộ các nút điều khiển phía trên.

import { FileExcelOutlined } from "@ant-design/icons";

interface LeaveFiltersProps {
  searchName: string;
  setSearchName: (val: string) => void;
  selectedCount: number;
  hasData: boolean;
  onExportAll: () => void;
  onExportSelected: () => void;
  onBulkUpdate: (status: string) => void;
  onSelectAll: (checked: boolean) => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

export default function LeaveFilters({
  searchName,
  setSearchName,
  selectedCount,
  hasData,
  onExportAll,
  onExportSelected,
  onBulkUpdate,
  onSelectAll,
  isAllSelected,
  isIndeterminate,
}: LeaveFiltersProps) {
  return (
    <>
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-4">
        <input
          type="text"
          placeholder="🔍 Tìm theo tên nhân viên"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-64"
        />
        <button
          onClick={onExportAll}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg px-5 py-2 flex items-center gap-2 hover:opacity-90 shadow-md transition-transform active:scale-95"
        >
          <FileExcelOutlined /> Xuất toàn bộ
        </button>
        <button
          onClick={onExportSelected}
          disabled={selectedCount === 0}
          className={`bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg px-5 py-2 flex items-center gap-2 shadow-md transition-all ${
            selectedCount === 0 ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 active:scale-95"
          }`}
        >
          <FileExcelOutlined /> Xuất đã chọn
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {hasData && (
          <div className="flex items-center gap-2 border-r pr-4 border-gray-300">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) input.indeterminate = isIndeterminate;
              }}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            <label className="font-medium text-gray-700">Chọn tất cả</label>
          </div>
        )}

        <button
          disabled={selectedCount === 0}
          onClick={() => onBulkUpdate("da-duyet")}
          className={`bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg px-5 py-2 flex items-center gap-2 shadow-md transition-all ${
            selectedCount === 0 ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 active:scale-95"
          }`}
        >
          ✅ Duyệt hàng loạt ({selectedCount})
        </button>
        <button
          disabled={selectedCount === 0}
          onClick={() => onBulkUpdate("tu-choi")}
          className={`bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-lg px-5 py-2 flex items-center gap-2 shadow-md transition-all ${
            selectedCount === 0 ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 active:scale-95"
          }`}
        >
          ❌ Từ chối hàng loạt ({selectedCount})
        </button>
      </div>
    </>
  );
}