// shared/lib/mediapipe/pose-processor.ts
import { Pose } from "@mediapipe/pose";

export const createPoseProcessor = () => {
  const pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
  });
  
  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  
  return pose;
};

export type PoseProcessor = ReturnType<typeof createPoseProcessor>;