//Modal chụp ảnh.

import { Modal, Button } from "antd";
import Webcam from "react-webcam";

interface WebcamModalProps {
  open: boolean;
  onCancel: () => void;
  onCapture: () => void;
  webcamRef: React.RefObject<Webcam>;
}

export default function WebcamModal({
  open,
  onCancel,
  onCapture,
  webcamRef,
}: WebcamModalProps) {
  return (
    <Modal
      title="Chụp ảnh"
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width="100%"
        videoConstraints={{ facingMode: "user" }}
      />
      <Button type="primary" onClick={onCapture} block style={{ marginTop: 12 }}>
        Chụp & Lưu
      </Button>
    </Modal>
  );
}