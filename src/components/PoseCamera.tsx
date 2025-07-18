import React, { useEffect, useRef, useState } from "react";
import type {Results } from "@mediapipe/pose";
import { Pose,POSE_CONNECTIONS } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { getAngle, RepCounter } from "../utils/poseUtils";

const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

const counter = new RepCounter(60, 160); // настройка под локоть

type PoseCameraProps = {
  onResults?: (results: Results) => void;
};

export function PoseCamera({ onResults }: PoseCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reps, setReps] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    pose.onResults((results: Results) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(-1, 1); // Mirror for front camera
      ctx.translate(-canvas.width, 0);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      if (results.poseLandmarks) {
        // Flip horizontally to match video
        const mirroredLandmarks = results.poseLandmarks.map(landmark => ({
          ...landmark,
          x: 1 - landmark.x
        }));

        drawConnectors(ctx, mirroredLandmarks, POSE_CONNECTIONS, { 
          color: "#00FF00", 
          lineWidth: 2 
        });
        
        drawLandmarks(ctx, mirroredLandmarks, { 
          color: "#FF0000", 
          lineWidth: 1,
          radius: 3
        });

        // Use left arm: shoulder(11) -> elbow(13) -> wrist(15)
        const lm = mirroredLandmarks;
        const leftAngle = getAngle(lm[11], lm[13], lm[15]);
        const newCount = counter.update(leftAngle);
        setReps(newCount);
      }

      // Передаем результаты наружу
      if (onResults) {
        onResults(results);
      }
    });

    const camera = new Camera(video, {
      onFrame: async () => {
        await pose.send({ image: video });
      },
      width: 640,
      height: 480,
      facingMode: "user"
    });
    
    camera.start();

    return () => {
      camera.stop();
    };
  }, [onResults]);

  return (
    <div style={{ position: "relative" }}>
      <video 
        ref={videoRef} 
        style={{ display: "none" }} 
        playsInline
      />
      <canvas 
        ref={canvasRef} 
        width={640} 
        height={480} 
        style={{ 
          width: '100%', 
          height: 'auto',
          border: "1px solid #444",
          borderRadius: "10px",
          background: "#222"
        }} 
      />
      <div style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        background: "rgba(0, 0, 0, 0.7)",
        color: "white",
        padding: "8px 15px",
        borderRadius: "20px",
        fontSize: "1.2rem"
      }}>
        Повторения: <strong>{reps}</strong>
      </div>
    </div>
  );
}