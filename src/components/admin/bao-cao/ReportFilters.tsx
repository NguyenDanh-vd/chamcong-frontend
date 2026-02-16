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
      bordered={false}
      style={{ borderRadius: 16, boxShadow: "0 12px 26px rgba(15, 23, 42, 0.06)" }}
      bodyStyle={{ padding: 16 }}
    >
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={6}>
            <Radio.Group
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
              style={{ width: "100%", borderRadius: 10, fontWeight: 600 }}
            >
              Excel
            </Button>
          </Col>
        </Row>

        <Tag color="processing" style={{ width: "fit-content" }}>
          Lọc theo thời gian và tên nhân viên để xem báo cáo chính xác hơn
        </Tag>
      </Space>
    </Card>
  );
}
