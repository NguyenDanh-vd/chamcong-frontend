"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { getUserFromToken } from "@/utils/auth";
import dayjs from "dayjs";
import MobileLayout from "@/layouts/MobileLayout";
import CustomButton from "@/components/CustomButton";
interface LeaveRequest {
  maNP: number;
  lyDo: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: "dang-cho" | "da-duyet" | "tu-choi";
}

export default function LeaveListPage() {
  const router = useRouter();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUserFromToken();
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchLeaves = async () => {
      try {
        const res = await api.get(`/nghiphep/nhanvien/${user.maNV}`);
        setLeaves(res.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "da-duyet":
        return "bg-green-200 text-green-800 dark:bg-green-500 dark:text-white";
      case "tu-choi":
        return "bg-red-200 text-red-800 dark:bg-red-500 dark:text-white";
      case "dang-cho":
      default:
        return "bg-yellow-200 text-yellow-800 dark:bg-yellow-500 dark:text-black";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "da-duyet":
        return "Đã duyệt";
      case "tu-choi":
        return "Từ chối";
      case "dang-cho":
      default:
        return "Chờ duyệt";
    }
  };

  return (
    <MobileLayout>
      {/* ✅ Không hardcode bg-gray-900 nữa, dùng theme tự đổi */}
      <div className="p-4 pb-20 min-h-screen transition-colors duration-300">
        <h1 className="text-xl font-bold mb-4">Đơn nghỉ phép của tôi</h1>
        <CustomButton
          onClick={() => router.push("/employee/nghi-phep/create")}
          style={{ width: "100%" }}
        >
          + Gửi đơn mới
        </CustomButton>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 p-4 text-center">
            Đang tải dữ liệu...
          </p>
        ) : leaves.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center mt-8">
            Chưa có đơn nghỉ phép nào.
          </p>
        ) : (
          <div className="space-y-4">
            {leaves.map((leave) => (
              <div
                key={leave.maNP}
                className="p-4 rounded-lg shadow-md border transition-colors duration-300 
                           bg-white text-gray-900 border-gray-300 
                           dark:bg-gray-800 dark:text-white dark:border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <p className="font-bold text-lg flex-1 break-words">
                    {leave.lyDo}
                  </p>
                  <p
                    className={`font-semibold text-sm px-2 py-1 rounded-full ${getStatusClass(
                      leave.trangThai
                    )}`}
                  >
                    {getStatusText(leave.trangThai)}
                  </p>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <p>
                    <strong>Từ ngày:</strong>{" "}
                    {dayjs(leave.ngayBatDau).format("DD/MM/YYYY")}
                  </p>
                  <p>
                    <strong>Đến ngày:</strong>{" "}
                    {dayjs(leave.ngayKetThuc).format("DD/MM/YYYY")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
