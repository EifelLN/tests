import { db } from "./firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export async function getCourseDetail(courseId) {
  // Fetch the course by id
  const docRef = doc(db, "courses", courseId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("Course not found");
  }

  // Fetch comments subcollection
  const commentsSnap = await getDocs(collection(docRef, "comments"));
  const comments = commentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return {
    id: docSnap.id,
    ...docSnap.data(),
    comments, 
  };
}
