import React, { useState } from "react";
import { PoseCamera } from "./components/PoseCamera";
import "./App.css";
import { PushUpTracker } from "./components/PushUpTracker";
import { PullUpTracker } from "./components/PullUpTracker";
import type { Results } from '@mediapipe/pose'; // Изменено на type-only import

function App() {
    const [mode, setMode] = useState<"pushup" | "pullup">("pushup"); // Исправлен синтаксис useState
    const [poseResults, setPoseResults] = useState<Results | null>(null);

    const handleResults = (results: Results) => {
        setPoseResults(results);
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Фитнес-трекер</h1>
                <div className="mode-selector">
                    <button
                        className={mode === "pushup" ? "active" : ""} // Исправлены фигурные скобки
                        onClick={() => setMode("pushup")} // Исправлен синтаксис onClick
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
                <PoseCamera onResults={handleResults} />

                {mode === "pushup" && <PushUpTracker results={poseResults} />} {/* Исправлен синтаксис */}
                {mode === "pullup" && <PullUpTracker results={poseResults} />}
            </div>

            <div className="instructions">
                <h3>Как использовать:</h3>
                <ul>
                    <li>Встаньте перед камерой на расстоянии 2-3 метров</li>
                    <li>Убедитесь, что вас хорошо видно в полный рост</li>
                    <li>Для отжиманий: выполняйте движения в вертикальной плоскости</li>
                    <li>Для подтягиваний: имитируйте движение подтягивания</li>
                    <li>Система автоматически подсчитает повторения</li>
                </ul>
            </div>
        </div>
    );
}

export default App;