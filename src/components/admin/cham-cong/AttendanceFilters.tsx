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
      className="attendance-filters-card"
      bordered={false}
      style={{
        borderRadius: 18,
        boxShadow: "0 14px 28px rgba(15, 42, 96, 0.1)",
        background: "linear-gradient(145deg, #ffffff 0%, #f8fbff 45%, #eef7ff 100%)",
      }}
      bodyStyle={{ padding: 18 }}
    >
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={9}>
            <RangePicker
              className="attendance-range-picker"
              style={{ width: "100%", height: 40 }}
              onChange={(dates) => onFilterChange("dates", dates)}
              format="DD/MM/YYYY"
            />
          </Col>

          <Col xs={24} md={7}>
            <Select
              className="attendance-select"
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
              className="attendance-select"
              allowClear
              placeholder="Lọc theo trạng thái"
              style={{ width: "100%" }}
              size="large"
              onChange={(value) => onFilterChange("trangThai", value)}
              options={Object.entries(STATUS_MAP).map(([key, value]) => ({ value: key, label: value }))}
            />
          </Col>

          <Col xs={24} md={3}>
            <Button
              icon={<ReloadOutlined />}
              size="large"
              style={{ width: "100%", borderRadius: 10, fontWeight: 600 }}
              onClick={onReset}
            >
              Đặt lại
            </Button>
          </Col>
        </Row>

        <Tag color="processing" style={{ width: "fit-content", borderRadius: 999, paddingInline: 10 }}>
          Lọc theo khoảng ngày, nhân viên hoặc trạng thái chấm công
        </Tag>
      </Space>

      <style jsx global>{`
        .attendance-filters-card {
          border: 1px solid #dbeafe;
          overflow: hidden;
        }
        .attendance-filters-card .ant-card-body {
          position: relative;
        }
        .attendance-filters-card .ant-card-body::after {
          content: "";
          position: absolute;
          right: -50px;
          top: -42px;
          width: 170px;
          height: 170px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, rgba(34, 211, 238, 0) 72%);
          pointer-events: none;
        }
        .attendance-select .ant-select-selector,
        .attendance-range-picker.ant-picker {
          border-color: #bfdbfe !important;
        }
      `}</style>
    </Card>
  );
}
