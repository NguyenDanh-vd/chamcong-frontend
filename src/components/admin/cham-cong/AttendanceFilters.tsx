//Chứa các ô input chọn ngày, chọn nhân viên và chọn trạng thái.

import { DatePicker, Select, Row, Col, Card } from "antd";
const { RangePicker } = DatePicker;
const { Option } = Select;

const STATUS_MAP: Record<string, string> = {
  "chua-xac-nhan": "Chưa xác nhận",
  "hop-le": "Hợp lệ",
  "di-tre": "Đi trễ",
  "ve-som": "Về sớm",
  "tre-va-ve-som": "Trễ và Về sớm",
  "da-checkout": "Đã check-out",
  "dang-lam-viec": "Đang làm việc",
};

interface AttendanceFiltersProps {
  nhanVienList: any[];
  onFilterChange: (key: string, value: any) => void;
}

export default function AttendanceFilters({
  nhanVienList,
  onFilterChange,
}: AttendanceFiltersProps) {
  return (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <RangePicker
            style={{ width: "100%" }}
            onChange={(dates) => onFilterChange("dates", dates)}
          />
        </Col>
        <Col xs={24} md={8}>
          <Select
            showSearch
            allowClear
            placeholder="Lọc theo nhân viên"
            style={{ width: "100%" }}
            onChange={(value) => onFilterChange("maNV", value)}
            filterOption={(input, option) =>
              String(option?.children ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {nhanVienList.map((nv) => (
              <Option key={nv.maNV} value={nv.maNV}>
                {nv.hoTen}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} md={8}>
          <Select
            allowClear
            placeholder="Lọc theo trạng thái"
            style={{ width: "100%" }}
            onChange={(value) => onFilterChange("trangThai", value)}
          >
            {Object.entries(STATUS_MAP).map(([key, value]) => (
              <Option key={key} value={key}>
                {value}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
    </Card>
  );
}