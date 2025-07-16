import React, { useRef, useEffect } from "react"
import { Pose } from "@mediapipe/pose"
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils"

export const CameraFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null) // Ссылка на <video>
  const canvasRef = useRef<HTMLCanvasElement>(null) // Ссылка на <canvas>

  useEffect(() => {
    const video = videoRef.current // Берём DOM-элемент <video> из ссылки
    const canvas = canvasRef.current // Берём DOM-элемент <canvas> из ссылки
    const ctx = canvas?.getContext("2d") // Получаем 2D-контекст для рисования

    if (!video || !canvas || !ctx) return // Проверка, что всё готово

    // Получаем поток с камеры и подставляем его в <video>
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream // Присваиваем поток
      video.play() // Запускаем воспроизведение
    })

    // Создаём экземпляр Pose и указываем, где брать файлы
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    })

    // Устанавливаем параметры модели
    pose.setOptions({
      modelComplexity: 1, // Сложность модели
      smoothLandmarks: true, // Сглаживание точек
      minDetectionConfidence: 0.5, // Минимальная уверенность для обнаружения
      minTrackingConfidence: 0.5, // Минимальная уверенность для трекинга
    })

    // Обработчик результатов, вызывается после каждого кадра
    pose.onResults((results) => {
      // Если что-то отсутствует — выходим
      if (!video || !canvas || !ctx) return

      // Подгоняем размер canvas под видео
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Очищаем canvas перед рисованием нового кадра
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Рисуем текущее изображение (кадр)
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

      // Если найдены ключевые точки — рисуем скелет и точки
      if (results.poseLandmarks) {
        drawConnectors(ctx, results.poseLandmarks, Pose.POSE_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 4,
        })
        drawLandmarks(ctx, results.poseLandmarks, {
          color: "#FF0000",
          lineWidth: 2,
        })
      }
    })

    // Функция, которая будет отправлять каждый кадр в Pose
    const onFrame = async () => {
      if (video) {
        await pose.send({ image: video }) // Отправляем кадр
        requestAnimationFrame(onFrame) // Запрашиваем следующий кадр
      }
    }

    // Запускаем цикл после загрузки данных видео
    video.addEventListener("loadeddata", onFrame)

    // Чистим обработчик при размонтировании компонента
    return () => {
      video.removeEventListener("loadeddata", onFrame)
    }
  }, []) // Пустой массив зависимостей — эффект выполняется один раз при монтировании

  return (
    <div style={{ position: "relative" }}>
      {/* Скрытый элемент видео */}
      <video ref={videoRef} style={{ display: "none" }} />
      {/* Канвас для рисования скелета */}
      <canvas ref={canvasRef} style={{ width: "100%" }} />
    </div>
  )
}
