import { DatePicker, Card, Col, Row, Space, Tag } from "antd";
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
    <Card
      bordered={false}
      style={{ borderRadius: 16, boxShadow: "0 12px 26px rgba(15, 23, 42, 0.06)" }}
      bodyStyle={{ padding: 16 }}
    >
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} xl={5}>
            <DatePicker
              picker="month"
              value={thang}
              onChange={(val) => val && setThang(val)}
              format="YYYY-MM"
              allowClear={false}
              style={{ width: "100%", height: 40 }}
            />
          </Col>

          <Col xs={24} sm={12} xl={5}>
            <CustomButton
              icon={<CalculatorOutlined />}
              onClick={onTinhLuong}
              loading={tinhLuongLoading}
              style={{ width: "100%", borderRadius: 10 }}
            >
              Tính lương tự động
            </CustomButton>
          </Col>

          <Col xs={24} sm={12} xl={4}>
            <CustomButton icon={<ReloadOutlined />} onClick={onReload} style={{ width: "100%", borderRadius: 10 }}>
              Làm mới
            </CustomButton>
          </Col>

          <Col xs={24} sm={12} xl={4}>
            <CustomButton
              icon={<FileExcelOutlined />}
              onClick={onExport}
              style={{ width: "100%", borderRadius: 10, background: "linear-gradient(90deg, #22c55e, #16a34a)" }}
            >
              Xuất Excel
            </CustomButton>
          </Col>
        </Row>

        <Tag color="processing" style={{ width: "fit-content" }}>
          Chọn tháng để tính lương, đồng bộ dữ liệu và xuất báo cáo nhanh
        </Tag>
      </Space>
    </Card>
  );
}
