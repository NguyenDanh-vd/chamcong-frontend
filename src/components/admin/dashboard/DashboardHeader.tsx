//Phần đầu trang chứa thông tin Admin, đồng hồ và nút chấm công.

import { Avatar, Button, DatePicker, Input, Tooltip } from "antd";
import { SearchOutlined, ScanOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface DashboardHeaderProps {
  userName: string;
  userAvatar: string;
  currentTime: dayjs.Dayjs | null;
  onOpenCheckIn: () => void;
}

export default function DashboardHeader({
  userName,
  userAvatar,
  currentTime,
  onOpenCheckIn,
}: DashboardHeaderProps) {
  return (
    <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Avatar
          size={64}
          src={userAvatar}
          icon={!userAvatar ? <UserOutlined /> : undefined}
          style={{ border: '2px solid #3B82F6', backgroundColor: '#f0f0f0' }}
        />
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#1F2937' }}>Xin chào, {userName} 👋</h2>
          <p style={{ margin: '4px 0 0', color: '#6B7280' }}>
            Hôm nay là {currentTime ? currentTime.locale('vi').format('dddd, DD/MM/YYYY') : "..."}
          </p>
        </div>
        <Tooltip title="Chấm công ngay">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<ScanOutlined style={{ fontSize: '22px' }} />}
            onClick={onOpenCheckIn}
            style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)', marginLeft: 10 }}
          />
        </Tooltip>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Input prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />} placeholder="Tìm kiếm..." style={{ width: 200, borderRadius: '8px' }} />
        <DatePicker placeholder="Chọn ngày" style={{ borderRadius: '8px' }} defaultValue={dayjs()} format={"DD/MM/YYYY"} />
      </div>
    </div>
  );
}