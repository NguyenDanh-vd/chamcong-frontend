import { Button, Card, Col, DatePicker, Row, Select, Space, Tag } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

const STATUS_MAP: Record<string, string> = {
  "chua-xac-nhan": "Chưa xác nhận",
  "hop-le": "Hợp lệ",
  "di-tre": "Đi trễ",
  "ve-som": "Về sớm",
  "tre-va-ve-som": "Trễ và về sớm",
  "da-checkout": "Đã check-out",
  "dang-lam-viec": "Đang làm việc",
};

interface AttendanceFiltersProps {
  nhanVienList: any[];
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

export default function AttendanceFilters({ nhanVienList, onFilterChange, onReset }: AttendanceFiltersProps) {
  return (
    <Card
      bordered={false}
      style={{ borderRadius: 16, boxShadow: "0 12px 26px rgba(15, 23, 42, 0.06)" }}
      bodyStyle={{ padding: 16 }}
    >
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={9}>
            <RangePicker
              style={{ width: "100%", height: 40 }}
              onChange={(dates) => onFilterChange("dates", dates)}
              format="DD/MM/YYYY"
            />
          </Col>

          <Col xs={24} md={7}>
            <Select
              showSearch
              allowClear
              placeholder="Lọc theo nhân viên"
              style={{ width: "100%" }}
              size="large"
              onChange={(value) => onFilterChange("maNV", value)}
              options={nhanVienList.map((nv) => ({ value: nv.maNV, label: nv.hoTen }))}
              filterOption={(input, option) => String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
            />
          </Col>

          <Col xs={24} md={5}>
            <Select
              allowClear
              placeholder="Lọc theo trạng thái"
              style={{ width: "100%" }}
              size="large"
              onChange={(value) => onFilterChange("trangThai", value)}
              options={Object.entries(STATUS_MAP).map(([key, value]) => ({ value: key, label: value }))}
            />
          </Col>

          <Col xs={24} md={3}>
            <Button icon={<ReloadOutlined />} size="large" style={{ width: "100%" }} onClick={onReset}>
              Đặt lại
            </Button>
          </Col>
        </Row>

        <Tag color="processing" style={{ width: "fit-content" }}>
          Lọc theo khoảng ngày, nhân viên hoặc trạng thái chấm công
        </Tag>
      </Space>
    </Card>
  );
}
