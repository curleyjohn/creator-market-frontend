import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAWzGJoo0wP9gBchCMWDnA8ZhmEAB4ZH0E",
  authDomain: "creator-market-26aad.firebaseapp.com",
  projectId: "creator-market-26aad",
  storageBucket: "creator-market-26aad.firebasestorage.app",
  messagingSenderId: "842402470770",
  appId: "1:842402470770:web:f4ce9bb15f98b304b61beb",
  measurementId: "G-H55E9P7XSV",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // <-- add this to use Google Sign-In later

export { app, analytics, auth };