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
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "user",
          }}
          onUserMedia={() => setCameraReady(true)}
          onUserMediaError={onError}
          className="rounded-full border-2 border-gray-300 aspect-square"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 rounded-full aspect-square"
          style={{ width: '100%', height: '100%' }}
        />
        {processing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
            <div className="text-white text-lg">{processingLabel}</div>
          </div>
        )}
        {countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
            <div className="text-white text-6xl font-bold">{countdown}</div>
          </div>
        )}
        {faceDetected && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded">
            Face Detected
          </div>
        )}
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">{guideTitle}</h2>
        <p className="text-gray-600">{guideDescription}</p>
        <p className="text-sm text-gray-500 mt-2">{stepProgress}</p>
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