//Component này sẽ gói gọn toàn bộ logic: hiển thị avatar, click để upload, bật webcam, chụp ảnh và xử lý ảnh.

import React, { useState, useRef } from "react";
import { Avatar, Button, Modal, message } from "antd";
import { UserOutlined, CameraOutlined } from "@ant-design/icons";
import Webcam from "react-webcam";

interface AvatarUploadProps {
  value?: File; // Nhận file từ Form cha
  onChange?: (file: File) => void; // Trả file về Form cha
  previewUrl?: string; // Để hiện ảnh cũ nếu đang edit
}

export default function AvatarUpload({ value, onChange, previewUrl }: AvatarUploadProps) {
  const [cameraVisible, setCameraVisible] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý khi chọn file từ máy
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalPreview(url);
      onChange?.(file); // Gửi ra ngoài
    }
  };

  // Xử lý chụp ảnh từ webcam
  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    // Convert Base64 sang File
    const byteString = atob(imageSrc.split(",")[1]);
    const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], "avatar_captured.jpg", { type: mimeString });

    setLocalPreview(imageSrc);
    onChange?.(file); // Gửi ra ngoài
    setCameraVisible(false);
    message.success("Đã chụp ảnh!");
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Vùng hiển thị Avatar */}
      <div className="relative group">
        <Avatar
          size={100}
          src={localPreview || previewUrl}
          icon={<UserOutlined />}
          className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 transition"
          onClick={() => fileInputRef.current?.click()}
        />
      </div>

      {/* Nút bật Camera */}
      <Button icon={<CameraOutlined />} onClick={() => setCameraVisible(true)}>
        Chụp ảnh
      </Button>

      {/* Modal Camera */}
      <Modal
        title="Chụp ảnh chân dung"
        open={cameraVisible}
        onCancel={() => setCameraVisible(false)}
        footer={null}
        destroyOnClose
      >
        <div className="flex flex-col items-center">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={400}
            height={300}
            videoConstraints={{ facingMode: "user" }}
            className="rounded-lg mb-4 w-full"
          />
          <Button type="primary" onClick={capturePhoto} block size="large">
            Chụp & Lưu
          </Button>
        </div>
      </Modal>
    </div>
  );
}