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
    const [feedback, setFeedback] = useState<string>("Начните подтягивание");
    const [shoulderAngle, setShoulderAngle] = useState<number | null>(null);
    const [chestHeight, setChestHeight] = useState<number | null>(null);

    useEffect(() => {
        if (!results || !results.poseLandmarks) {
            setFeedback("Встаньте перед камерой");
            return;
        }

        // Левые точки (зеркальное отображение)
        const leftShoulder = results.poseLandmarks[11];
        const leftElbow = results.poseLandmarks[13];
        const leftWrist = results.poseLandmarks[15];
        
        // Правые точки
        const rightShoulder = results.poseLandmarks[12];
        const rightElbow = results.poseLandmarks[14];
        const rightWrist = results.poseLandmarks[16];
        
        // Точки для определения положения груди
        const leftHip = results.poseLandmarks[23];
        const rightHip = results.poseLandmarks[24];

        // Проверка видимости ключевых точек
        const visibilityThreshold = 0.6;
        const visiblePoints = [
            leftShoulder, leftElbow, leftWrist,
            rightShoulder, rightElbow, rightWrist,
            leftHip, rightHip
        ].every(point => point && point.visibility > visibilityThreshold);

        if (!visiblePoints) {
            setFeedback("Встаньте так, чтобы было видно руки и корпус");
            return;
        }

        // Рассчитываем углы для обеих рук
        const leftElbowAngle = getAngle(leftShoulder, leftElbow, leftWrist);
        const rightElbowAngle = getAngle(rightShoulder, rightElbow, rightWrist);
        const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
        setElbowAngle(avgElbowAngle);

        // Угол плеча (для проверки подъема груди)
        const leftShoulderAngle = getAngle(leftElbow, leftShoulder, leftHip);
        const rightShoulderAngle = getAngle(rightElbow, rightShoulder, rightHip);
        const avgShoulderAngle = (leftShoulderAngle + rightShoulderAngle) / 2;
        setShoulderAngle(avgShoulderAngle);

        // Высота груди относительно бедер (нормализованная координата Y)
        const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        const hipY = (leftHip.y + rightHip.y) / 2;
        const chestHeightRatio = (shoulderY - hipY) / (hipY * 2);
        setChestHeight(chestHeightRatio);

        // Логика проверки техники
        if (avgElbowAngle > 160 && !isDown) {
            // Полностью опустились
            setIsDown(true);
            setFeedback("Отлично! Теперь подтянитесь грудью к перекладине");
        } else if (avgElbowAngle < 60 && isDown) {
            // Подтягивание вверх
            if (chestHeightRatio < -0.1) {
                // Грудь поднята достаточно высоко
                setReps(prev => prev + 1);
                setIsDown(false);
                setFeedback("Отличное повторение! Теперь опуститесь полностью");
            } else {
                setFeedback("Тянитесь грудью к перекладине, работайте спиной!");
            }
        } else if (isDown && avgElbowAngle > 120 && avgElbowAngle < 160) {
            setFeedback("Опускайтесь ниже! Руки должны полностью выпрямляться");
        } else if (!isDown && avgElbowAngle < 60 && chestHeightRatio > -0.05) {
            setFeedback("Сведите лопатки, тянитесь грудью вверх!");
        }
    }, [results]);

    return (
        <div style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            background: "rgba(30, 30, 40, 0.95)",
            color: "#f0f0f0",
            padding: "16px 24px",
            borderRadius: "15px",
            fontSize: "1.1rem",
            border: "1px solid #555",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            minWidth: "280px",
            maxWidth: "320px",
            textAlign: "left"
        }}>
            <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                marginBottom: "12px"
            }}>
                <span>Подтягивания:</span>
                <strong style={{ fontSize: "1.4rem", color: "#2196f3" }}>{reps}</strong>
            </div>
            
            <div style={{ 
                margin: "12px 0",
                padding: "10px",
                background: "rgba(50, 50, 60, 0.6)",
                borderRadius: "8px",
                minHeight: "60px",
                display: "flex",
                alignItems: "center"
            }}>
                <span style={{ color: "#4caf50" }}>{feedback}</span>
            </div>
            
            <div style={{ 
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                fontSize: "0.9rem",
                color: "#aaa"
            }}>
                <div>Угол в локтях: {elbowAngle ? `${elbowAngle.toFixed(1)}°` : "N/A"}</div>
                <div>Угол плеч: {shoulderAngle ? `${shoulderAngle.toFixed(1)}°` : "N/A"}</div>
            </div>
            
            <div style={{
                height: "6px",
                background: "#333",
                marginTop: "12px",
                borderRadius: "3px",
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
                marginTop: "8px",
                fontSize: "0.8rem",
                color: "#777",
                fontStyle: "italic"
            }}>
                Советы: Полное опускание → Подъем грудью → Контроль спины
            </div>
        </div>
    );
}