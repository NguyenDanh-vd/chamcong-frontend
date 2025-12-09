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
    <Modal open={open} onCancel={onCancel} footer={null} centered width={400}>
      <div style={{ textAlign: "center", paddingTop: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.4rem" }}>Xin chào, {userName}!</h3>
        <div style={{ fontSize: "3rem", fontWeight: 700, color: "#3B82F6", margin: "10px 0" }}>
          {currentTime ? currentTime.format("HH:mm:ss") : "--:--:--"}
        </div>
        <Tag style={{ marginBottom: 20 }} color={attendanceStatus === "checked-in" ? "processing" : "default"}>
          {attendanceStatus === "none" ? "Chưa vào ca" : attendanceStatus === "checked-in" ? "Đang làm việc" : "Hoàn thành"}
        </Tag>
        <Button
          type={btnProps.type}
          danger={btnProps.danger}
          icon={btnProps.icon}
          onClick={onCheckIn}
          disabled={btnProps.disabled}
          size="large"
          style={{ width: "100%", height: "48px" }}
        >
          {btnProps.text}
        </Button>
      </div>
    </Modal>
  );
}