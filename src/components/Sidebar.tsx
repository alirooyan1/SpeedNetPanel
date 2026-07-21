import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import { LayoutDashboard, Users, Settings, LogOut, Activity, Bot } from 'lucide-react';
import { cn } from '../lib/utils';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('speednet_token');
    navigate('/');
  };

  const navItems = [
    { name: 'داشبورد', path: '/dashboard', icon: LayoutDashboard },
    { name: 'مانیتورینگ', path: '/monitoring', icon: Activity },
    { name: 'کاربران', path: '/users', icon: Users },
    { name: 'تنظیمات', path: '/settings', icon: Settings },
    { name: 'ربات تلگرام', path: '/telegram', icon: Bot },
    { name: 'درباره پنل', path: '/about', icon: Activity },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-100 dark:bg-slate-950/80 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={cn(
        "fixed lg:static inset-y-0 right-0 z-50 w-64 bg-slate-50 dark:bg-slate-800/95 lg:bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl lg:backdrop-blur-none border-l border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-6 shrink-0 h-screen transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-24 h-8 flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/logo.png" alt="SpeedNet" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white tracking-tight leading-none">اسپیدنت</span>
            <span className="text-[10px] text-indigo-300 mt-1 font-mono bg-indigo-500/20 w-fit px-1.5 py-0.5 rounded">v2.0.0</span>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1 -mr-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors",
                isActive 
                  ? "bg-indigo-600 text-white" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:bg-slate-700 hover:text-slate-800 dark:text-slate-200"
              )
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-200 dark:border-slate-700 pt-4 flex flex-col gap-2">
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={18} />
          خروج از سیستم
        </button>
      </div>
    </aside>
    </>
  );
}
