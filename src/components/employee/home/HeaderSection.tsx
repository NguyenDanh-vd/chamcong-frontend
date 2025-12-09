//(Phần hiển thị giờ và tên nhân viên)

import { MdWork, MdPerson } from "react-icons/md";

interface HeaderSectionProps {
  timeStr: string;
  dateStr: string;
  user: any;
}

export default function HeaderSection({ timeStr, dateStr, user }: HeaderSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 w-full gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
      <div className="flex flex-col">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600 tracking-tight min-h-[40px]">
          {timeStr}
        </h1>
        <p className="text-gray-500 font-medium text-sm sm:text-base">{dateStr}</p>
      </div>
      <div className="flex flex-row items-center gap-4">
        <div className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-300 font-bold">
          <MdWork className="text-blue-500" />
          <span>IT-Global</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 text-gray-700 dark:text-gray-200 font-bold">
          <MdPerson className="text-blue-500" />
          <span>{user?.hoTen || "..."}</span>
        </div>
      </div>
    </div>
  );
}