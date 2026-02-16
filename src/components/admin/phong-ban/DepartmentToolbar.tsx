import { Button, Card, Col, Input, Row, Space, Tag } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";

interface DepartmentToolbarProps {
  onAdd: () => void;
  searchText: string;
  onSearch: (value: string) => void;
}

export default function DepartmentToolbar({ onAdd, searchText, onSearch }: DepartmentToolbarProps) {
  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 16,
        boxShadow: "0 12px 26px rgba(15, 23, 42, 0.06)",
      }}
      bodyStyle={{ padding: 16 }}
    >
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} xl={16}>
            <Input.Search
              allowClear
              size="large"
              value={searchText}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên phòng ban hoặc mô tả"
            />
          </Col>

          <Col xs={24} sm={12} xl={4}>
            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={() => onSearch("")}
              style={{ width: "100%", borderRadius: 10 }}
            >
              Đặt lại
            </Button>
          </Col>

          <Col xs={24} sm={12} xl={4}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onAdd}
              size="large"
              style={{
                width: "100%",
                borderRadius: 10,
                border: "none",
                fontWeight: 600,
                background: "linear-gradient(135deg, #16a34a, #15803d)",
              }}
            >
              Thêm phòng ban
            </Button>
          </Col>
        </Row>

        <Tag color="processing" style={{ width: "fit-content" }}>
          Tìm kiếm nhanh theo tên phòng ban và mô tả
        </Tag>
      </Space>
    </Card>
  );
}
