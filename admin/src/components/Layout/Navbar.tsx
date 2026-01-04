import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LogOut, User, Sun, Moon, Menu } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav
      className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger menu - mobile only */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
            aria-label="Open navigation menu"
            aria-controls="sidebar-menu"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          <div
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg text-sm sm:text-base"
            aria-hidden="true"
          >
            RQ
          </div>
          <div className="hidden sm:block">
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">RICQCODES</p>
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
              Editorial Console
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center group"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-pressed={theme === 'dark'}
          >
            <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 absolute transition-all duration-300 rotate-0 scale-100 dark:rotate-90 dark:scale-0" aria-hidden="true" />
            <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400 absolute transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100" aria-hidden="true" />
          </button>

          <div
            className="hidden md:flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            role="status"
            aria-label={`Logged in as ${user?.username || 'user'}`}
          >
            <User className="w-4 h-4 text-violet-600 dark:text-violet-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {user?.username}
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg font-semibold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all"
            aria-label="Logout from admin panel"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
