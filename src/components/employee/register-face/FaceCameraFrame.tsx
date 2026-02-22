import { FaSpinner, FaCamera } from "react-icons/fa";
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
    <div className="mb-5 flex justify-center">
      <div
        className={`relative h-[310px] w-[310px] rounded-full border-[7px] p-1.5 shadow-[0_20px_42px_-20px_rgba(6,182,212,0.75)] transition-colors md:h-[360px] md:w-[360px] ${
          processing
            ? "border-amber-400 bg-gradient-to-tr from-amber-200 to-yellow-200"
            : "border-cyan-300 bg-gradient-to-tr from-sky-500 via-cyan-500 to-teal-500"
        }`}
      >
        <div className="relative h-full w-full overflow-hidden rounded-full bg-black">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={720}
            height={720}
            videoConstraints={{ facingMode: "user", aspectRatio: 1 }}
            onUserMedia={() => setCameraReady(true)}
            onUserMediaError={onError}
            className="h-full w-full scale-x-[-1] object-cover"
          />

          {cameraReady && !processing ? (
            <div className="pointer-events-none absolute inset-0 rounded-full border-4 border-dashed border-white/40 animate-pulse" />
          ) : null}

          {!cameraReady ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 text-center text-white">
              <FaCamera className="text-2xl" />
              <p className="text-sm font-medium">Đang khởi động camera...</p>
            </div>
          ) : null}

          {processing ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/65 text-white">
              <FaSpinner className="mb-2 animate-spin text-4xl text-amber-300" />
              <span className="text-base font-bold">Đang phân tích...</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
