import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { path: "/dashboard",  label: "Dashboard",  icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { path: "/resources",  label: "Resources",  icon: "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" },
  { path: "/budgets",    label: "Budgets",    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { path: "/alerts",     label: "Alerts",     icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  { path: "/analytics",  label: "Analytics",  icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { path: "/ai",         label: "AI Forecast",icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { path: "/reports",    label: "Reports",    icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

export function Sidebar() {
  const { sidebarOpen } = useSelector((s: RootState) => s.ui);

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 240, opacity: 1 }}
          exit={{   width: 0, opacity: 0   }}
          className="fixed top-0 left-0 h-screen z-30
            bg-gray-900 dark:bg-gray-950 border-r border-gray-800 overflow-hidden flex-shrink-0"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-800">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <span className="text-white font-bold text-sm whitespace-nowrap">CloudCost Sentinel</span>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 p-3 mt-2">
            {NAV_ITEMS.map(({ path, label, icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap
                  ${isActive
                    ? "bg-brand-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon}/>
                </svg>
                {label}
              </NavLink>
            ))}
          </nav>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}