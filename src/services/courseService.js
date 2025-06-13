import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export async function getCourses() {
  const snapshot = await getDocs(collection(db, "courses"));
  const courses = [];
  for (const docSnap of snapshot.docs) {
    const courseData = docSnap.data();
    const modules = courseData.modules || [];
    courses.push({
      id: docSnap.id,
      ...courseData,
      modules,
      completed: false,
    });
  }
  return courses;
}
