import { Checkbox, Col, Input, Row, Space, Tag } from "antd";
import { CheckOutlined, CloseOutlined, FileExcelOutlined, ReloadOutlined } from "@ant-design/icons";
import CustomButton from "@/components/CustomButton";

interface LeaveFiltersProps {
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

export default function LeaveFilters({
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
}: LeaveFiltersProps) {
  return (
    <div
      style={{
        borderRadius: 16,
        boxShadow: "0 12px 26px rgba(15, 23, 42, 0.06)",
        padding: 16,
        background: "#fff",
      }}
    >
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} xl={7}>
            <Input.Search
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
          <Tag color="processing">Đã chọn: {selectedCount}</Tag>
        </Space>
      </Space>
    </div>
  );
}
