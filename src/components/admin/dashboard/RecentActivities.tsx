//Cột bên phải hiển thị hoạt động mới nhất.

import { Avatar, Card, List } from "antd";
import { UserOutlined } from "@ant-design/icons";

interface RecentActivitiesProps {
  activities: any[];
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <Card
      title="Hoạt động gần đây"
      style={{
        borderRadius: "18px",
        border: "1px solid #edf2f7",
        boxShadow: "0 10px 24px rgba(0,0,0,0.04)",
        height: "100%",
      }}
      bodyStyle={{ paddingTop: 8 }}
    >
      {activities.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", color: "#9CA3AF" }}>Chưa có hoạt động gần đây</div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={activities}
          renderItem={(item) => (
            <List.Item style={{ padding: "12px 0", borderBlockEnd: "1px solid #f1f5f9" }}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={item.avatar}
                    icon={!item.avatar ? <UserOutlined /> : undefined}
                    size={40}
                    style={{
                      backgroundColor: item.avatar ? "transparent" : "#e6f4ea",
                      color: "#065f46",
                      border: item.avatar ? "1px solid #e5e7eb" : "none",
                    }}
                  >
                    {!item.avatar && item.name ? item.name.charAt(item.name.lastIndexOf(" ") + 1).toUpperCase() : null}
                  </Avatar>
                }
                title={<span style={{ fontWeight: 600 }}>{item.name}</span>}
                description={
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", gap: 8 }}>
                    <span
                      style={{
                        color: item.status === "Vắng mặt" ? "#EF4444" : "#10B981",
                        fontWeight: 700,
                      }}
                    >
                      {item.action}
                    </span>
                    <span style={{ color: "#94a3b8" }}>{item.time}</span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}

      {activities.length > 0 && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <a style={{ color: "#2563eb", fontWeight: 700 }}>Xem tất cả</a>
        </div>
      )}
    </Card>
  );
}
