import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { toggleSidebar, toggleDarkMode } from "../../store/slices/uiSlice";
import { useLogout } from "../../queries/auth.queries";

export function Navbar() {
  const dispatch        = useDispatch();
  const { user }        = useSelector((s: RootState) => s.auth);
  const { darkMode }    = useSelector((s: RootState) => s.ui);
  const { mutate: logout } = useLogout();

  return (
    <header className="h-16 flex items-center justify-between px-6
      bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">

      {/* Sidebar toggle */}
      <button onClick={() => dispatch(toggleSidebar())}
        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <div className="flex items-center gap-3">
        {/* Dark mode toggle */}
        <button onClick={() => dispatch(toggleDarkMode())}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          {darkMode
            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
          }
        </button>

        {/* User menu */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role.replace(/_/g, " ")}</p>
          </div>
        </div>

        <button onClick={() => logout()}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors ml-2">
          Logout
        </button>
      </div>
    </header>
  );
}