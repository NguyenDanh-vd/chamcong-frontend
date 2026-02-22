import { Card, Checkbox, Col, Input, Row, Space, Tag } from "antd";
import { CheckOutlined, CloseOutlined, FileExcelOutlined, ReloadOutlined } from "@ant-design/icons";
import CustomButton from "@/components/CustomButton";

interface OvertimeFiltersProps {
  searchName: string;
  setSearchName: (val: string) => void;
  selectedCount: number;
  hasData: boolean;
  onExportAll: () => void;
  onExportSelected: () => void;
  onBulkUpdate: (status: string) => void;
  onSelectAll: (checked: boolean) => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onReset: () => void;
}

export default function OvertimeFilters({
  searchName,
  setSearchName,
  selectedCount,
  hasData,
  onExportAll,
  onExportSelected,
  onBulkUpdate,
  onSelectAll,
  isAllSelected,
  isIndeterminate,
  onReset,
}: OvertimeFiltersProps) {
  return (
    <Card
      className="ot-filters-card"
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
          <Col xs={24} xl={7}>
            <Input.Search
              className="ot-search-input"
              allowClear
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Tìm theo tên nhân viên"
              size="large"
            />
          </Col>

          <Col xs={24} sm={12} xl={4}>
            <CustomButton icon={<FileExcelOutlined />} onClick={onExportAll} style={{ width: "100%", borderRadius: 10 }}>
              Xuất toàn bộ
            </CustomButton>
          </Col>

          <Col xs={24} sm={12} xl={4}>
            <CustomButton
              icon={<FileExcelOutlined />}
              onClick={onExportSelected}
              disabled={selectedCount === 0}
              style={{ width: "100%", borderRadius: 10 }}
            >
              Xuất đã chọn
            </CustomButton>
          </Col>

          <Col xs={24} sm={12} xl={4}>
            <CustomButton
              icon={<CheckOutlined />}
              onClick={() => onBulkUpdate("da-duyet")}
              disabled={selectedCount === 0}
              style={{ width: "100%", borderRadius: 10, background: "linear-gradient(135deg, #16a34a, #15803d)" }}
            >
              Duyệt ({selectedCount})
            </CustomButton>
          </Col>

          <Col xs={24} sm={12} xl={3}>
            <CustomButton
              icon={<CloseOutlined />}
              onClick={() => onBulkUpdate("tu-choi")}
              disabled={selectedCount === 0}
              style={{ width: "100%", borderRadius: 10, background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
            >
              Từ chối
            </CustomButton>
          </Col>

          <Col xs={24} sm={12} xl={2}>
            <CustomButton icon={<ReloadOutlined />} onClick={onReset} style={{ width: "100%", borderRadius: 10 }}>
              Reset
            </CustomButton>
          </Col>
        </Row>

        <Space wrap>
          {hasData ? (
            <Checkbox
              indeterminate={isIndeterminate}
              checked={isAllSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
            >
              Chọn tất cả
            </Checkbox>
          ) : null}
          <Tag color="processing" style={{ borderRadius: 999, paddingInline: 10 }}>
            Đã chọn: {selectedCount}
          </Tag>
        </Space>
      </Space>

      <style jsx global>{`
        .ot-filters-card {
          border: 1px solid #dbeafe;
          overflow: hidden;
        }
        [data-theme="dark"] .ot-filters-card {
          border-color: #334155 !important;
          background: linear-gradient(145deg, #0f172a 0%, #111827 45%, #0b1220 100%) !important;
          box-shadow: 0 14px 28px rgba(2, 6, 23, 0.55) !important;
        }
        .ot-filters-card .ant-card-body {
          position: relative;
        }
        .ot-filters-card .ant-card-body::after {
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
        .ot-search-input .ant-input,
        .ot-search-input .ant-input-group-addon button {
          border-color: #bfdbfe !important;
        }
        [data-theme="dark"] .ot-search-input .ant-input,
        [data-theme="dark"] .ot-search-input .ant-input-group-addon button {
          background: #0f172a !important;
          border-color: #334155 !important;
          color: #e2e8f0 !important;
        }
        [data-theme="dark"] .ot-search-input .ant-input::placeholder {
          color: #94a3b8 !important;
        }
        [data-theme="dark"] .ot-filters-card .ant-checkbox + span {
          color: #e2e8f0 !important;
        }
        .ot-search-input .ant-input:focus,
        .ot-search-input .ant-input-focused {
          border-color: #38bdf8 !important;
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.18) !important;
        }
      `}</style>
    </Card>
  );
}
