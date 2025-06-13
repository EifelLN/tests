import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export async function getCourses() {
  const snapshot = await getDocs(collection(db, "courses"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    completed: false,
  }));
}
