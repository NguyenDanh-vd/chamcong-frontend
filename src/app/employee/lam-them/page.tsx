"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import dayjs from "dayjs";
import MobileLayout from "@/layouts/MobileLayout";
import CustomButton from "@/components/CustomButton";
interface OvertimeRequest {
  maLT: number;
  soGio?: number;
  lyDo?: string;
  ngay?: string;
  trangThai?: "cho-duyet" | "da-duyet" | "tu-choi";
}

export default function OvertimePage() {
  const router = useRouter();
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOvertime = async () => {
      try {
        const res = await api.get(`/lamthem/nhanvien`);
        console.log("Dữ liệu API:", res.data);
        setRequests(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh sách làm thêm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOvertime();
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "cho-duyet":
        return "bg-yellow-200 text-yellow-800 dark:bg-yellow-500 dark:text-black";
      case "da-duyet":
        return "bg-green-200 text-green-800 dark:bg-green-500 dark:text-white";
      case "tu-choi":
        return "bg-red-200 text-red-800 dark:bg-red-500 dark:text-white";
      default:
        return "bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "cho-duyet":
        return "Chờ duyệt";
      case "da-duyet":
        return "Đã duyệt";
      case "tu-choi":
        return "Từ chối";
      default:
        return "Không rõ";
    }
  };

  return (
    <MobileLayout>
      {/* KHÔNG set bg-gray-100 / bg-gray-900 cứng nữa */}
      <div className="p-4 min-h-screen transition-colors duration-300">
        <h1 className="text-xl font-bold mb-4">Đơn làm thêm của tôi</h1>

        <CustomButton onClick={() => router.push("/employee/lam-them/create")}
        style={{ width: "100%" }} 
        >
          + Gửi đơn mới
        </CustomButton>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 p-4 text-center">
            Đang tải dữ liệu...
          </p>
        ) : requests.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center mt-8">
            Chưa có đơn làm thêm nào.
          </p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const reason = req.lyDo || "Không có lý do";
              const formattedDate = req.ngay
                ? dayjs(req.ngay).format("DD/MM/YYYY")
                : "Không rõ ngày";
              const hours = req.soGio || 0;
              const status = req.trangThai || "cho-duyet";

              return (
                <div
                  key={req.maLT}
                  className="p-4 rounded-lg shadow-md border transition-colors duration-300 
                             bg-white text-gray-900 border-gray-300 
                             dark:bg-gray-800 dark:text-white dark:border-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-lg flex-1 break-words">
                      {reason}
                    </p>
                    <p
                      className={`font-semibold text-sm px-2 py-1 rounded-full ${getStatusClass(
                        status
                      )}`}
                    >
                      {getStatusText(status)}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <p>
                      <strong>Ngày:</strong> {formattedDate}
                    </p>
                    <p>
                      <strong>Số giờ:</strong> {hours} giờ
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
