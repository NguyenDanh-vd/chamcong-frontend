"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { getUserFromToken } from "@/utils/auth";
import dayjs from "dayjs";
import MobileLayout from "@/layouts/MobileLayout";
import CustomButton from "@/components/CustomButton";
import { FaRegCalendarAlt } from "react-icons/fa";
import { MdBeachAccess, MdOutlineInfo } from "react-icons/md";

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
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "tu-choi":
        return "border-rose-200 bg-rose-50 text-rose-700";
      case "dang-cho":
      default:
        return "border-amber-200 bg-amber-50 text-amber-700";
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/25 to-white p-4 pb-20 transition-colors duration-300 md:p-6">
        <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(2,132,199,0.45)] md:p-6">
          <div className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-700">
            <MdBeachAccess className="mr-2 text-sm" /> Quản lý nghỉ phép
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 md:text-3xl">Đơn nghỉ phép của tôi</h1>
          <p className="mt-1 text-sm text-slate-600">Theo dõi trạng thái duyệt và gửi yêu cầu nghỉ phép mới nhanh chóng.</p>

          <div className="mt-4">
            <CustomButton
              onClick={() => router.push("/employee/nghi-phep/create")}
              style={{ width: "100%" }}
            >
              + Gửi đơn mới
            </CustomButton>
          </div>
        </div>

        {loading ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">Đang tải dữ liệu...</p>
        ) : leaves.length === 0 ? (
          <div className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-500">
            <MdOutlineInfo className="mx-auto mb-2 text-3xl opacity-70" />
            Chưa có đơn nghỉ phép nào.
          </div>
        ) : (
          <div className="space-y-4">
            {leaves.map((leave) => (
              <article
                key={leave.maNP}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_34px_-26px_rgba(2,132,199,0.45)]"
              >
                <div className="mb-3 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <p className="flex-1 break-words text-lg font-bold text-slate-900">{leave.lyDo}</p>
                  <p className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(leave.trangThai)}`}>
                    {getStatusText(leave.trangThai)}
                  </p>
                </div>

                <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  <p className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <FaRegCalendarAlt className="text-sky-600" />
                    <span>
                      <strong>Từ ngày:</strong> {dayjs(leave.ngayBatDau).format("DD/MM/YYYY")}
                    </span>
                  </p>
                  <p className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <FaRegCalendarAlt className="text-cyan-600" />
                    <span>
                      <strong>Đến ngày:</strong> {dayjs(leave.ngayKetThuc).format("DD/MM/YYYY")}
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
