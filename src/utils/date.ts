// utils/date.ts
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

export const toVN7 = (date?: string | Date | dayjs.Dayjs | null) => {
  if (!date) return null;
  return dayjs(date).tz(VN_TIMEZONE);
};

export const formatTime = (date?: string | Date | null, format = "HH:mm:ss") => {
  if (!date) return "--:--:--";
  return dayjs(date).tz(VN_TIMEZONE).format(format);
};

export const formatDate = (date?: string | Date | null, format = "DD/MM/YYYY") => {
  if (!date) return "--/--/----";
  return dayjs(date).tz(VN_TIMEZONE).format(format);
};

export default dayjs;