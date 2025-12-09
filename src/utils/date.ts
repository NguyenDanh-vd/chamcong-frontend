import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/vi";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(updateLocale);

dayjs.locale("vi");

const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

// Cập nhật tên thứ
dayjs.updateLocale("vi", {
  weekdays: [
    "Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư",
    "Thứ Năm","Thứ Sáu","Thứ Bảy",
  ]
});

/**
 * toVN: Chỉ dùng cho giờ lẻ (HH:mm:ss), KHÔNG sử dụng cho datetime DB!
 */
export const toVN = (input?: string | Date | dayjs.Dayjs | null) => {
  if (!input) return null;

  // Nếu input chỉ là HH:mm:ss
  if (typeof input === "string" && input.length <= 8 && input.includes(":")) {
    const today = dayjs().format("YYYY-MM-DD");
    return dayjs(`${today}T${input}`); // KHÔNG .tz !
  }

  // Datetime từ DB — giữ nguyên, KHÔNG đổi timezone
  const d = dayjs(input);
  return d.isValid() ? d : null;
};

/**
 * formatTime — dùng cho cả HH:mm:ss & datetime DB
 */
export const formatTime = (
  date?: string | Date | null,
  format = "HH:mm"
) => {
  if (!date) return "--:--";

  // Nếu chỉ là HH:mm:ss → convert trong ngày hiện tại (KHÔNG tz)
  if (typeof date === "string" && date.length <= 8 && date.includes(":")) {
    const today = dayjs().format("YYYY-MM-DD");
    return dayjs(`${today}T${date}`).format(format);
  }

  // Datetime DB: hiển thị nguyên bản
  const d = dayjs(date);
  return d.isValid() ? d.format(format) : "--:--";
};

export const formatDate = (
  date?: string | Date | null,
  format = "DD/MM/YYYY"
) => {
  if (!date) return "--/--/----";

  const d = dayjs(date);
  return d.isValid() ? d.format(format) : "--/--/----";
};

export default dayjs;
