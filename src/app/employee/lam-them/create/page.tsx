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

  // Class chung cho các ô input (Đỡ phải copy paste nhiều lần)
  const inputClass = "w-full p-3 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-gray-700 text-white";
  const labelClass = "block text-sm font-medium text-gray-400 mb-1";

  //  Tự động tính số giờ
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
        ghiChu: reason
      });

      setMessage({ type: "success", text: "Gửi đơn thành công!" });
      setDate(""); setStartTime(""); setEndTime(""); setHours(""); setReason("");

      setTimeout(() => router.push("/employee/lam-them"), 1500);
    } catch (err: any) {
      setMessage({ type: "error", text: err?.response?.data?.message || "Có lỗi xảy ra." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout>
      <div className="p-6 bg-gray-900 min-h-screen">
        <h1 className="text-2xl font-bold mb-6 text-gray-200">Gửi đơn làm thêm giờ</h1>

        {message && (
          <div className={`p-4 mb-4 rounded-lg shadow-md flex items-center gap-3 ${message.type === "success" ? "bg-green-400 text-green-900" : "bg-red-400 text-red-900"}`}>
            {message.type === "success" ? <FaCheckCircle className="text-xl" /> : <FaTimesCircle className="text-xl" />}
            <p>{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-xl shadow-lg">
          
          {/* Ngày */}
          <div>
            <label htmlFor="date" className={labelClass}>Ngày làm thêm</label>
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} required />
          </div>

          {/* Giờ bắt đầu */}
          <div>
            <label htmlFor="startTime" className={labelClass}>Giờ bắt đầu</label>
            <input type="time" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} required />
          </div>

          {/* Giờ kết thúc */}
          <div>
            <label htmlFor="endTime" className={labelClass}>Giờ kết thúc</label>
            <input type="time" id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass} required />
          </div>

          {/* Số giờ (Readonly) */}
          <div>
            <label htmlFor="hours" className={labelClass}>Số giờ (Tự động)</label>
            <input type="number" id="hours" value={hours} readOnly className={`${inputClass} cursor-not-allowed opacity-70`} />
          </div>

          {/* Lý do */}
          <div>
            <label htmlFor="reason" className={labelClass}>Lý do</label>
            <textarea id="reason" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} placeholder="Nhập lý do..." required />
          </div>

          {/* Nút gửi */}
          <CustomButton htmlType="submit" block disabled={loading}>
            {loading ? (
              <><FaSpinner size={16} className="animate-spin" /> Đang gửi...</>
            ) : (
              <><FaPaperPlane size={16} /> Gửi đơn</>
            )}
          </CustomButton>

        </form>
      </div>
    </MobileLayout>
  );
}