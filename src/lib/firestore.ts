import { db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const saveUserToFirestore = async (user: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}) => {
  const userRef = doc(db, "users", user.uid);
  await setDoc(
    userRef,
    {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      updatedAt: serverTimestamp(),
    },
    { merge: true } // ✅ only updates changed fields
  );
};
