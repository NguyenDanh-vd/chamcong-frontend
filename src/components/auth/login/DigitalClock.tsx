import { useState, useEffect } from "react";

export default function DigitalClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return null;

  return (
    <div className="flex flex-col items-center gap-2 mb-4">
      <span className="text-gray-400 text-xs font-medium">Thời gian hiện tại:</span>
      <div className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-full text-sm font-semibold shadow-sm">
        {time.toLocaleTimeString("vi-VN", { hour12: false })}
        <span className="mx-2">•</span>
        <span className="capitalize">
          {time.toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}