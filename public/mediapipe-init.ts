window.initMediaPipe = async function() {
  try {
    // Предзагрузка WASM-файлов
    const wasmFiles = [
      'pose_solution_packed_assets.data',
      'pose_solution_simd_wasm_bin.wasm',
      'pose_solution_wasm_bin.wasm'
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
};