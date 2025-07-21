import React, { useState, useMemo } from "react";
import { PoseCamera } from "./components/PoseCamera";
import "./App.css";
import PushUpTracker from "./components/PushUpTracker";
import PullUpTracker from "./components/PullUpTracker";
import type { Results } from '@mediapipe/pose';
import TurnCamera from "./components/TurnCamera";

function App() {
    const [mode, setMode] = useState<"pushup" | "pullup">("pushup");
    const [poseResults, setPoseResults] = useState<Results | null>(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [processingMode, setProcessingMode] = useState<"live" | "upload">("live");

    const toggleIsCamera = () => {
        setIsCameraOn(prev => !prev);
        setProcessingMode("live");
    }

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setVideoFile(file);
        setIsCameraOn(true);
        setProcessingMode("upload");
    }

    const handleResults = useMemo(() => {
        let lastProcessed = 0;

        return (results: Results) => {
            const now = Date.now();
            if (now - lastProcessed < 100) return; // Ограничение 10 FPS
            lastProcessed = now;
            setPoseResults(results);
        };
    }, []);

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Pull-Push</h1>
                <div className="mode-selector">
                    <button
                        className={mode === "pushup" ? "active" : ""}
                        onClick={() => setMode("pushup")}
                    >
                        Отжимания
                    </button>
                    <button
                        className={mode === "pullup" ? "active" : ""}
                        onClick={() => setMode("pullup")}
                    >
                        Подтягивания
                    </button>
                </div>
            </header>

            <div className="camera-container">
                {isCameraOn && (
                    <>
                        {processingMode === "live" ? (
                            <PoseCamera onResults={handleResults} />
                        ) : (
                            <div style={{ color: 'white' }}>
                                Идет обработка,пожалуйста подождите...
                            </div>
                        )}
                        {mode === "pushup" && <PushUpTracker results={poseResults} />}
                        {mode === "pullup" && <PullUpTracker results={poseResults} />}
                    </>
                )}
            </div>

            <div className="camera-controls">
                <TurnCamera
                    isCameraOn={isCameraOn}
                    toggleCamera={toggleIsCamera}
                    handleVideoUpload={handleVideoUpload}
                />
            </div>

            {/* Возвращаем блок с инструкциями */}
            <div className="instructions">
                <h3>Как использовать:</h3>
                <ul>
                    <li>Встаньте перед камерой на расстоянии 2-3 метров</li>
                    <li>Убедитесь, что вас хорошо видно в полный рост</li>
                    <li>Для отжиманий: выполняйте движения в вертикальной плоскости</li>
                    <li>Для подтягиваний:
                        <ul>
                            <li>Полностью выпрямляйте руки в нижней точке</li>
                            <li>Подтягивайтесь грудью к перекладине</li>
                            <li>Держите корпус ровно, не раскачивайтесь</li>
                        </ul>
                    </li>
                    <li>Система автоматически подсчитает повторения</li>
                </ul>
            </div>
        </div>
    );
}

export default App;