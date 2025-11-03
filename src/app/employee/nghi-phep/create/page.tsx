"use client";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { getUserFromToken } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { FaPaperPlane, FaTimesCircle, FaCheckCircle, FaSpinner } from "react-icons/fa";
import MobileLayout from "@/layouts/MobileLayout";
import clsx from "clsx"; 
import CustomButton from "@/components/CustomButton";

export default function CreateLeavePage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  const MAX_REASON_LENGTH = 300;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const user = getUserFromToken();
    if (!user) {
      setMessage({ type: 'error', text: "Không tìm thấy thông tin người dùng." });
      setLoading(false);
      return;
    }

    if (!start || !end) {
      setMessage({ type: 'error', text: "Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc." });
      setLoading(false);
      return;
    }

    if (new Date(end) < new Date(start)) {
      setMessage({ type: 'error', text: "Ngày kết thúc không thể trước ngày bắt đầu." });
      setLoading(false);
      return;
    }

    if (reason.length > MAX_REASON_LENGTH) {
      setMessage({ type: 'error', text: `Lý do không được vượt quá ${MAX_REASON_LENGTH} ký tự.` });
      setLoading(false);
      return;
    }

    try {
      await api.post(`/nghiphep/${user.maNV}`, {
        ngayBatDau: start,
        ngayKetThuc: end,
        lyDo: reason
      });

      setMessage({ type: 'success', text: "Gửi đơn nghỉ phép thành công!" });
      setCountdown(3); // 3s đếm ngược

    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: "Có lỗi xảy ra khi gửi đơn. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  // Countdown chuyển hướng
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    if (countdown === 1) {
      router.push("/employee/nghi-phep");
    }

    return () => clearInterval(timer);
  }, [countdown, router]);

  return (
    <MobileLayout>
      <div className="p-6 bg-gray-900 min-h-screen flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-200 text-center">Gửi đơn nghỉ phép</h1>

        {message && (
          <div className={clsx(
            "p-4 mb-4 rounded-lg shadow-md flex items-center gap-3 w-full max-w-md transition-opacity duration-500",
            message.type === 'success' ? 'bg-green-400 text-green-900 opacity-100' : 'bg-red-400 text-red-900 opacity-100'
          )}>
            {message.type === 'success' ? <FaCheckCircle className="text-xl" /> : <FaTimesCircle className="text-xl" />}
            <p className="text-sm">{message.text} {countdown > 0 && message.type === 'success' ? `Chuyển hướng sau ${countdown}s...` : ''}</p>
          </div>
        )}

        <form 
          onSubmit={handleSubmit} 
          className="space-y-4 bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md"
        >
          <div>
            <label htmlFor="start" className="block text-sm font-medium text-gray-400 mb-1">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              id="start"
              value={start}
              onChange={e => setStart(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:scale-105 transition-all duration-200 bg-gray-700 text-white"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="end" className="block text-sm font-medium text-gray-400 mb-1">
              Ngày kết thúc
            </label>
            <input
              type="date"
              id="end"
              value={end}
              onChange={e => setEnd(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:scale-105 transition-all duration-200 bg-gray-700 text-white"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-400 mb-1">
              Lý do <span className="text-gray-400 text-xs">(tối đa {MAX_REASON_LENGTH} ký tự)</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:scale-105 transition-all duration-200 bg-gray-700 text-white"
              rows={4}
              placeholder="Nhập lý do nghỉ phép của bạn..."
              maxLength={MAX_REASON_LENGTH}
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{reason.length}/{MAX_REASON_LENGTH}</p>
          </div>

          <CustomButton
            htmlType="submit"
            block
            disabled={loading}
          >
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
        </form>
      </div>
    </MobileLayout>
  );
}
