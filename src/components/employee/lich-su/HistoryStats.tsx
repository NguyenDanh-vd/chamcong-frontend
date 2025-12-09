import { formatHours, formatDuration } from "./history.utils";

interface HistoryStatsProps {
  totalHours: number;
  totalLateMinutes: number;
  totalEarlyMinutes: number;
}

export default function HistoryStats({ totalHours, totalLateMinutes, totalEarlyMinutes }: HistoryStatsProps) {
  return (
    <div className="mb-4 flex flex-col gap-1">
      <h2 className="text-md font-medium">
        Tổng số giờ làm:{" "}
        <span className="text-blue-600 dark:text-blue-400">
          {formatHours(totalHours)}
        </span>
      </h2>
      {totalLateMinutes > 0 && (
        <h2 className="text-md font-medium">
          Tổng thời gian đi trễ:{" "}
          <span className="text-red-600 dark:text-red-400">
            {formatDuration(totalLateMinutes)}
          </span>
        </h2>
      )}
      {totalEarlyMinutes > 0 && (
        <h2 className="text-md font-medium">
          Tổng thời gian về sớm:{" "}
          <span className="text-orange-600 dark:text-orange-400">
            {formatDuration(totalEarlyMinutes)}
          </span>
        </h2>
      )}
    </div>
  );
}