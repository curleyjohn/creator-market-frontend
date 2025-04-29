import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ThemeDropdown from "./ThemeDropdown";
import { getDocs, onSnapshot, doc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";
import { CurrencyDollarIcon, ChartBarIcon } from "@heroicons/react/24/outline";

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
    <header className="w-full flex justify-between items-center py-4 px-6 border-b border-[var(--accent)]/20 bg-[var(--topbar-bg)] text-[var(--topbar-text)] transition-all">
      {/* Left Section - Balance and Portfolio */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--sidebar-bg)] border border-[var(--accent)]/20">
          <CurrencyDollarIcon className="w-5 h-5 text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text)]">
            {balance.toLocaleString()} CC
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--sidebar-bg)] border border-[var(--accent)]/20">
          <ChartBarIcon className="w-5 h-5 text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text)]">
            {portfolioValue.toLocaleString()} CC
          </span>
        </div>
      </div>

      {/* Right Section - Theme and User */}
      <div className="flex items-center gap-4">
        <ThemeDropdown
          themes={themes}
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
        />

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={onMenuClick}>
          <svg
            className="w-6 h-6 text-[var(--accent)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {user && (
          <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-[var(--accent)] bg-[var(--sidebar-bg)]">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="User"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--text)]">
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
