//Chứa các hàm xử lý logic phụ trợ (Format giờ, Xuất Excel) để giảm tải cho file chính.

import * as XLSX from "xlsx-js-style";
import { message } from "antd";
import dayjs from "dayjs";

// 🕒 Định dạng tổng giờ làm
export function formatHours(hours: number | null): string {
  if (!hours || hours <= 0.01) return "-";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const totalHours = h + Math.floor(m / 60);
  const remainingMinutes = m % 60;

  if (totalHours > 0 && remainingMinutes > 0)
    return `${totalHours} giờ ${remainingMinutes} phút`;
  if (totalHours > 0) return `${totalHours} giờ`;
  return `${remainingMinutes} phút`;
}

// 📊 Logic Xuất Excel
export const exportSalaryExcel = (data: any[], thang: dayjs.Dayjs) => {
  if (!data.length) {
    message.warning("Không có dữ liệu để xuất");
    return;
  }

  const sheetData = [
    [
      "Mã NV", "Họ tên", "Tháng", "Tổng giờ làm", 
      "Lương cơ bản", "Thưởng", "Phạt", "Làm thêm", 
      "Tổng lương", "Trạng thái"
    ],
    ...data.map((item: any) => [
      item.nhanVien?.maNV,
      item.nhanVien?.hoTen,
      item.thang,
      formatHours(item.tongGioLam),
      item.luongCoBan,
      item.thuong,
      item.phat,
      item.lamThem,
      item.tongLuong,
      item.trangThai === "da-tra" ? "Đã trả" : "Chưa trả",
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Style
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellRef]) continue;

      // Header style
      if (R === 0) {
        ws[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "3b82f6" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "AAAAAA" } },
            bottom: { style: "thin", color: { rgb: "AAAAAA" } },
            left: { style: "thin", color: { rgb: "AAAAAA" } },
            right: { style: "thin", color: { rgb: "AAAAAA" } },
          },
        };
      } else {
        // Body style
        ws[cellRef].s = {
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "DDDDDD" } },
            bottom: { style: "thin", color: { rgb: "DDDDDD" } },
            left: { style: "thin", color: { rgb: "DDDDDD" } },
            right: { style: "thin", color: { rgb: "DDDDDD" } },
          },
        };
      }
    }
  }

  // Auto width
  const colWidths = sheetData[0].map((_, i) => {
    const maxLength = Math.max(
      ...sheetData.map((row) => String(row[i] || "").length)
    );
    return { wch: Math.min(maxLength + 2, 30) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Luong");
  XLSX.writeFile(wb, `Luong_${thang.format("YYYY_MM")}.xlsx`);
  message.success("Đã xuất file Excel");
};