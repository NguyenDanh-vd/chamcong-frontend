import Webcam from "react-webcam";

interface CameraModalProps {
  webcamRef: any;
  onCapture: () => void;
  onCancel: () => void;
}

export default function CameraModal({ webcamRef, onCapture, onCancel }: CameraModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Chụp ảnh đại diện</p>
        <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-black">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="h-full w-full object-cover"
            videoConstraints={{ facingMode: "user" }}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCapture}
            className="flex-1 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 py-3 font-bold text-white shadow-lg shadow-cyan-200"
          >
            Chụp
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-100 py-3 font-bold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
