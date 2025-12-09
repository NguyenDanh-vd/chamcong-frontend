//Cột bên phải hiển thị hoạt động mới nhất.

import { Avatar, Card, List } from "antd";
import { UserOutlined } from "@ant-design/icons";

interface RecentActivitiesProps {
  activities: any[];
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <Card title="Hoạt động gần đây" style={{ borderRadius: '16px', border: 'none', boxShadow: "0 4px 20px rgba(0,0,0,0.03)", height: '100%' }}>
      <List
        itemLayout="horizontal"
        dataSource={activities}
        renderItem={(item) => (
          <List.Item style={{ padding: '12px 0' }}>
            <List.Item.Meta
              avatar={
                <Avatar
                  src={item.avatar}
                  icon={!item.avatar ? <UserOutlined /> : undefined}
                  size={40}
                  style={{ backgroundColor: item.avatar ? 'transparent' : '#87d068' }}
                >
                  {!item.avatar && item.name ? item.name.charAt(item.name.lastIndexOf(" ") + 1).toUpperCase() : null}
                </Avatar>
              }
              title={<span style={{ fontWeight: 600 }}>{item.name}</span>}
              description={
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: item.status === 'Vắng mặt' ? '#EF4444' : '#10B981', fontWeight: 500 }}>
                    {item.action}
                  </span>
                  <span style={{ color: '#9CA3AF' }}>{item.time}</span>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
}