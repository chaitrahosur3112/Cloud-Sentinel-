import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Sidebar } from "./Sidebar";
import { Navbar }  from "./Navbar";
import { Toaster } from "../ui/Toast";
import { RootState } from "../../store";

export function AppLayout() {
  const { sidebarOpen, darkMode } = useSelector((s: RootState) => s.ui);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
        <Sidebar />
        <div
          className="flex flex-col flex-1 overflow-hidden transition-all duration-200"
          style={{ marginLeft: sidebarOpen ? 240 : 0 }}
        >
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
        <Toaster />
      </div>
    </div>
  );
}