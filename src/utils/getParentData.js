import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const getParentData = async (uid) => {
  const snap = await getDoc(doc(db, "parents", uid));
  return snap.exists() ? snap.data() : null;
};