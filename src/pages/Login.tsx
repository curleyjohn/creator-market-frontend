import React from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log("User signed in!");
      navigate("/");
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-navyDark text-white">
      <button
        onClick={handleGoogleSignIn}
        className="bg-electricBlue text-black px-6 py-3 rounded hover:bg-blue-600 transition"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
