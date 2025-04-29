import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ThemeDropdown from "./ThemeDropdown";
import { getDocs, onSnapshot, doc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";

interface TopbarProps {
  onMenuClick: () => void;
}

const themes = [
  { name: "Dark", value: "theme-dark" },
  { name: "Light", value: "theme-light" },
  { name: "Orange", value: "theme-orange" },
  { name: "Blue", value: "theme-blue" },
];

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem("theme") ?? "theme-dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("class", selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  }, [selectedTheme]);

  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, "users", user.uid);
    const portfolioRef = collection(db, "users", user.uid, "portfolio");
    const creatorsRef = collection(db, "creators");

    // 🔹 Listen to user's balance
    const unsubUser = onSnapshot(userRef, (snapshot) => {
      const data = snapshot.data();
      if (data) {
        setBalance(data.balance ?? 0);
      }
    });

    // 🔹 Listen to user's portfolio
    const unsubPortfolio = onSnapshot(portfolioRef, async (portfolioSnap) => {
      const items = portfolioSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (items.length === 0) {
        setPortfolioValue(0);
        return;
      }

      // Get all creators in one go
      const creatorSnap = await getDocs(creatorsRef);
      const creatorsData: { [id: string]: any } = {};
      creatorSnap.forEach((doc) => {
        creatorsData[doc.id] = doc.data();
      });

      let total = 0;
      items.forEach((item: any) => {
        const creator = creatorsData[item.creatorId];
        if (creator) {
          const currentPrice = creator.price || 0;
          total += currentPrice * (item.quantity || 0);
        }
      });

      setPortfolioValue(total);
    });

    return () => {
      unsubUser();
      unsubPortfolio();
    };
  }, [user?.uid]);

  return (
    <header className="w-full flex justify-between items-center py-4 px-6 border-b border-[var(--accent)] bg-[var(--topbar-bg)] text-[var(--topbar-text)] transition-all">
      <div className="flex gap-2 items-center">
        <div className="text-sm font-medium bg-[var(--sidebar-bg)] px-3 py-1 rounded-full border border-[var(--accent)]">
          💰 Balance: {balance.toLocaleString()} CC
        </div>
        <div className="text-sm font-medium bg-[var(--sidebar-bg)] px-3 py-1 rounded-full border border-[var(--accent)]">
          📈 Portfolio: {portfolioValue.toLocaleString()} CC
        </div>
      </div>

      {/* Mobile menu button */}
      <button className="md:hidden" onClick={onMenuClick}>
        <svg
          className="w-6 h-6 text-topbar"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Theme Dropdown and User Avatar */}
      <div className="flex items-center gap-4 ml-auto">
        <ThemeDropdown
          themes={themes}
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
        />
        {user && (
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-accent">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="User"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-grayDark text-white">
                {user.displayName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
