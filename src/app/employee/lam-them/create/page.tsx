"use client";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { getUserFromToken } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { FaPaperPlane, FaTimesCircle, FaCheckCircle, FaSpinner } from "react-icons/fa";
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
  const router = useRouter();

  //  Tự động tính số giờ khi chọn giờ bắt đầu & kết thúc
  useEffect(() => {
    if (date && startTime && endTime) {
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);
      if (end > start) {
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // tính giờ
        setHours(diff.toFixed(1)); // làm tròn 1 số thập phân
      } else {
        setHours(""); // reset nếu giờ không hợp lệ
      }
    }
  }, [date, startTime, endTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const user = getUserFromToken();
    if (!user) {
      setMessage({ type: "error", text: "Không tìm thấy thông tin người dùng." });
      setLoading(false);
      return;
    }

    if (new Date(`${date}T${endTime}`) < new Date(`${date}T${startTime}`)) {
      setMessage({ type: "error", text: "Giờ kết thúc không thể trước giờ bắt đầu." });
      setLoading(false);
      return;
    }

    try {
      // ==========================================================
      // ======> SỬA LỖI Ở ĐÂY: Bỏ user.maNV khỏi URL <======
      // ==========================================================
      await api.post(`/lamthem`, {
        ngayLT: date,
        gioBatDau: startTime,
        gioKetThuc: endTime,
        soGio: parseFloat(hours), // Gửi dạng số để backend dễ xử lý
        ghiChu: reason
      });

      setMessage({ type: "success", text: "Gửi đơn làm thêm giờ thành công!" });

      // reset form
      setDate("");
      setStartTime("");
      setEndTime("");
      setHours("");
      setReason("");

      setTimeout(() => {
        router.push("/employee/lam-them");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Có lỗi xảy ra khi gửi đơn. Vui lòng thử lại."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout>
      <div className="p-6 bg-gray-900 min-h-screen">
        <h1 className="text-2xl font-bold mb-6 text-gray-200">Gửi đơn làm thêm giờ</h1>

        {message && (
          <div
            className={`p-4 mb-4 rounded-lg shadow-md flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-400 text-green-900"
                : "bg-red-400 text-red-900"
            }`}
          >
            {message.type === "success" ? (
              <FaCheckCircle className="text-xl" />
            ) : (
              <FaTimesCircle className="text-xl" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Ngày làm thêm
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-gray-700 text-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="startTime"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Giờ bắt đầu
            </label>
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-gray-700 text-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="endTime"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Giờ kết thúc
            </label>
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-gray-700 text-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="hours"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Số giờ
            </label>
            <input
              type="number"
              id="hours"
              value={hours}
              readOnly
              className="w-full p-3 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-white cursor-not-allowed"
              placeholder="Tự động tính"
            />
          </div>

          <div>
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Lý do
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-gray-700 text-white"
              rows={4}
              placeholder="Nhập lý do làm thêm..."
              required
            />
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
