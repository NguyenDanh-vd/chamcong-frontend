import { STATUS_INFO } from "./history.utils";

interface HistoryFiltersProps {
  filter: string;
  setFilter: (val: string) => void;
  monthSelect: number | null;
  setMonthSelect: (val: number | null) => void;
  trangThai: string;
  setTrangThai: (val: string) => void;
}

const quickFilters = [
  { key: "all", label: "Tất cả" },
  { key: "week", label: "Tuần này" },
  { key: "month", label: "Tháng này" },
];

export default function HistoryFilters({
  filter,
  setFilter,
  monthSelect,
  setMonthSelect,
  trangThai,
  setTrangThai,
}: HistoryFiltersProps) {
  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_34px_-28px_rgba(2,132,199,0.45)]">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Bộ lọc lịch sử</p>

      <div className="mb-3 flex flex-wrap gap-2">
        {quickFilters.map((item) => {
          const active = filter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setFilter(item.key);
                if (item.key !== "month-select") setMonthSelect(null);
              }}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "border-sky-500 bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-md shadow-cyan-200/70"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300 hover:text-sky-700"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-600">Chọn tháng</span>
          <select
            value={monthSelect ?? ""}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value, 10) : null;
              setMonthSelect(val);
              setFilter(val !== null ? "month-select" : "all");
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          >
            <option value="">Tất cả tháng</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                Tháng {i + 1}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-600">Trạng thái</span>
          <select
            value={trangThai}
            onChange={(e) => setTrangThai(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
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
        </label>
      </div>
    </div>
  );
}
