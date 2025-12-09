import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/vi";

dayjs.extend(updateLocale);
dayjs.locale("vi");

dayjs.updateLocale("vi", {
  weekdays: [
    "Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư",
    "Thứ Năm","Thứ Sáu","Thứ Bảy",
  ]
});


export const formatTime = (date?: any, format = "HH:mm") => {
  if (!date) return "--:--";
  const d = dayjs(date);
  return d.isValid() ? d.format(format) : "--:--";
};

export const formatDate = (date?: any, format = "DD/MM/YYYY") => {
  if (!date) return "--/--/----";
  const d = dayjs(date);
  return d.isValid() ? d.format(format) : "--/--/----";
};

export default dayjs;
