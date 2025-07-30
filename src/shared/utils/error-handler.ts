// shared/utils/error-handler.ts
import { FirebaseError } from "firebase/app";

export const handleFirebaseError = (error: unknown) => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "permission-denied":
        return "Недостаточно прав";
      case "unavailable":
        return "Сервис недоступен";
      default:
        return "Ошибка сервера";
    }
  }
  return "Неизвестная ошибка";
};