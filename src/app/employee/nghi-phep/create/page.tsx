"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaPaperPlane,
  FaTimesCircle,
  FaCheckCircle,
  FaSpinner,
  FaRegCalendarAlt,
} from "react-icons/fa";
import { MdArrowBack, MdOutlineNoteAlt } from "react-icons/md";
import clsx from "clsx";
import dayjs from "dayjs";

import api from "@/utils/api";
import { getUserFromToken } from "@/utils/auth";
import MobileLayout from "@/layouts/MobileLayout";
import CustomButton from "@/components/CustomButton";

const STYLES = {
  label: "mb-1.5 block text-sm font-medium text-slate-700",
  input:
    "w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:opacity-60",
  container:
    "min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/25 to-white p-4 md:p-6",
  form:
    "space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(2,132,199,0.45)] md:p-6",
};

const MAX_REASON_LENGTH = 300;

export default function CreateLeavePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    start: "",
    end: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [countdown, setCountdown] = useState(0);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { start, end, reason } = formData;
    const user = getUserFromToken();
    const maNV = Number((user as any)?.maNV ?? (user as any)?.sub ?? 0);

    if (!user || !maNV) {
      setMessage({ type: "error", text: "Không tìm thấy thông tin người dùng." });
      setLoading(false);
      return;
    }

    if (new Date(end) < new Date(start)) {
      setMessage({ type: "error", text: "Ngày kết thúc không thể trước ngày bắt đầu." });
      setLoading(false);
      return;
    }

    try {
      const lyDo = reason.trim();
      await api.post(`/nghiphep/${maNV}`, {
        ngayBatDau: dayjs(start).format("YYYY-MM-DD"),
        ngayKetThuc: dayjs(end).format("YYYY-MM-DD"),
        lyDo,
      });

      setMessage({ type: "success", text: "Gửi đơn nghỉ phép thành công." });
      setCountdown(3);
    } catch (err) {
      console.error(err);
      const error: any = err;
      const status = error?.response?.status;
      const rawMsg = error?.response?.data?.message;
      const serverMsg = Array.isArray(rawMsg)
        ? rawMsg.join(", ")
        : typeof rawMsg === "string"
        ? rawMsg
        : error?.response?.data?.error;

      if (status === 403) {
        setMessage({
          type: "error",
          text: "Tài khoản hiện tại không có quyền gửi đơn nghỉ phép (yêu cầu vai trò nhân viên).",
        });
      } else {
        setMessage({
          type: "error",
          text: serverMsg || `Gửi đơn thất bại${status ? ` (HTTP ${status})` : ""}.`,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    if (countdown === 1) router.push("/employee/nghi-phep");
    return () => clearInterval(timer);
  }, [countdown, router]);

  return (
    <MobileLayout>
      <div className={STYLES.container}>
        <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(2,132,199,0.45)] md:p-6">
          <div className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-700">
            <MdOutlineNoteAlt className="mr-2 text-sm" /> Tạo đơn nghỉ phép
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 md:text-3xl">Gửi yêu cầu nghỉ phép</h1>
          <p className="mt-1 text-sm text-slate-600">Điền đầy đủ thông tin để quản lý xem xét và phê duyệt nhanh hơn.</p>
        </div>

        {message && (
          <div
            className={clsx(
              "mb-4 flex items-center gap-3 rounded-2xl border p-4 text-sm shadow-sm transition-opacity duration-500",
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

        <form onSubmit={handleSubmit} className={STYLES.form}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="start" className={STYLES.label}>
                Ngày bắt đầu
              </label>
              <div className="relative">
                <FaRegCalendarAlt className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sky-600" />
                <input
                  type="date"
                  id="start"
                  value={formData.start}
                  onChange={(e) => handleChange("start", e.target.value)}
                  className={`${STYLES.input} pl-10`}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="end" className={STYLES.label}>
                Ngày kết thúc
              </label>
              <div className="relative">
                <FaRegCalendarAlt className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600" />
                <input
                  type="date"
                  id="end"
                  value={formData.end}
                  onChange={(e) => handleChange("end", e.target.value)}
                  className={`${STYLES.input} pl-10`}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="reason" className={STYLES.label}>
              Lý do <span className="text-xs text-slate-500">(tối đa {MAX_REASON_LENGTH} ký tự)</span>
            </label>
            <textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              className={STYLES.input}
              rows={4}
              placeholder="Nhập lý do nghỉ phép của bạn..."
              maxLength={MAX_REASON_LENGTH}
              disabled={loading}
              required
            />
            <p className="mt-1 text-right text-xs text-slate-500">
              {formData.reason.length}/{MAX_REASON_LENGTH}
            </p>
          </div>

          <div className="flex gap-2">
            <CustomButton
              type="default"
              onClick={() => router.push("/employee/nghi-phep")}
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

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-[0_12px_34px_-28px_rgba(2,132,199,0.4)]">
          <p className="font-semibold text-slate-800">Lưu ý</p>
          <p className="mt-1">Chọn đúng khoảng thời gian nghỉ và mô tả ngắn gọn lý do để đơn được xử lý nhanh hơn.</p>
        </div>
      </div>
    </MobileLayout>
  );
}
