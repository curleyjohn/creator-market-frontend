import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import LoadingScreen from "../components/LoadingScreen";
import { saveUserToFirestore } from "../lib/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  sessionTimeRemaining: number | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => { },
  sessionTimeRemaining: null
});

export const useAuth = () => useContext(AuthContext);

const INACTIVE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000; // 5 minutes before timeout

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null);

  const logout = useCallback(async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        await saveUserToFirestore(firebaseUser);
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;
    let remainingCheckInterval: NodeJS.Timer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      setSessionTimeRemaining(INACTIVE_TIMEOUT);

      if (user) {
        // Set the main inactivity timeout
        inactivityTimer = setTimeout(() => {
          logout();
        }, INACTIVE_TIMEOUT);

        // Set the warning timeout
        warningTimer = setTimeout(() => {
          // You can implement a toast or modal warning here
          console.warn("Session will expire in 5 minutes");
        }, INACTIVE_TIMEOUT - WARNING_BEFORE_TIMEOUT);

        // Update remaining time every minute
        remainingCheckInterval = setInterval(() => {
          setSessionTimeRemaining(prev =>
            prev !== null ? Math.max(0, prev - 60000) : null
          );
        }, 60000);
      }
    };

    // Reset timer on various user activities
    const activityEvents = [
      'mousemove',
      'keypress',
      'click',
      'touchstart',
      'scroll',
      'mousewheel'
    ];

    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Initial timer setup
    if (user) {
      resetTimer();
    }

    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      clearInterval(remainingCheckInterval);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user, logout]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, sessionTimeRemaining }}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};
