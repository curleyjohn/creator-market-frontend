import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ThemeDropdown from "./ThemeDropdown";
import { onSnapshot, doc, collection } from "firebase/firestore";
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
  const [portfolioDocs, setPortfolioDocs] = useState<any[]>([]);
  const [creatorsDocs, setCreatorsDocs] = useState<{ [id: string]: any }>({});
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
    const unsubPortfolio = onSnapshot(portfolioRef, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        creatorId: doc.id,
        ...doc.data(),
      }));
      setPortfolioDocs(items);
    });

    // 🔹 Listen to creators
    const unsubCreators = onSnapshot(creatorsRef, (snapshot) => {
      const items: { [id: string]: any } = {};
      snapshot.docs.forEach((doc) => {
        items[doc.id] = doc.data();
      });
      setCreatorsDocs(items);
    });

    return () => {
      unsubUser();
      unsubPortfolio();
      unsubCreators();
    };
  }, [user?.uid]);

  // Calculate portfolio value whenever portfolio or creator data changes
  useEffect(() => {
    const total = portfolioDocs.reduce((sum, item) => {
      const creator = creatorsDocs[item.creatorId];
      const currentPrice = creator?.price || 0;
      const value = currentPrice * (item.quantity || 0);
      return sum + value;
    }, 0);

    setPortfolioValue(total);
  }, [portfolioDocs, creatorsDocs]);

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
