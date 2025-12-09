"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaPaperPlane, FaTimesCircle, FaCheckCircle, FaSpinner } from "react-icons/fa";
import clsx from "clsx";

import api from "@/utils/api";
import { getUserFromToken } from "@/utils/auth";
import MobileLayout from "@/layouts/MobileLayout";
import CustomButton from "@/components/CustomButton";

const STYLES = {
  label: "block text-sm font-medium text-gray-400 mb-1",
  input: "w-full p-3 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:scale-[1.01] transition-all duration-200 bg-gray-700 text-white disabled:opacity-60",
  container: "p-6 bg-gray-900 min-h-screen flex flex-col items-center",
  form: "space-y-4 bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md",
};

const MAX_REASON_LENGTH = 300;

export default function CreateLeavePage() {
  const router = useRouter();

  // 2. Gom nhóm State Form
  const [formData, setFormData] = useState({
    start: "",
    end: "",
    reason: "",
  });

  // State trạng thái UI
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [countdown, setCountdown] = useState(0);

  // 3. Hàm xử lý nhập liệu chung
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { start, end, reason } = formData;
    const user = getUserFromToken();

    // Validation
    if (!user) {
      setMessage({ type: 'error', text: "Không tìm thấy thông tin người dùng." });
      setLoading(false);
      return;
    }

    if (new Date(end) < new Date(start)) {
      setMessage({ type: 'error', text: "Ngày kết thúc không thể trước ngày bắt đầu." });
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
      setCountdown(3); 
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: "Có lỗi xảy ra khi gửi đơn. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  // Effect Countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    if (countdown === 1) router.push("/employee/nghi-phep");
    return () => clearInterval(timer);
  }, [countdown, router]);

  return (
    <MobileLayout>
      <div className={STYLES.container}>
        <h1 className="text-2xl font-bold mb-6 text-gray-200 text-center">Gửi đơn nghỉ phép</h1>

        {/* Thông báo */}
        {message && (
          <div className={clsx(
            "p-4 mb-4 rounded-lg shadow-md flex items-center gap-3 w-full max-w-md transition-opacity duration-500",
            message.type === 'success' ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'
          )}>
            {message.type === 'success' ? <FaCheckCircle className="text-xl" /> : <FaTimesCircle className="text-xl" />}
            <p className="text-sm">
              {message.text} {countdown > 0 && message.type === 'success' ? `(Chuyển hướng ${countdown}s)` : ''}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={STYLES.form}>
          {/* Ngày bắt đầu */}
          <div>
            <label htmlFor="start" className={STYLES.label}>Ngày bắt đầu</label>
            <input
              type="date"
              id="start"
              value={formData.start}
              onChange={(e) => handleChange("start", e.target.value)}
              className={STYLES.input}
              disabled={loading}
              required
            />
          </div>

          {/* Ngày kết thúc */}
          <div>
            <label htmlFor="end" className={STYLES.label}>Ngày kết thúc</label>
            <input
              type="date"
              id="end"
              value={formData.end}
              onChange={(e) => handleChange("end", e.target.value)}
              className={STYLES.input}
              disabled={loading}
              required
            />
          </div>

          {/* Lý do */}
          <div>
            <label htmlFor="reason" className={STYLES.label}>
              Lý do <span className="text-gray-400 text-xs">(tối đa {MAX_REASON_LENGTH} ký tự)</span>
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
            <p className="text-xs text-gray-400 mt-1 text-right">
              {formData.reason.length}/{MAX_REASON_LENGTH}
            </p>
          </div>

          {/* Nút Submit */}
          <CustomButton htmlType="submit" block disabled={loading}>
            {loading ? (
              <> <FaSpinner size={16} className="animate-spin" /> Đang gửi... </>
            ) : (
              <> <FaPaperPlane size={16} /> Gửi đơn </>
            )}
          </CustomButton>
        </form>
      </div>
    </MobileLayout>
  );
}