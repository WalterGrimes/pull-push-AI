import React, { useEffect, useState } from "react";
import type { Results } from "@mediapipe/pose";
import { getAngle } from "../utils/poseUtils";

interface PushUpTrackerProps {
  results: Results | null;
}

export function PushUpTracker({ results }: PushUpTrackerProps) {
  const [count, setCount] = useState(0);
  const [isDown, setIsDown] = useState(false);
  const [elbowAngle, setElbowAngle] = useState<number | null>(null);

  useEffect(() => {
    if (!results || !results.poseLandmarks) return;

    // Используем правую руку: плечо(12) -> локоть(14) -> запястье(16)
    const shoulder = results.poseLandmarks[12];
    const elbow = results.poseLandmarks[14];
    const wrist = results.poseLandmarks[16];

    if (!shoulder || !elbow || !wrist) return;

    const angle = getAngle(shoulder, elbow, wrist);
    setElbowAngle(angle);

    // Логика подсчета повторений
    if (angle < 60 && !isDown) {
      setIsDown(true);
    }

    if (angle > 140 && isDown) {
      setIsDown(false);
      setCount(prev => prev + 1);
    }
  }, [results]);

  return (
    <div style={{
      position: "absolute",
      bottom: 20,
      left: 20,
      background: "rgba(30, 30, 40, 0.85)",
      color: "#f0f0f0",
      padding: "12px 20px",
      borderRadius: "15px",
      fontSize: "1.1rem",
      border: "1px solid #555",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      minWidth: "200px"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Отжимания:</span>
        <strong style={{ fontSize: "1.4rem", color: "#4caf50" }}>{count}</strong>
      </div>
      <div style={{ marginTop: "8px", fontSize: "0.9rem", color: "#aaa" }}>
        Угол в локте: {elbowAngle ? `${elbowAngle.toFixed(1)}°` : "N/A"}
      </div>
      <div style={{
        height: "4px",
        background: "#333",
        marginTop: "8px",
        borderRadius: "2px",
        overflow: "hidden"
      }}>
        <div style={{
          width: `${isDown ? 100 : 0}%`,
          height: "100%",
          background: "#ff5252",
          transition: "width 0.3s ease"
        }} />
      </div>
    </div>
  );
}