//Chứa nút "Thêm phòng ban" và ô "Tìm kiếm".

import { Button, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface DepartmentToolbarProps {
  onAdd: () => void;
  searchText: string;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DepartmentToolbar({
  onAdd,
  searchText,
  onSearch,
}: DepartmentToolbarProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={onAdd}
        size="large"
        style={{
          background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
          color: "#fff",
          border: "none",
          fontWeight: 600,
          borderRadius: "8px",
          padding: "10px 20px",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "15px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = "0.95";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = "1";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
        }}
      >
        Thêm phòng ban mới
      </Button>

      <Input.Search
        placeholder="Tìm kiếm theo tên hoặc mô tả..."
        value={searchText}
        onChange={onSearch}
        allowClear
        size="large"
        style={{ width: 300 }}
      />
    </div>
  );
}