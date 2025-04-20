import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ThemeDropdown from "./ThemeDropdown";

// ✅ Blue-based theme variants only
const themes = [
  { name: "Dark", value: "theme-dark" },
  { name: "Grey", value: "theme-grey" },
  { name: "Navy", value: "theme-navy" },
  { name: "Blue", value: "theme-blue" },
  { name: "Black", value: "theme-black" },
];

const Topbar = () => {
  const { user } = useAuth();

  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem("theme") ?? "theme-dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("class", selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  }, [selectedTheme]);

  return (
    <header
      className="w-full flex justify-end items-center gap-4 py-4 px-6 border-b"
      style={{
        backgroundColor: "var(--topbar-bg)",
        color: "var(--topbar-text)",
        borderColor: "var(--accent)",
      }}
    >
      {/* Theme Dropdown */}
      <ThemeDropdown
        themes={themes}
        selectedTheme={selectedTheme}
        setSelectedTheme={setSelectedTheme}
      />

      {/* User Avatar */}
      {user && (
        <div
          className="w-10 h-10 rounded-full overflow-hidden border-2"
          style={{ borderColor: "var(--accent)" }}
        >
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
    </header>
  );
};

export default Topbar;
