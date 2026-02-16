//Modal xử lý điểm danh của Admin.

import { Button, Modal, Tag } from "antd";
import { LoginOutlined, LogoutOutlined, CheckCircleOutlined as DoneIcon } from "@ant-design/icons";
import dayjs from "dayjs";

interface CheckInModalProps {
  open: boolean;
  onCancel: () => void;
  userName: string;
  currentTime: dayjs.Dayjs | null;
  attendanceStatus: "none" | "checked-in" | "done";
  onCheckIn: () => void;
}

export default function CheckInModal({
  open,
  onCancel,
  userName,
  currentTime,
  attendanceStatus,
  onCheckIn,
}: CheckInModalProps) {
  const getButtonProps = () => {
    switch (attendanceStatus) {
      case "none": return { text: "Vào ca (Check-in)", icon: <LoginOutlined />, type: "primary" as const, danger: false, disabled: false };
      case "checked-in": return { text: "Tan ca (Check-out)", icon: <LogoutOutlined />, type: "primary" as const, danger: true, disabled: false };
      case "done": return { text: "Hoàn thành hôm nay", icon: <DoneIcon />, type: "default" as const, danger: false, disabled: true };
    }
  };
  const btnProps = getButtonProps();

  return (
    <Modal open={open} onCancel={onCancel} footer={null} centered width={420} bodyStyle={{ padding: 28 }}>
      <div style={{ textAlign: "center" }}>
        <h3 style={{ fontWeight: 800, fontSize: "1.5rem", marginBottom: 6 }}>Xin chào, {userName}!</h3>
        <p style={{ marginTop: 0, color: '#6B7280' }}>Thời gian hiện tại</p>
        <div style={{ fontSize: "2.6rem", fontWeight: 800, color: "#3B82F6", margin: "8px 0 12px" }}>
          {currentTime ? currentTime.format("HH:mm:ss") : "--:--:--"}
        </div>
        <Tag style={{ marginBottom: 18, padding: '6px 10px', borderRadius: 8 }} color={attendanceStatus === "checked-in" ? "processing" : attendanceStatus === 'done' ? 'default' : 'warning'}>
          {attendanceStatus === "none" ? "Chưa vào ca" : attendanceStatus === "checked-in" ? "Đang làm việc" : "Hoàn thành"}
        </Tag>
        <div style={{ marginTop: 4 }}>
          <Button
            type={btnProps.type}
            danger={btnProps.danger}
            icon={btnProps.icon}
            onClick={onCheckIn}
            disabled={btnProps.disabled}
            size="large"
            style={{ width: "100%", height: "48px", fontWeight: 700 }}
          >
            {btnProps.text}
          </Button>
        </div>
      </div>
    </Modal>
  );
}