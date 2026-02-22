export const STATUS_INFO: Record<string, { text: string; tone: string }> = {
  "hop-le": {
    text: "Hợp lệ",
    tone: "success",
  },
  "da-checkout": {
    text: "Đã check-out",
    tone: "success",
  },
  "di-tre": {
    text: "Đi trễ",
    tone: "danger",
  },
  "ve-som": {
    text: "Về sớm",
    tone: "warning",
  },
  "tre-va-ve-som": {
    text: "Trễ và về sớm",
    tone: "mixed",
  },
  "chua-xac-nhan": {
    text: "Chưa xác nhận",
    tone: "pending",
  },
  default: {
    text: "Không xác định",
    tone: "default",
  },
};

export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? (m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`) : `${m} phút`;
}

export function formatHours(hours: number | null | undefined): string {
  if (!hours || hours <= 0) return "-";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return h > 0 ? (m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`) : `${m} phút`;
}

export function getStatusClasses(tone: string): string {
  switch (tone) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "danger":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "warning":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "mixed":
      return "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}
