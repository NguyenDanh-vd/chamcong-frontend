import { Button, Card, Col, Input, Radio, Row, Select, Space, Tag } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";

interface ReportFiltersProps {
  type: "thang" | "nam";
  setType: (val: "thang" | "nam") => void;
  month: number;
  setMonth: (val: number) => void;
  year: number;
  setYear: (val: number) => void;
  search: string;
  setSearch: (val: string) => void;
  onExport: () => void;
  loading: boolean;
}

export default function ReportFilters({
  type,
  setType,
  month,
  setMonth,
  year,
  setYear,
  search,
  setSearch,
  onExport,
  loading,
}: ReportFiltersProps) {
  return (
    <Card
      className="report-filters-card"
      bordered={false}
      style={{
        borderRadius: 18,
        boxShadow: "0 14px 28px rgba(15, 42, 96, 0.1)",
        background: "linear-gradient(145deg, #ffffff 0%, #f8fbff 45%, #eef7ff 100%)",
      }}
      bodyStyle={{ padding: 18 }}
    >
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={6}>
            <Radio.Group
              className="report-type-toggle"
              value={type}
              onChange={(e) => setType(e.target.value)}
              optionType="button"
              buttonStyle="solid"
              options={[
                { label: "Theo tháng", value: "thang" },
                { label: "Theo năm", value: "nam" },
              ]}
            />
          </Col>

          <Col xs={24} sm={12} md={4}>
            {type === "thang" ? (
              <Select
                className="report-select"
                value={month}
                style={{ width: "100%" }}
                size="large"
                onChange={(val) => setMonth(val)}
                options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }))}
              />
            ) : null}
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Input
              className="report-input"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={2000}
              max={2100}
              size="large"
              placeholder="Năm"
            />
          </Col>

          <Col xs={24} md={7}>
            <Input.Search
              className="report-search-input"
              placeholder="Tìm theo tên nhân viên"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              size="large"
            />
          </Col>

          <Col xs={24} md={3}>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={onExport}
              loading={loading}
              size="large"
              style={{
                width: "100%",
                borderRadius: 10,
                fontWeight: 700,
                border: "none",
                background: "linear-gradient(135deg, #16a34a, #15803d)",
              }}
            >
              Excel
            </Button>
          </Col>
        </Row>

        <Tag color="processing" style={{ width: "fit-content", borderRadius: 999, paddingInline: 10 }}>
          Lọc theo thời gian và tên nhân viên để xem báo cáo chính xác hơn
        </Tag>
      </Space>

      <style jsx global>{`
        .report-filters-card {
          border: 1px solid #dbeafe;
          overflow: hidden;
        }
        .report-filters-card .ant-card-body {
          position: relative;
        }
        .report-filters-card .ant-card-body::after {
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
        .report-type-toggle .ant-radio-button-wrapper {
          border-color: #bfdbfe !important;
          color: #0f172a !important;
          background: #ffffff !important;
        }
        .report-type-toggle .ant-radio-button-wrapper-checked {
          background: linear-gradient(135deg, #06b6d4, #3b82f6) !important;
          border-color: transparent !important;
          color: #fff !important;
        }
        [data-theme="dark"] .report-type-toggle .ant-radio-button-wrapper {
          color: #e2e8f0 !important;
          background: #0f172a !important;
          border-color: #334155 !important;
        }
        [data-theme="dark"] .report-type-toggle .ant-radio-button-wrapper-checked {
          background: linear-gradient(135deg, #06b6d4, #3b82f6) !important;
          color: #fff !important;
          border-color: transparent !important;
        }
        .report-select .ant-select-selector,
        .report-input {
          border-color: #bfdbfe !important;
        }
        .report-search-input .ant-input,
        .report-search-input .ant-input-group-addon button {
          border-color: #bfdbfe !important;
        }
      `}</style>
    </Card>
  );
}
