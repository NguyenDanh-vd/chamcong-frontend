import Webcam from "react-webcam";

interface CameraModalProps {
  webcamRef: any;
  onCapture: () => void;
  onCancel: () => void;
}

export default function CameraModal({ webcamRef, onCapture, onCancel }: CameraModalProps) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl w-full max-w-sm">
        <div className="relative rounded-lg overflow-hidden bg-black aspect-square mb-4">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover"
            videoConstraints={{ facingMode: "user" }}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCapture}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30"
          >
            Chụp
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-xl font-bold"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}