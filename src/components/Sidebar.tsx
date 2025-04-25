import React from "react";
import { NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Transactions", path: "/transactions" },
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
    <>
      <aside className="hidden md:flex w-64 p-4 h-screen flex-col justify-between bg-sidebar text-theme border-r border-accent">
        <div>
          <h1 className="text-xl font-bold mb-6 text-text">Creator Market</h1>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded transition font-medium ${isActive
                    ? "bg-accent text-accent"
                    : "hover:bg-accent hover:text-accent"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <button className="mt-4 w-full py-2 px-4 rounded transition font-semibold bg-accent text-accent" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose}>
          <aside
            className={`
              absolute top-0 left-0 h-full w-64 p-4 bg-sidebar text-theme border-r border-accent
              transform transition-transform duration-300 ease-in-out
              ${isOpen ? "translate-x-0" : "-translate-x-full"}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar content (same as desktop) */}
            <h1 className="text-xl font-bold mb-6 text-text">Creator Market</h1>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded transition font-medium ${isActive
                      ? "bg-accent text-accent"
                      : "hover:bg-accent hover:text-accent"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
            <button className="mt-4 w-full bg-accent text-accent-text rounded py-2" onClick={handleLogout}>
              Logout
            </button>
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
