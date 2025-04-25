import { db } from "./firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export const saveUserToFirestore = async (user: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(
      userRef,
      {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        balance: 10000, // Initial balance
        lastLogin: serverTimestamp(),
      },
      { merge: true } // ✅ only updates changed fields
    );
  } else {
    await setDoc(userRef, {
      lastLogin: serverTimestamp(),
    }, { merge: true }); // Update only lastLogin
  }
};
