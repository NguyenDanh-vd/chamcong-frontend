//(Phần 2 hộp Giờ vào - Giờ ra)

import { formatTime } from "@/utils/date";

interface AttendanceStatsProps {
  attendanceRecord: { gioVao?: string; gioRa?: string };
}

export default function AttendanceStats({ attendanceRecord }: AttendanceStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
      <div className="bg-green-50 dark:bg-green-900 p-5 rounded-2xl border border-green-100 dark:border-green-700 flex flex-col items-center transition-colors duration-300">
        <span className="text-sm text-green-600 dark:text-green-400 font-bold uppercase mb-1">
          Giờ vào
        </span>
        <span className="text-2xl font-bold text-green-800 dark:text-green-300">
          {attendanceRecord?.gioVao ? formatTime(attendanceRecord.gioVao) : "--:--"}
        </span>
      </div>
      <div className="bg-orange-50 dark:bg-orange-900 p-5 rounded-2xl border border-orange-100 dark:border-orange-700 flex flex-col items-center transition-colors duration-300">
        <span className="text-sm text-orange-600 dark:text-orange-400 font-bold uppercase mb-1">
          Giờ ra
        </span>
        <span className="text-2xl font-bold text-orange-800 dark:text-orange-300">
          {attendanceRecord?.gioRa ? formatTime(attendanceRecord.gioRa) : "--:--"}
        </span>
      </div>
    </div>
  );
}