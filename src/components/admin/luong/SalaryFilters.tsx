//Thanh công cụ phía trên (Chọn tháng, Nút bấm).

import { DatePicker, Space } from "antd";
import { CalculatorOutlined, ReloadOutlined, FileExcelOutlined } from "@ant-design/icons";
import CustomButton from "@/components/CustomButton";
import dayjs from "dayjs";

interface SalaryFiltersProps {
  thang: dayjs.Dayjs;
  setThang: (val: dayjs.Dayjs) => void;
  onTinhLuong: () => void;
  tinhLuongLoading: boolean;
  onReload: () => void;
  onExport: () => void;
}

export default function SalaryFilters({
  thang,
  setThang,
  onTinhLuong,
  tinhLuongLoading,
  onReload,
  onExport,
}: SalaryFiltersProps) {
  return (
    <Space style={{ marginBottom: 16, flexWrap: "wrap" }}>
      <DatePicker
        picker="month"
        value={thang}
        onChange={(val) => val && setThang(val)}
        format="YYYY-MM"
        allowClear={false}
      />

      <CustomButton
        icon={<CalculatorOutlined />}
        onClick={onTinhLuong}
        loading={tinhLuongLoading}
      >
        Tính lương tự động
      </CustomButton>

      <CustomButton icon={<ReloadOutlined />} onClick={onReload}>
        Làm mới
      </CustomButton>

      <CustomButton
        icon={<FileExcelOutlined />}
        onClick={onExport}
        style={{
          background: "linear-gradient(90deg, #22c55e, #16a34a)",
        }}
      >
        Xuất Excel
      </CustomButton>
    </Space>
  );
}