import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export async function getCourses() {
  const snapshot = await getDocs(collection(db, "courses"));
  const courses = [];
  for (const docSnap of snapshot.docs) {
    const modulesSnap = await getDocs(
      collection(db, "courses", docSnap.id, "modules")
    );
    const modules = modulesSnap.docs.map(mod => ({
      id: mod.id,
      ...mod.data(),
    }));
    courses.push({
      id: docSnap.id,
      ...docSnap.data(),
      modules,
      completed: false,
    });
  }
  return courses;
}
