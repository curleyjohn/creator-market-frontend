// src/pages/SignIn.tsx
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

const SignIn = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Sign-In error:", error);
    }
  };

  return (
    <AuthLayout>
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl px-8 py-10">
          <h1 className="text-3xl font-extrabold text-indigo-600 text-center mb-6">
            Creator Market
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Sign in with Google to start exploring creator stocks.
          </p>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-white-700 font-medium py-2.5 px-4 rounded-lg transition duration-200 shadow-sm"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignIn;
