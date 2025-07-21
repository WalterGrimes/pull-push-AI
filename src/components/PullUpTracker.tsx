import React, { useEffect, useState, useRef } from "react";
import type { Results } from "@mediapipe/pose";
import { getAngle } from "../utils/poseUtils";

interface PullUpTrackerProps {
  results: Results | null;
}

export const PullUpTracker = React.memo(({ results }: PullUpTrackerProps) => {
  const [count, setCount] = useState(0);
  const [isDown, setIsDown] = useState(false);
  const [feedback, setFeedback] = useState("Возьмитесь за перекладину");
  const [showFeedback, setShowFeedback] = useState(false);
  const barPositionRef = useRef<{x: number, y: number} | null>(null);

  useEffect(() => {
    if (!results || !results.poseLandmarks) {
      setFeedback("Встаньте под перекладину");
      setShowFeedback(true);
      return;
    }

    const landmarks = results.poseLandmarks;
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const nose = landmarks[0];

    if (!barPositionRef.current && leftWrist && rightWrist) {
      barPositionRef.current = {
        x: (leftWrist.x + rightWrist.x) / 2,
        y: (leftWrist.y + rightWrist.y) / 2
      };
      setFeedback("Начните подтягивания");
      setShowFeedback(true);
    }

    const isHandsOnBar = barPositionRef.current && 
      Math.abs(leftWrist.y - barPositionRef.current.y) < 0.05 && 
      Math.abs(rightWrist.y - barPositionRef.current.y) < 0.05;

    if (!isHandsOnBar) {
      setFeedback("Держитесь за перекладину!");
      setShowFeedback(true);
      return;
    }

    const leftAngle = getAngle(leftShoulder, leftElbow, leftWrist);
    const rightAngle = getAngle(rightShoulder, rightElbow, rightWrist);
    const avgAngle = (leftAngle + rightAngle) / 2;

    const isChinAboveBar = nose && barPositionRef.current && 
      nose.y < barPositionRef.current.y;

    if (avgAngle > 160 && !isDown) {
      setIsDown(true);
      setFeedback("Опускайтесь полностью");
      setShowFeedback(true);
    } else if (avgAngle < 60 && isDown) {
      if (isChinAboveBar) {
        setCount(prev => prev + 1);
        setIsDown(false);
        setFeedback("✓ Отличное повторение!");
      } else {
        setFeedback("Подбородок выше перекладины!");
      }
      setShowFeedback(true);
    }

    const timer = setTimeout(() => setShowFeedback(false), 2000);
    return () => clearTimeout(timer);
  }, [results]);

  return (
    <div style={{
      position: "absolute",
      top: "20px",
      right: "20px",
      background: "rgba(30, 30, 40, 0.9)",
      color: "#f0f0f0",
      padding: "12px 16px",
      borderRadius: "12px",
      fontSize: "0.95rem",
      border: "1px solid #444",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      minWidth: "160px",
      zIndex: 100,
      transition: "opacity 0.3s",
      opacity: showFeedback ? 1 : 0.7
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px"
      }}>
        <span>Подтягивания:</span>
        <strong style={{ 
          fontSize: "1.3rem", 
          color: "#2196f3",
          minWidth: "30px",
          textAlign: "right"
        }}>{count}</strong>
      </div>
      
      <div style={{
        height: "3px",
        background: "#333",
        borderRadius: "2px",
        margin: "6px 0",
        overflow: "hidden"
      }}>
        <div style={{
          width: `${isDown ? 100 : 0}%`,
          height: "100%",
          background: "#2196f3",
          transition: "width 0.3s ease"
        }} />
      </div>
      
      <div style={{
        fontSize: "0.85rem",
        color: showFeedback ? "#fff" : "#aaa",
        height: "20px",
        transition: "color 0.3s",
        whiteSpace: "nowrap"
      }}>
        {showFeedback ? feedback : "Выполняйте подтягивания"}
      </div>
    </div>
  );
});

export default PullUpTracker;