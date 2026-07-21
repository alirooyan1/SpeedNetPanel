import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('speednet_token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="flex h-screen bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-sans overflow-hidden" dir="rtl">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 overflow-auto bg-white dark:bg-slate-900 flex flex-col">
        <div className="lg:hidden p-4 border-b border-slate-200 dark:border-slate-800 flex items-center bg-white dark:bg-slate-900/50 sticky top-0 z-20 backdrop-blur-md">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="text-slate-500 dark:text-slate-400 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="mr-4 flex items-center gap-2">
            <div className="w-24 h-8 overflow-hidden flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="SpeedNet" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-white hidden md:inline">اسپیدنت</span>
          </div>
        </div>
        <div className="p-4 md:p-6 flex-1 flex flex-col gap-6 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
