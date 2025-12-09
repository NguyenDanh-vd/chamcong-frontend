import { STATUS_INFO } from "./history.utils";

interface HistoryFiltersProps {
  filter: string;
  setFilter: (val: string) => void;
  monthSelect: number | null;
  setMonthSelect: (val: number | null) => void;
  trangThai: string;
  setTrangThai: (val: string) => void;
}

export default function HistoryFilters({
  filter,
  setFilter,
  monthSelect,
  setMonthSelect,
  trangThai,
  setTrangThai,
}: HistoryFiltersProps) {
  return (
    <>
      {/* Bộ lọc Thời gian */}
      <div className="mb-4 flex gap-2 flex-wrap items-center">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter("week")}
          className={`px-3 py-1 rounded ${
            filter === "week"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          }`}
        >
          Tuần này
        </button>
        <button
          onClick={() => setFilter("month")}
          className={`px-3 py-1 rounded ${
            filter === "month"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          }`}
        >
          Tháng này
        </button>
        <select
          value={monthSelect ?? ""}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value) : null;
            setMonthSelect(val);
            setFilter(val !== null ? "month-select" : "all");
          }}
          className="border px-2 py-1 rounded bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        >
          <option value="">Chọn tháng</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              Tháng {i + 1}
            </option>
          ))}
        </select>
      </div>

      {/* Lọc theo trạng thái */}
      <div className="mb-4">
        <select
          value={trangThai}
          onChange={(e) => setTrangThai(e.target.value)}
          className="border px-2 py-1 rounded w-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_INFO)
            .filter(([key]) => key !== "default")
            .map(([key, { text }]) => (
              <option key={key} value={key}>
                {text}
              </option>
            ))}
        </select>
      </div>
    </>
  );
}