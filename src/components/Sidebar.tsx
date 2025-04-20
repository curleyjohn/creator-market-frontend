import React from "react";
import { NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

const Sidebar = () => {
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Leaderboard", path: "/leaderboard" },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <aside
      className="w-64 p-4 h-screen flex flex-col justify-between"
      style={{ backgroundColor: "var(--sidebar-bg)", color: "var(--text)" }}
    >
      <div>
        <h1 className="text-xl font-bold mb-6" style={{ color: "var(--accent)" }}>
          Creator Market
        </h1>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-2 rounded transition font-medium ${isActive
                  ? "bg-[var(--accent)] text-[var(--accent-text)]"
                  : "hover:bg-[var(--accent)] hover:text-[var(--accent-text)]"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="mt-4 w-full py-2 px-4 rounded transition font-semibold"
        style={{
          backgroundColor: "var(--accent)",
          color: "var(--accent-text)",
        }}
      >
        Logout
      </button>
    </aside>

  );
};

export default Sidebar;
