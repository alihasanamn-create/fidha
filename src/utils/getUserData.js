import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const getUserData = async (uid) => {
  const docRef = doc(db, "users", uid);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return snap.data();
  } else {
    return null;
  }
};