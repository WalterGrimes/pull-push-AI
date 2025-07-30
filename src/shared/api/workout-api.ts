// shared/api/workout-api.ts
import { 
  doc, updateDoc, getDoc, collection, addDoc, serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { ExerciseType } from "@/entities/exercise";

export const saveWorkoutResult = async (
  userId: string,
  exerciseType: ExerciseType,
  count: number
) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) return;

    const recordField = `${exerciseType}Record`;
    const currentRecord = userDoc.data()[recordField] || 0;
    
    if (count > currentRecord) {
      await updateDoc(userDocRef, {
        [recordField]: count,
        [`${exerciseType}RecordDate`]: serverTimestamp()
      });
    }

    await addDoc(collection(db, "users", userId, "workouts"), {
      exerciseType,
      count,
      date: serverTimestamp()
    });
  } catch (error) {
    console.error("Ошибка сохранения результата:", error);
    throw error;
  }
};