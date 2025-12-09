import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/vi";

// 1. Kích hoạt Plugin
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(updateLocale);

dayjs.locale("vi");
const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

dayjs.updateLocale("vi", {
  weekdays: [
    "Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"
  ]
});

export const toVN7 = (date?: string | Date | dayjs.Dayjs | null) => {
  if (!date) return null;
  const d = dayjs(date).tz(VN_TIMEZONE);
  return d.isValid() ? d : null;
};

export const formatTime = (date?: string | Date | null, format = "HH:mm") => {
  if (!date) return "--:--";

  // TRƯỜNG HỢP 1: Dữ liệu chỉ có giờ (VD: "08:00:00" từ SQL Time)
  if (typeof date === "string" && date.includes(":") && date.length <= 8) {
    const today = dayjs().format("YYYY-MM-DD");
    const d = dayjs(`${today}T${date}`).tz(VN_TIMEZONE);
    return d.isValid() ? d.format(format) : "--:--";
  }

  // TRƯỜNG HỢP 2: Dữ liệu ngày giờ đầy đủ
  const d = dayjs(date).tz(VN_TIMEZONE);
  
  // Quan trọng: Kiểm tra hợp lệ trước khi format
  return d.isValid() ? d.format(format) : "--:--";
};

export const formatDate = (date?: string | Date | null, format = "DD/MM/YYYY") => {
  if (!date) return "--/--/----";
  
  const d = dayjs(date).tz(VN_TIMEZONE);
  // Quan trọng: Kiểm tra hợp lệ trước khi format
  return d.isValid() ? d.format(format) : "--/--/----";
};

export default dayjs;