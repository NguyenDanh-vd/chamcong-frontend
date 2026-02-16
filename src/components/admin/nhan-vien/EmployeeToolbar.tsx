import { Button, Card, Col, Input, Popconfirm, Row, Select, Space, Tag } from "antd";
import { PlusOutlined, DeleteOutlined, ReloadOutlined, FilterOutlined } from "@ant-design/icons";

interface OptionType {
  value: string;
  label: string;
}

interface EmployeeToolbarProps {
  searchText: string;
  onSearch: (value: string) => void;
  onAdd: () => void;
  onBulkDelete: () => void;
  selectedCount: number;
  totalCount: number;
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  departmentOptions: OptionType[];
  selectedRole: string;
  onRoleChange: (value: string) => void;
  roleOptions: string[];
  onResetFilters: () => void;
}

const roleLabelMap: Record<string, string> = {
  nhanvien: "Nhân viên",
  nhansu: "Nhân sự",
  quantrivien: "Quản trị viên",
};

export default function EmployeeToolbar({
  searchText,
  onSearch,
  onAdd,
  onBulkDelete,
  selectedCount,
  totalCount,
  selectedDepartment,
  onDepartmentChange,
  departmentOptions,
  selectedRole,
  onRoleChange,
  roleOptions,
  onResetFilters,
}: EmployeeToolbarProps) {
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
          <Col xs={24} xl={12}>
            <Input.Search
              allowClear
              size="large"
              value={searchText}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Tìm theo mã NV, họ tên, email, phòng ban"
            />
          </Col>

          <Col xs={24} sm={12} xl={5}>
            <Select
              size="large"
              value={selectedDepartment}
              style={{ width: "100%" }}
              onChange={onDepartmentChange}
              options={[{ value: "all", label: "Tất cả phòng ban" }, ...departmentOptions]}
            />
          </Col>

          <Col xs={24} sm={12} xl={4}>
            <Select
              size="large"
              value={selectedRole}
              style={{ width: "100%" }}
              onChange={onRoleChange}
              options={[
                { value: "all", label: "Tất cả vai trò" },
                ...roleOptions.map((role) => ({ value: role, label: roleLabelMap[role] || role })),
              ]}
            />
          </Col>

          <Col xs={24} xl={3}>
            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={onResetFilters}
              style={{ width: "100%", borderRadius: 10 }}
            >
              Đặt lại
            </Button>
          </Col>
        </Row>

        <Row gutter={[12, 12]} align="middle" justify="space-between">
          <Col>
            <Space wrap>
              <Tag icon={<FilterOutlined />} color="processing">
                Da loc: {selectedCount > 0 ? `${selectedCount} đang được chọn` : "Không có dòng được chọn"}
              </Tag>
              <Tag color="default">Tổng số dữ liệu: {totalCount}</Tag>
            </Space>
          </Col>

          <Col>
            <Space wrap>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onAdd}
                style={{
                  borderRadius: 10,
                  border: "none",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                }}
              >
                Thêm nhan vien
              </Button>

              <Popconfirm
                title="Bạn có chắc muốn xóa các nhân viên đã chọn?"
                onConfirm={onBulkDelete}
                okText="Xóa"
                cancelText="ủy"
                disabled={selectedCount === 0}
              >
                <Button
                  danger
                  type="primary"
                  icon={<DeleteOutlined />}
                  disabled={selectedCount === 0}
                  style={{ borderRadius: 10, fontWeight: 600 }}
                >
                  Xóa đã chọn
                </Button>
              </Popconfirm>
            </Space>
          </Col>
        </Row>
      </Space>
    </Card>
  );
}
