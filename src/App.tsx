import React, { useState, useMemo, useEffect } from "react";
import { PoseCamera } from "./components/PoseCamera";
import "./App.css";
import PushUpTracker from "./components/PushUpTracker";
import PullUpTracker from "./components/PullUpTracker";
import type { Results } from '@mediapipe/pose';
import TurnCamera from "./components/TurnCamera";
import { VideoFileProcessor } from "./components/VideoFileProcessor";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "./firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase"; // Добавьте эту строку


function App() {
  const [mode, setMode] = useState<"pushup" | "pullup">("pushup");
  const [poseResults, setPoseResults] = useState<Results | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [processingMode, setProcessingMode] = useState<"live" | "upload">("live");
  const [user, setUser] = useState<User | null>(null);
  const [exerciseCount, setExerciseCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const toggleIsCamera = () => {
    setIsCameraOn(prev => !prev);
    setVideoFile(null);
    setProcessingMode("live");
    setExerciseCount(0);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    setIsCameraOn(true);
    setProcessingMode("upload");
    setExerciseCount(0);
  };

  const handleResults = useMemo(() => {
    let lastProcessed = 0;
    return (results: Results) => {
      const now = Date.now();
      if (now - lastProcessed < 100) return;
      lastProcessed = now;
      setPoseResults(results);
    };
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate('/login');
    });
  };

  const handleExerciseComplete = (count: number) => {
    setExerciseCount(count);
  };

  const exitAnalysisMode = () => {
    setIsCameraOn(false);
    setVideoFile(null);
    setPoseResults(null);
    if (exerciseCount > 0 && user) {
      console.log(`Сохранение результата: ${exerciseCount} ${mode}`);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Pull-Push</h1>
        <nav className="main-nav">
          <Link to="/leaderboard">Список лидеров</Link>
          <Link to="/community">Сообщество</Link>
        </nav>
        <div className="auth-controls">
          {user ? (
            <>
              <span>{user.displayName || user.email}</span>
              <button onClick={handleLogout} className="auth-button">Выйти</button>
            </>
          ) : (
            <Link to="/register">
              <button className="auth-button neutral">Регистрация / Вход</button>
            </Link>
          )}
        </div>
      </header>

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

      <div className="camera-container">
        {isCameraOn && (
          <>
            {processingMode === "live" ? (
              <PoseCamera onResults={handleResults} />
            ) : (
              videoFile && <VideoFileProcessor videoFile={videoFile} onResults={handleResults} />
            )}

            {mode === "pushup" && (
              <PushUpTracker 
                results={poseResults} 
                onExerciseComplete={handleExerciseComplete}
              />
            )}
            {mode === "pullup" && (
              <PullUpTracker 
                results={poseResults} 
                onExerciseComplete={handleExerciseComplete}
              />
            )}

            <button
              onClick={exitAnalysisMode}
              className="exit-analysis-button"
            >
              Выйти из режима анализа
            </button>
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