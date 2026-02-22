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
      className="department-toolbar-card"
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
          <Col xs={24} xl={16}>
            <Input.Search
              className="department-search-input"
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
                fontWeight: 700,
                background: "linear-gradient(135deg, #16a34a, #15803d)",
              }}
            >
              Thêm phòng ban
            </Button>
          </Col>
        </Row>

        <Tag color="processing" style={{ width: "fit-content", borderRadius: 999, paddingInline: 10 }}>
          Tìm kiếm nhanh theo tên phòng ban và mô tả
        </Tag>
      </Space>

      <style jsx global>{`
        .department-toolbar-card {
          border: 1px solid #dbeafe;
          overflow: hidden;
        }
        .department-toolbar-card .ant-card-body {
          position: relative;
        }
        .department-toolbar-card .ant-card-body::after {
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
        .department-search-input .ant-input,
        .department-search-input .ant-input-group-addon button {
          border-color: #bfdbfe !important;
        }
      `}</style>
    </Card>
  );
}
