//(Phần cột bên phải hiển thị lịch sử)

import { FaHistory, FaMapMarkerAlt } from "react-icons/fa";
import { formatTime } from "@/utils/date";

interface HistorySidebarProps {
  attendanceRecord: { gioVao?: string; gioRa?: string };
}

export default function HistorySidebar({ attendanceRecord }: HistorySidebarProps) {
  return (
    <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-fit transition-colors duration-300">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-4">
        <FaHistory className="text-blue-500 dark:text-blue-400" /> Hoạt động hôm nay
      </h2>
      <div className="space-y-6">
        {attendanceRecord?.gioVao ? (
          <>
            <div className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 dark:bg-green-400 ring-4 ring-green-100 dark:ring-green-700"></div>
                <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 my-1 min-h-[30px]"></div>
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-100">Check-in</p>
                <p className="text-green-600 dark:text-green-400 font-bold text-lg">
                  {formatTime(attendanceRecord.gioVao)}
                </p>
              </div>
            </div>
            {attendanceRecord?.gioRa && (
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-orange-500 dark:bg-orange-400 ring-4 ring-orange-100 dark:ring-orange-700"></div>
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-100">Check-out</p>
                  <p className="text-orange-600 dark:text-orange-400 font-bold text-lg">
                    {formatTime(attendanceRecord.gioRa)}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
            <FaMapMarkerAlt className="text-4xl mb-3 opacity-50" />
            <p>Chưa có dữ liệu chấm công</p>
          </div>
        )}
      </div>
    </div>
  );
}