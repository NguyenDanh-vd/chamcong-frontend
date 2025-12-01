import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const VN_TZ = "Asia/Ho_Chi_Minh";

export const toVN7 = (v?: string | Date | number | null) => {
  if (!v) return null;
  const d = dayjs(v).tz(VN_TZ);
  return d.isValid() ? d : null;
};

export const formatTime = (v?: string | Date | null) => {
  const d = toVN7(v);
  return d ? d.format("HH:mm") : "--:--";
};

export const formatTimeFull = (v?: string | Date | null) => {
  const d = toVN7(v);
  return d ? d.format("HH:mm:ss") : "--:--:--";
};
