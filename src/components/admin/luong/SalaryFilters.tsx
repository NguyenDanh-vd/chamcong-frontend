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
      className="salary-filters-card"
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
          <Col xs={24} sm={12} xl={5}>
            <DatePicker
              className="salary-month-picker"
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

        <Tag color="processing" style={{ width: "fit-content", borderRadius: 999, paddingInline: 10 }}>
          Chọn tháng để tính lương, đồng bộ dữ liệu và xuất báo cáo nhanh
        </Tag>
      </Space>

      <style jsx global>{`
        .salary-filters-card {
          border: 1px solid #dbeafe;
          overflow: hidden;
        }
        .salary-filters-card .ant-card-body {
          position: relative;
        }
        .salary-filters-card .ant-card-body::after {
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
        .salary-month-picker.ant-picker {
          border-radius: 10px;
          border-color: #bfdbfe;
          transition: all 0.2s ease;
          background: #fff;
        }
        .salary-month-picker.ant-picker:hover,
        .salary-month-picker.ant-picker-focused {
          border-color: #38bdf8;
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.18);
        }
      `}</style>
    </Card>
  );
}
