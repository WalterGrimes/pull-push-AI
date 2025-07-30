// src/pages/hooks/useWorkout.ts
import { useState, useMemo } from "react";
import type { Results } from "@mediapipe/pose";

export const useWorkout = () => {
  const [mode, setMode] = useState<"pushup" | "pullup">("pushup");
  const [poseResults, setPoseResults] = useState<Results | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [processingMode, setProcessingMode] = useState<"live" | "upload">("live");
  const [exerciseCount, setExerciseCount] = useState(0);

  const toggleCamera = () => {
    setIsCameraOn(prev => !prev);
    setVideoFile(null);
    setProcessingMode("live");
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

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    setIsCameraOn(true);
    setProcessingMode("upload");
    setExerciseCount(0);
  };

  const exitAnalysisMode = () => {
    setIsCameraOn(false);
    setVideoFile(null);
    setPoseResults(null);
  };

  return {
    mode, setMode,
    poseResults, setPoseResults,
    isCameraOn, toggleCamera,
    videoFile, setVideoFile,
    processingMode,
    handleResults,
    handleVideoUpload,
    exitAnalysisMode,
    exerciseCount, setExerciseCount,
  };
};
