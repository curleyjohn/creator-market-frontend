import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup on unmount
    return () => document.body.classList.remove("overflow-hidden");
  }, [isSidebarOpen]);

  return (
    <div className="flex min-h-screen text-theme bg-theme">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-col flex-1 h-screen" style={{ background: "linear-gradient(to bottom, var(--bg), var(--sidebar-bg))" }}>
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="px-6 py-4 bg-theme text-theme flex-shrink overflow-hidden h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
