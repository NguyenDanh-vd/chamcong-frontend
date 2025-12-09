import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/vi";

// 1. Cấu hình Plugin
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(updateLocale);

// 2. Cài đặt ngôn ngữ và múi giờ mặc định
dayjs.locale("vi");
const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

// 3. Cập nhật tên thứ tiếng Việt
dayjs.updateLocale("vi", {
  weekdays: [
    "Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư",
    "Thứ Năm", "Thứ Sáu", "Thứ Bảy",
  ],
});

export const toVN = (input?: string | Date | dayjs.Dayjs | null) => {
  if (!input) return null;

  if (typeof input === "string" && input.length <= 8 && input.includes(":")) {
    const today = dayjs().tz(VN_TIMEZONE).format("YYYY-MM-DD");
    return dayjs(`${today}T${input}`);
  }

  const d = dayjs(input).tz(VN_TIMEZONE);
  return d.isValid() ? d : null;
};


export const formatTime = (
  date?: string | Date | null,
  format = "HH:mm"
) => {
  if (!date) return "--:--";

  if (typeof date === "string" && date.length <= 8 && date.includes(":")) {
    const today = dayjs().tz(VN_TIMEZONE).format("YYYY-MM-DD");
    return dayjs(`${today}T${date}`).format(format);
  }

  const d = dayjs(date).utc(); 

  return d.isValid() ? d.format(format) : "--:--";
};


export const formatDate = (
  date?: string | Date | null,
  format = "DD/MM/YYYY"
) => {
  if (!date) return "--/--/----";

  const d = dayjs(date).utc();
  
  return d.isValid() ? d.format(format) : "--/--/----";
};

export default dayjs;