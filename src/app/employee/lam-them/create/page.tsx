"use client";

import { useState, useEffect } from "react";
import api from "@/utils/api";
import { getUserFromToken } from "@/utils/auth";
import { useRouter } from "next/navigation";
import {
  FaPaperPlane,
  FaTimesCircle,
  FaCheckCircle,
  FaSpinner,
  FaRegCalendarAlt,
} from "react-icons/fa";
import { MdArrowBack, MdAccessTime, MdOutlinePostAdd } from "react-icons/md";
import clsx from "clsx";
import MobileLayout from "@/layouts/MobileLayout";
import CustomButton from "@/components/CustomButton";

export default function CreateOvertimePage() {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [hours, setHours] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:opacity-60";
  const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

  useEffect(() => {
    if (date && startTime && endTime) {
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);
      if (end > start) {
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        setHours(diff.toFixed(1));
      } else {
        setHours("");
      }
    }
  }, [date, startTime, endTime]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    if (countdown === 1) router.push("/employee/lam-them");
    return () => clearInterval(timer);
  }, [countdown, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const user = getUserFromToken();
    if (!user) {
      setMessage({ type: "error", text: "Lỗi xác thực người dùng." });
      setLoading(false);
      return;
    }

    if (new Date(`${date}T${endTime}`) <= new Date(`${date}T${startTime}`)) {
      setMessage({ type: "error", text: "Giờ kết thúc phải sau giờ bắt đầu." });
      setLoading(false);
      return;
    }

    try {
      await api.post(`/lamthem`, {
        ngayLT: date,
        gioBatDau: startTime,
        gioKetThuc: endTime,
        soGio: parseFloat(hours),
        ghiChu: reason,
      });

      setMessage({ type: "success", text: "Gửi đơn thành công." });
      setDate("");
      setStartTime("");
      setEndTime("");
      setHours("");
      setReason("");
      setCountdown(3);
    } catch (err: any) {
      setMessage({ type: "error", text: err?.response?.data?.message || "Có lỗi xảy ra." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/25 to-white p-4 md:p-6">
        <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(2,132,199,0.45)] md:p-6">
          <div className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-700">
            <MdOutlinePostAdd className="mr-2 text-sm" /> Tạo đơn làm thêm
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 md:text-3xl">Gửi yêu cầu làm thêm giờ</h1>
          <p className="mt-1 text-sm text-slate-600">Nhập thời gian làm thêm và lý do để quản lý xét duyệt nhanh.</p>
        </div>

        {message && (
          <div
            className={clsx(
              "mb-4 flex items-center gap-3 rounded-2xl border p-4 text-sm shadow-sm",
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700",
            )}
          >
            {message.type === "success" ? <FaCheckCircle className="text-lg" /> : <FaTimesCircle className="text-lg" />}
            <p>
              {message.text} {countdown > 0 && message.type === "success" ? `(Chuyển hướng sau ${countdown}s)` : ""}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(2,132,199,0.45)] md:p-6">
          <div>
            <label htmlFor="date" className={labelClass}>
              Ngày làm thêm
            </label>
            <div className="relative">
              <FaRegCalendarAlt className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sky-600" />
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${inputClass} pl-10`}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startTime" className={labelClass}>
                Giờ bắt đầu
              </label>
              <div className="relative">
                <MdAccessTime className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600" />
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`${inputClass} pl-10`}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="endTime" className={labelClass}>
                Giờ kết thúc
              </label>
              <div className="relative">
                <MdAccessTime className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sky-600" />
                <input
                  type="time"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`${inputClass} pl-10`}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="hours" className={labelClass}>
              Số giờ (tự động tính)
            </label>
            <input type="number" id="hours" value={hours} readOnly className={`${inputClass} cursor-not-allowed opacity-75`} />
          </div>

          <div>
            <label htmlFor="reason" className={labelClass}>
              Lý do làm thêm
            </label>
            <textarea
              id="reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={inputClass}
              placeholder="Nhập lý do..."
              required
            />
          </div>

          <div className="flex gap-2">
            <CustomButton
              type="default"
              onClick={() => router.push("/employee/lam-them")}
              style={{
                width: "48px",
                minWidth: "48px",
                background: "#eef2ff",
                color: "#334155",
                boxShadow: "none",
              }}
              disabled={loading}
            >
              <MdArrowBack size={18} />
            </CustomButton>

            <CustomButton htmlType="submit" block disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner size={16} className="animate-spin" /> Đang gửi...
                </>
              ) : (
                <>
                  <FaPaperPlane size={16} /> Gửi đơn
                </>
              )}
            </CustomButton>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
}
