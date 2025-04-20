import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";
import { useState } from "react";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen text-theme bg-theme">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-col flex-1">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-6 bg-theme text-theme">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
