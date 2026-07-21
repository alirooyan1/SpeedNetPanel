import React, { useState } from 'react';
import { useNavigate } from 'react-router';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('speednet_token', data.token);
        navigate('/dashboard');
      } else {
        setError(data.error || 'خطا در ورود');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-sans" dir="rtl">
      <div className="w-full max-w-sm p-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-48 h-16 flex items-center justify-center mb-2">
            <img src="/logo.png" alt="SpeedNet" className="w-full h-full object-contain" />
          </div>
          <p className="text-slate-400 dark:text-slate-500 mt-2 text-xs uppercase tracking-widest font-bold">پنل مدیریت سرور</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-2 rounded mb-6 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">نام کاربری</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="پیش‌فرض: admin"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="پیش‌فرض: AdminPass"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded text-sm transition-colors mt-6"
          >
            ورود به پنل
          </button>
        </form>
      </div>
    </div>
  );
}
