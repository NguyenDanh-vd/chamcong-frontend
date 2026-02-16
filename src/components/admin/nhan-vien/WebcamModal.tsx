import { Alert, Button, Modal, Space, Typography } from "antd";
import Webcam from "react-webcam";

interface WebcamModalProps {
  open: boolean;
  onCancel: () => void;
  onCapture: () => void;
  webcamRef: React.RefObject<Webcam>;
}

const { Text } = Typography;

export default function WebcamModal({
  open,
  onCancel,
  onCapture,
  webcamRef,
}: WebcamModalProps) {
  return (
    <Modal
      title="Chụp avatar từ webcam"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={620}
      centered
    >
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Alert
          type="info"
          showIcon
          message="Cần giữ khung hình rõ mặt, đủ ánh sáng và nhìn thẳng vào camera"
          style={{ borderRadius: 10 }}
        />

        <div
          style={{
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid #dbeafe",
            boxShadow: "0 10px 18px rgba(30, 64, 175, 0.12)",
          }}
        >
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            videoConstraints={{ facingMode: "user" }}
          />
        </div>

        <Text type="secondary" style={{ fontSize: 12 }}>
          Lưu ý: Ảnh sau khi chụp sẽ được tự động gắn vào form nhân viên ngay lập tức.
        </Text>

        <Button
          type="primary"
          onClick={onCapture}
          block
          style={{
            height: 40,
            borderRadius: 10,
            border: "none",
            fontWeight: 700,
            background: "linear-gradient(135deg, #0284c7, #2563eb)",
          }}
        >
          Chụp và sử dụng ảnh này
        </Button>
      </Space>
    </Modal>
  );
}
