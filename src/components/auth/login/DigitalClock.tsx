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
    <div className="mb-2 flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-slate-400">Thời gian hiện tại:</span>
      <div className="rounded-full bg-sky-50 px-6 py-2 text-sm font-semibold text-sky-700 shadow-sm">
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
