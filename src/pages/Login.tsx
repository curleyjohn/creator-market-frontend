import React, { useState } from "react";
import { GoogleAuthProvider, signInWithPopup, setPersistence, browserSessionPersistence } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { Transition } from "@headlessui/react";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Set session persistence before sign in
      await setPersistence(auth, browserSessionPersistence);

      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg)] to-[var(--sidebar-bg)] text-[var(--text)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Transition
          show={true}
          appear={true}
          enter="transition-all duration-500"
          enterFrom="opacity-0 translate-y-6"
          enterTo="opacity-100 translate-y-0"
        >
          <div className="bg-[var(--sidebar-bg)] rounded-3xl p-8 shadow-2xl border border-[var(--accent)]">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
                Creator Market
              </h1>
              <p className="text-[var(--accent-text)] text-lg mb-6">
                Invest in Your Favorite Creators
              </p>
              <div className="flex justify-center space-x-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="text-center p-4 rounded-xl bg-[var(--bg)]/50">
                <div className="text-2xl mb-2">🎥</div>
                <div className="text-sm text-[var(--accent-text)]">YouTube Creators</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-[var(--bg)]/50">
                <div className="text-2xl mb-2">🎮</div>
                <div className="text-sm text-[var(--accent-text)]">Twitch Streamers</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-[var(--bg)]/50">
                <div className="text-2xl mb-2">📈</div>
                <div className="text-sm text-[var(--accent-text)]">Trade & Invest</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-[var(--bg)]/50">
                <div className="text-2xl mb-2">🏆</div>
                <div className="text-sm text-[var(--accent-text)]">Earn Rewards</div>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-[var(--accent)] text-[var(--accent-text)] rounded-xl py-3 px-6 flex items-center justify-center gap-3 font-medium transition-all duration-300 transform hover:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-[var(--accent-text)] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-4 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-[var(--accent-text)]">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
};

export default Login;
