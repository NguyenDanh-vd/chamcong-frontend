"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import api from "@/utils/api";

interface FaceCameraFrameProps {
  webcamRef: React.RefObject<Webcam>;
  processing: boolean;
  processingLabel?: string;
  cameraReady: boolean;
  setCameraReady: (ready: boolean) => void;
  onError: () => void;
  guideTitle: string;
  guideDescription: string;
  stepProgress?: string;
  countdown: number | null;
  modelsLoaded?: boolean;
  faceDetected?: boolean;
}

function FaceCameraFrame({
  webcamRef,
  processing,
  processingLabel = "Đang xử lý...",
  cameraReady,
  setCameraReady,
  onError,
  guideTitle,
  guideDescription,
  stepProgress,
  countdown,
  modelsLoaded = false,
  faceDetected = false,
}: FaceCameraFrameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (cameraReady && modelsLoaded && webcamRef.current?.video) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
        }
      }
    }
  }, [cameraReady, modelsLoaded, webcamRef]);

  return (
    <div className="mb-6 flex flex-col items-center gap-4">
      <div className="relative h-72 w-72 overflow-hidden rounded-full border-4 border-sky-400 bg-slate-900 shadow-xl md:h-80 md:w-80">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.92}
          width={480}
          height={480}
          videoConstraints={{
            width: 480,
            height: 480,
            facingMode: "user",
          }}
          onUserMedia={() => setCameraReady(true)}
          onUserMediaError={onError}
          className="h-full w-full scale-x-[-1] rounded-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute left-0 top-0 aspect-square rounded-full"
          style={{ width: "100%", height: "100%" }}
        />
        {processing && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 p-4 text-center">
            <div className="text-base font-semibold text-white">{processingLabel}</div>
          </div>
        )}
        {countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/45">
            <div className="text-6xl font-extrabold text-white drop-shadow">{countdown}</div>
            <div className="mt-3 px-4 text-center text-white">
              <div className="text-base font-bold">{guideTitle}</div>
              <div className="text-xs opacity-90">{guideDescription}</div>
            </div>
          </div>
        )}
        {faceDetected && (
          <div className="absolute right-2 top-2 rounded bg-green-500 px-2 py-1 text-white">
            Face Detected
          </div>
        )}
      </div>

      <div className="text-center">
        {countdown === null && (
          <>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{guideTitle}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{guideDescription}</p>
          </>
        )}
        {stepProgress ? (
          <p className="mt-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            {stepProgress}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function FaceRegister() {
  const webcamRef = useRef<Webcam | null>(null);

  const [images, setImages] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [autoCapturing, setAutoCapturing] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        setModelsLoaded(true);
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };
    loadModels();
  }, []);

  const detectFaces = useCallback(async () => {
    if (!modelsLoaded || !cameraReady || !webcamRef.current?.video) return;

    const video = webcamRef.current.video;
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());

    setFaceDetected(detections.length > 0);

    if (detections.length > 0 && !autoCapturing && images.length < 5 && !processing) {
      setAutoCapturing(true);
      setTimeout(() => {
        captureAuto();
      }, 1000); // Capture after 1 second of detection
    }
  }, [modelsLoaded, cameraReady, autoCapturing, images.length, processing]);

  useEffect(() => {
    if (modelsLoaded && cameraReady) {
      const interval = setInterval(detectFaces, 100);
      return () => clearInterval(interval);
    }
  }, [modelsLoaded, cameraReady, detectFaces]);

  const captureAuto = () => {
    const image = webcamRef.current?.getScreenshot();
    if (image) {
      const newImages = [...images, image];
      setImages(newImages);
      if (newImages.length >= 5) {
        uploadImages(newImages);
      } else {
        setAutoCapturing(false);
      }
    }
  };

  const uploadImages = async (imgs: string[]) => {
    try {
      setProcessing(true);

      await api.post("/facedata/register", {
        images: imgs,
      });

      alert("Đăng ký khuôn mặt thành công");
    } catch (error) {
      console.error(error);
      alert("Đăng ký khuôn mặt thất bại");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">

      <FaceCameraFrame
        webcamRef={webcamRef}
        processing={processing}
        cameraReady={cameraReady}
        setCameraReady={setCameraReady}
        onError={() => alert("Camera lỗi")}
        guideTitle={autoCapturing ? "Đang tự động chụp..." : faceDetected ? "Khuôn mặt được phát hiện" : "Hãy nhìn vào camera"}
        guideDescription={autoCapturing ? `Đã chụp ${images.length}/5 ảnh` : faceDetected ? "Giữ yên để chụp tự động" : "Đảm bảo khuôn mặt rõ ràng"}
        stepProgress={`${images.length}/5`}
        countdown={null}
        modelsLoaded={modelsLoaded}
        faceDetected={faceDetected}
      />

    </div>
  );
}

export { FaceCameraFrame };