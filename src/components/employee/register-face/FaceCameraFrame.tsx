//Component hiển thị (Webcam, Loading spinner, Khung lưới).

import { FaSpinner } from "react-icons/fa";
import Webcam from "react-webcam";

interface FaceCameraFrameProps {
  webcamRef: React.RefObject<Webcam>;
  processing: boolean;
  cameraReady: boolean;
  setCameraReady: (ready: boolean) => void;
  onError: () => void;
}

export default function FaceCameraFrame({
  webcamRef,
  processing,
  cameraReady,
  setCameraReady,
  onError,
}: FaceCameraFrameProps) {
  return (
    <div
      className={`relative w-full max-w-sm aspect-square bg-black rounded-full overflow-hidden border-[6px] shadow-xl mb-8 group transition-colors duration-300 ${
        processing ? "border-yellow-400" : "border-blue-100"
      }`}
    >
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={720}
        height={720}
        videoConstraints={{ facingMode: "user", aspectRatio: 1 }}
        onUserMedia={() => setCameraReady(true)}
        onUserMediaError={onError}
        className="w-full h-full object-cover scale-x-[-1]"
      />

      {/* Hiệu ứng lưới hướng dẫn */}
      {cameraReady && !processing && (
        <div className="absolute inset-0 border-4 border-dashed border-white/40 rounded-full animate-pulse pointer-events-none"></div>
      )}

      {/* Loading Overlay */}
      {processing && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10">
          <FaSpinner className="animate-spin text-5xl mb-3 text-yellow-400" />
          <span className="font-bold text-lg">Đang phân tích...</span>
        </div>
      )}
    </div>
  );
}