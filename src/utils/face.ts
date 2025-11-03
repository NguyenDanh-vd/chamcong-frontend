import * as faceapi from "face-api.js";

export async function loadFaceModels() {
  const MODEL_URL = "/models";

  // Load các model face-api.js cùng lúc
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);

  console.log("Face-api models loaded successfully");
}
