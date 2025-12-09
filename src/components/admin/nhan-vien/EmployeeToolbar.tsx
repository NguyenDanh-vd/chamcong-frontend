//Thanh công cụ chứa ô tìm kiếm và các nút chức năng.

import { Button, Col, Input, Popconfirm, Row } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

interface EmployeeToolbarProps {
  searchText: string;
  onSearch: (value: string) => void;
  onAdd: () => void;
  onBulkDelete: () => void;
  selectedCount: number;
}

export default function EmployeeToolbar({
  searchText,
  onSearch,
  onAdd,
  onBulkDelete,
  selectedCount,
}: EmployeeToolbarProps) {
  return (
    <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
      <Col flex="auto">
        <Input.Search
          placeholder="Tìm kiếm theo tên, email hoặc phòng ban"
          value={searchText}
          onChange={(e) => onSearch(e.target.value)}
          allowClear
        />
      </Col>
      <Col>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
          style={{
            border: "none",
            borderRadius: "14px",
            padding: "12px 20px",
            fontWeight: 600,
            fontSize: "0.95rem",
            background: "linear-gradient(135deg, #34d399, #10b981)",
            color: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          Thêm nhân viên
        </Button>
      </Col>
      <Col>
        <Popconfirm
          title="Bạn có chắc muốn xóa những nhân viên đã chọn?"
          onConfirm={onBulkDelete}
          okText="Xóa"
          cancelText="Hủy"
          disabled={selectedCount === 0}
        >
          <Button
            type="primary"
            icon={<DeleteOutlined />}
            disabled={selectedCount === 0}
            style={{
              border: "none",
              borderRadius: "14px",
              padding: "12px 20px",
              fontWeight: 600,
              fontSize: "0.95rem",
              background: "linear-gradient(135deg, #f87171, #ef4444)",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            Xóa đã chọn
          </Button>
        </Popconfirm>
      </Col>
    </Row>
  );
}