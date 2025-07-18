import React, { useEffect, useState } from "react";
import type { Results } from "@mediapipe/pose";
import { getAngle } from "../utils/poseUtils";

interface PullUpTrackerProps {
  results: Results | null;
}

export function PullUpTracker({ results }: PullUpTrackerProps) {
  const [reps, setReps] = useState(0);
  const [isDown, setIsDown] = useState(false);
  const [elbowAngle, setElbowAngle] = useState<number | null>(null);

  useEffect(() => {
    if (!results || !results.poseLandmarks) return;

    // Используем левую руку: плечо(11) -> локоть(13) -> запястье(15)
    const shoulder = results.poseLandmarks[11];
    const elbow = results.poseLandmarks[13];
    const wrist = results.poseLandmarks[15];

    if (!shoulder || !elbow || !wrist) return;

    const angle = getAngle(shoulder, elbow, wrist);
    setElbowAngle(angle);

    // Логика повторений для подтягиваний
    if (angle < 50) {
      setIsDown(true);
    }

    if (angle > 160 && isDown) {
      setReps(prev => prev + 1);
      setIsDown(false);
    }
  }, [results]);

  return (
    <div style={{
      position: "absolute",
      bottom: 20,
      right: 20,
      background: "rgba(30, 30, 40, 0.85)",
      color: "#f0f0f0",
      padding: "12px 20px",
      borderRadius: "15px",
      fontSize: "1.1rem",
      border: "1px solid #555",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      minWidth: "200px",
      textAlign: "right"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Подтягивания:</span>
        <strong style={{ fontSize: "1.4rem", color: "#2196f3" }}>{reps}</strong>
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
          background: "#2196f3",
          transition: "width 0.3s ease"
        }} />
      </div>
    </div>
  );
}