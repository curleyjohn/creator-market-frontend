import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import {
  HomeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  UserIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  ArrowLeftEndOnRectangleIcon,
  ChevronLeftIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  const mainNavItems = [
    { name: "Dashboard", path: "/", icon: HomeIcon },
    { name: "Market", path: "/market", icon: ChartBarIcon },
    { name: "Portfolio", path: "/portfolio", icon: ChartPieIcon },
    { name: "Transactions", path: "/transactions", icon: CurrencyDollarIcon },
    { name: "Leaderboard", path: "/leaderboard", icon: TrophyIcon },
  ];

  const secondaryNavItems = [
    { name: "Settings", path: "/settings", icon: Cog6ToothIcon },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col h-screen bg-[var(--sidebar-bg)] border-r border-[var(--accent)] transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Logo and Collapse Button */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--accent)]">
          {!isCollapsed && <h1 className="text-xl font-bold text-[var(--text)]">Creator Market</h1>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-[var(--accent)]/10 transition-colors"
          >
            <ChevronLeftIcon className={`w-5 h-5 text-[var(--text)] transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-[var(--accent)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full rounded-full object-cover" />
              ) : (
                <UserIcon className="w-6 h-6 text-[var(--accent-text)]" />
              )}
            </div>
            {!isCollapsed && (
              <div>
                <p className="text-sm font-medium text-[var(--text)]">
                  {user?.displayName || 'Anonymous User'}
                </p>
                <p className="text-xs text-[var(--text)]/70">Trader</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                ${isActive
                  ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                  : 'text-[var(--text)] hover:bg-[var(--accent)]/10'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Secondary Navigation */}
        <div className="p-4 border-t border-[var(--accent)] space-y-1">
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                ${isActive
                  ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                  : 'text-[var(--text)] hover:bg-[var(--accent)]/10'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[var(--text)] hover:bg-[var(--accent)]/10 transition-colors"
          >
            <ArrowLeftEndOnRectangleIcon className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      >
        <aside
          className="absolute top-0 left-0 h-full w-72 p-4 bg-[var(--sidebar-bg)] border-r border-[var(--accent)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-[var(--text)]">Creator Market</h1>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--accent)]/10">
              <XMarkIcon className="w-5 h-5 text-[var(--text)]" />
            </button>
          </div>

          {/* User Profile for Mobile */}
          <div className="mb-6 p-4 border-y border-[var(--accent)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <UserIcon className="w-6 h-6 text-[var(--accent-text)]" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text)]">
                  {user?.displayName || 'Anonymous User'}
                </p>
                <p className="text-xs text-[var(--text)]/70">Trader</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                    : 'text-[var(--text)] hover:bg-[var(--accent)]/10'
                  }
                `}
                onClick={onClose}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--accent)] space-y-2">
            {secondaryNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                    : 'text-[var(--text)] hover:bg-[var(--accent)]/10'
                  }
                `}
                onClick={onClose}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[var(--text)] hover:bg-[var(--accent)]/10 transition-colors"
            >
              <ArrowLeftEndOnRectangleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
