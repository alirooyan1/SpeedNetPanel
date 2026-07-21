import React, { useState } from 'react';
import { useNavigate } from 'react-router';

export default function Install() {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [dbUrl, setDbUrl] = useState('');
  const [adminUser, setAdminUser] = useState('admin');
  const [adminPass, setAdminPass] = useState('AdminPass');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInstall = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, key, dbUrl, adminUser, adminPass })
      });
      const data = await res.json();
      
      if (res.ok) {
        navigate('/');
      } else {
        setError(data.error || 'خطا در نصب');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-sans p-4" dir="rtl">
      <div className="w-full max-w-lg p-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl">
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="w-48 h-16 flex items-center justify-center mb-4">
            <img src="/logo.png" alt="SpeedNet" className="h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">راه‌اندازی اولیه اسپیدنت</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">لطفا اطلاعات دیتابیس Supabase و اکانت ادمین را وارد کنید.</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleInstall} className="space-y-5">
          <div className="space-y-4 bg-white dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50">
            <h2 className="text-sm font-bold text-indigo-400 mb-2">۱. اطلاعات Supabase</h2>
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase">Supabase URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-left"
                required
                dir="ltr"
                placeholder="https://xyz.supabase.co"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase">Supabase Anon Key</label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-left"
                required
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase">Database Connection URI (Transaction)</label>
              <input
                type="password"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-left"
                required
                dir="ltr"
                placeholder="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">این آدرس برای ساخت خودکار جداول استفاده می‌شود.</p>
            </div>
          </div>

          <div className="space-y-4 bg-white dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50">
            <h2 className="text-sm font-bold text-indigo-400 mb-2">۲. حساب مدیریت پنل</h2>
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase">نام کاربری ادمین</label>
              <input
                type="text"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-left"
                required
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase">رمز عبور ادمین</label>
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-left"
                required
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded text-sm transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? 'در حال راه‌اندازی و ساخت جداول...' : 'ثبت و راه‌اندازی'}
          </button>
        </form>
      </div>
    </div>
  );
}
