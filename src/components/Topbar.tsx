import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ThemeDropdown from "./ThemeDropdown";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface TopbarProps {
  onMenuClick: () => void;
}

const themes = [
  { name: "Black", value: "theme-black" },
  { name: "Dark", value: "theme-dark" },
  { name: "Grey", value: "theme-grey" },
  { name: "Navy", value: "theme-navy" },
  { name: "White", value: "theme-white" },
];

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);

  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem("theme") ?? "theme-dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("class", selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  }, [selectedTheme]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user?.uid) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      const data = snap.data();
      setBalance(data?.balance ?? 0);
    };
    fetchBalance();
  }, [user?.uid]);

  return (
    // <header className="w-full flex justify-end items-center gap-4 py-4 px-6 border-b bg-topbar text-topbar border-accent">
    <header
      className="w-full flex justify-between items-center py-4 px-6 border-b border-[var(--accent)] bg-[var(--topbar-bg)] text-[var(--topbar-text)] transition-all"
    >
      {
        balance !== null && (
          <div className="text-sm font-medium text-[var(--text)] bg-[var(--sidebar-bg)] px-3 py-1 rounded-full border border-[var(--accent)]">
            💰 {balance.toLocaleString()} CC
          </div>
        )
      }
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
      {/* Theme Dropdown */}
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
    </header >
  );
};

export default Topbar;
