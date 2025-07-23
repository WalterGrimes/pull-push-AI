import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Инициализация MediaPipe
async function initializeMediaPipe() {
  try {
    // Предзагрузка WASM-ресурсов
    const wasmFiles = [
      'pose_solution_simd_wasm_bin.wasm',
      'pose_solution_wasm_bin.wasm',
      'pose_solution_packed_assets.data'
    ];

    await Promise.all(wasmFiles.map(file => {
      return fetch(`https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`, {
        mode: 'no-cors',
        cache: 'force-cache'
      });
    }));

    console.log('MediaPipe resources preloaded');
    return true;
  } catch (error) {
    console.error('MediaPipe preload error:', error);
    return false;
  }
}

// Создание корневого элемента
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Инициализация приложения
initializeMediaPipe().then(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});