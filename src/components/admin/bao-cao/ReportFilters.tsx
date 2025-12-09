//File này sẽ gom gọn toàn bộ phần điều khiển phía trên.

import { FileExcelOutlined } from "@ant-design/icons";

interface ReportFiltersProps {
  type: "thang" | "nam";
  setType: (val: "thang" | "nam") => void;
  month: number;
  setMonth: (val: number) => void;
  year: number;
  setYear: (val: number) => void;
  search: string;
  setSearch: (val: string) => void;
  onExport: () => void;
  loading: boolean;
}

export default function ReportFilters({
  type, setType, month, setMonth, year, setYear, search, setSearch, onExport, loading
}: ReportFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      {/* Loại báo cáo */}
      <div className="flex gap-4 border-r border-gray-200 dark:border-gray-600 pr-4">
        <label className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200">
          <input
            type="radio"
            checked={type === "thang"}
            onChange={() => setType("thang")}
            className="accent-blue-600"
          />
          <span>Theo Tháng</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200">
          <input
            type="radio"
            checked={type === "nam"}
            onChange={() => setType("nam")}
            className="accent-blue-600"
          />
          <span>Theo Năm</span>
        </label>
      </div>

      {/* Chọn thời gian */}
      <div className="flex gap-2">
        {type === "thang" && (
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </select>
        )}
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 w-24 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
          min={2000}
          max={2100}
        />
      </div>

      {/* Tìm kiếm */}
      <input
        type="text"
        placeholder="Tìm tên nhân viên..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-lg px-3 py-2 flex-1 min-w-[200px] bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Nút Xuất Excel */}
      <button
        onClick={onExport}
        disabled={loading}
        className="px-5 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium shadow hover:from-green-700 hover:to-emerald-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? (
           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
           <FileExcelOutlined />
        )}
        <span>Xuất Excel</span>
      </button>
    </div>
  );
}