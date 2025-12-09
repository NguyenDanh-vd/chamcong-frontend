//File này xử lý hiển thị bảng và tính toán Footer.

export type ReportItem = {
  hoTen: string;
  ngayCong: number;
  ngayNghi: number;
  gioLamThem: number;
};

interface ReportTableProps {
  data: ReportItem[];
  loading: boolean;
}

export default function ReportTable({ data, loading }: ReportTableProps) {
  // Tính tổng
  const totalCong = data.reduce((s, r) => s + r.ngayCong, 0);
  const totalNghi = data.reduce((s, r) => s + r.ngayNghi, 0);
  const totalGioLT = data.reduce((s, r) => s + r.gioLamThem, 0);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
        <p className="text-gray-500">Không có dữ liệu báo cáo nào.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 uppercase font-bold">
          <tr>
            <th className="p-4">Nhân viên</th>
            <th className="p-4 text-right">Ngày công</th>
            <th className="p-4 text-right">Ngày nghỉ</th>
            <th className="p-4 text-right">Giờ làm thêm</th>
            <th className="p-4 text-right">% đi làm</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((r, i) => {
            const total = r.ngayCong + r.ngayNghi;
            const percent = total > 0 ? ((r.ngayCong / total) * 100).toFixed(1) : "0";
            return (
              <tr
                key={i}
                className={`${
                  i % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800/50"
                } hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-gray-800 dark:text-gray-200`}
              >
                <td className="p-4 font-medium">{r.hoTen}</td>
                <td className="p-4 text-right">{r.ngayCong}</td>
                <td className="p-4 text-right">{r.ngayNghi}</td>
                <td className="p-4 text-right">{r.gioLamThem}</td>
                <td className="p-4 text-right">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      Number(percent) < 50
                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    }`}
                  >
                    {percent}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-200 dark:bg-gray-700 font-bold text-gray-900 dark:text-gray-100">
          <tr>
            <td className="p-4 text-right">TỔNG CỘNG</td>
            <td className="p-4 text-right">{totalCong}</td>
            <td className="p-4 text-right">{totalNghi}</td>
            <td className="p-4 text-right">{totalGioLT}</td>
            <td className="p-4 text-right">-</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}