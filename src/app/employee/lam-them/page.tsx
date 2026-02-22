"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import dayjs from "dayjs";
import MobileLayout from "@/layouts/MobileLayout";
import CustomButton from "@/components/CustomButton";
import { MdAccessTime, MdOutlineInfo, MdTrendingUp } from "react-icons/md";
import { FaRegCalendarAlt } from "react-icons/fa";

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
        setRequests(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh sách làm thêm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOvertime();
  }, []);

  const stats = useMemo(() => {
    const total = requests.length;
    const choDuyet = requests.filter((r) => r.trangThai === "cho-duyet").length;
    const daDuyet = requests.filter((r) => r.trangThai === "da-duyet").length;
    const tongGio = requests.reduce((sum, r) => sum + (r.soGio ?? 0), 0);
    return { total, choDuyet, daDuyet, tongGio };
  }, [requests]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "cho-duyet":
        return "border-amber-200 bg-amber-50 text-amber-700";
      case "da-duyet":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "tu-choi":
        return "border-rose-200 bg-rose-50 text-rose-700";
      default:
        return "border-slate-200 bg-slate-100 text-slate-700";
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/25 to-white p-4 pb-20 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 md:p-6">
        <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(2,132,199,0.45)] dark:border-slate-700 dark:bg-slate-900 md:p-6">
          <div className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-700 dark:border-cyan-500/40 dark:bg-cyan-900/30 dark:text-cyan-300">
            <MdTrendingUp className="mr-2 text-sm" /> Quản lý làm thêm
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-slate-100 md:text-3xl">Đơn làm thêm của tôi</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Theo dõi tiến độ duyệt đơn và tổng thời gian làm thêm.</p>

          <div className="mt-4">
            <CustomButton onClick={() => router.push("/employee/lam-them/create")} style={{ width: "100%" }}>
              + Gửi đơn mới
            </CustomButton>
          </div>
        </div>

        {!loading && requests.length > 0 ? (
          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-500/40 dark:bg-sky-900/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Tổng đơn</p>
              <p className="mt-1 text-2xl font-extrabold text-sky-700 dark:text-sky-200">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-900/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Chờ duyệt</p>
              <p className="mt-1 text-2xl font-extrabold text-amber-700 dark:text-amber-200">{stats.choDuyet}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/40 dark:bg-emerald-900/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Đã duyệt</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-700 dark:text-emerald-200">{stats.daDuyet}</p>
            </div>
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-500/40 dark:bg-cyan-900/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">Tổng giờ</p>
              <p className="mt-1 text-2xl font-extrabold text-cyan-700 dark:text-cyan-200">{stats.tongGio}h</p>
            </div>
          </div>
        ) : null}

        {loading ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">Đang tải dữ liệu...</p>
        ) : requests.length === 0 ? (
          <div className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <MdOutlineInfo className="mx-auto mb-2 text-3xl opacity-70" />
            Chưa có đơn làm thêm nào.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const reason = req.lyDo || "Không có lý do";
              const formattedDate = req.ngay ? dayjs(req.ngay).format("DD/MM/YYYY") : "Không rõ ngày";
              const hours = req.soGio || 0;
              const status = req.trangThai || "cho-duyet";

              return (
                <article
                  key={req.maLT}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_34px_-26px_rgba(2,132,199,0.45)] dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="mb-3 flex items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-700">
                    <p className="flex-1 break-words text-lg font-bold text-slate-900 dark:text-slate-100">{reason}</p>
                    <p className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(status)}`}>
                      {getStatusText(status)}
                    </p>
                  </div>

                  <div className="grid gap-2 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
                    <p className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
                      <FaRegCalendarAlt className="text-sky-600" />
                      <span>
                        <strong>Ngày:</strong> {formattedDate}
                      </span>
                    </p>
                    <p className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
                      <MdAccessTime className="text-cyan-600" />
                      <span>
                        <strong>Số giờ:</strong> {hours} giờ
                      </span>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
