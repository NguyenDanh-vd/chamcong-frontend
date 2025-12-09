// Định nghĩa màu sắc và text cho trạng thái
export const STATUS_INFO: Record<string, { text: string; style: string; icon: string }> = {
  "hop-le": {
    text: "Hợp lệ",
    style: "border-green-400 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    icon: "✅",
  },
  "da-checkout": {
    text: "Đã check-out",
    style: "border-green-400 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    icon: "✅",
  },
  "di-tre": {
    text: "Đi trễ",
    style: "border-red-400 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    icon: "❌",
  },
  "ve-som": {
    text: "Về sớm",
    style: "border-orange-400 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    icon: "⚠️",
  },
  "tre-va-ve-som": {
    text: "Trễ và Về sớm",
    style: "border-fuchsia-400 bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300",
    icon: "❗",
  },
  "chua-xac-nhan": {
    text: "Chưa xác nhận",
    style: "border-yellow-400 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    icon: "⏳",
  },
  default: {
    text: "Không xác định",
    style: "border-gray-300 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    icon: "❔",
  },
};

export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0
    ? m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`
    : `${m} phút`;
}

export function formatHours(hours: number | null | undefined): string {
  if (!hours || hours <= 0) return "-";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return h > 0
    ? m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`
    : `${m} phút`;
}