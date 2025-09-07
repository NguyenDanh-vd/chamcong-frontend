export function formatDuration(minutes: number | null): string {
  if (!minutes || minutes <= 0) return "-";

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h > 0 && m > 0) return `${h} giờ ${m} phút`;
  if (h > 0) return `${h} giờ`;
  return `${m} phút`;
}

// ✅ dành cho "Số giờ làm" khi backend trả về số thập phân (giờ)
export function formatHours(hours: number | null): string {
  if (!hours || hours <= 0) return "-";

  const h = Math.floor(hours); // phần nguyên giờ
  const m = Math.round((hours - h) * 60); // đổi phần lẻ sang phút

  if (h > 0 && m > 0) return `${h} giờ ${m} phút`;
  if (h > 0) return `${h} giờ`;
  return `${m} phút`;
}
