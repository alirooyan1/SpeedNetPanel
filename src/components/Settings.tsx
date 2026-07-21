import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Database, Check, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function Settings() {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [syncInterval, setSyncInterval] = useState('0');
  const [lastSync, setLastSync] = useState<string | null>(null);
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMessage, setPassMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem('speednet_token');
      try {
        const res = await fetch('/api/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) return navigate('/');
        const data = await res.json();
        if (data.supabaseUrl) setSupabaseUrl(data.supabaseUrl);
        if (data.supabaseKey) setSupabaseKey(data.supabaseKey);
        if (data.syncInterval) setSyncInterval(data.syncInterval);
        if (data.lastSync) setLastSync(data.lastSync);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSettings();
  }, [navigate]);

  const handleTestConnection = async () => {
    setLoading(true);
    setTestResult(null);
    const token = localStorage.getItem('speednet_token');
    try {
      const res = await fetch('/api/supabase/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ url: supabaseUrl, key: supabaseKey })
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: data.message || 'اتصال موفقیت‌آمیز بود.' });
      } else {
        setTestResult({ success: false, message: data.error || 'خطا در اتصال.' });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: 'خطا در ارتباط با سرور.' });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('speednet_token');
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ supabaseUrl, supabaseKey, syncInterval })
      });
      alert('تنظیمات با موفقیت ذخیره شد.');
    } catch (e: any) {
      alert('خطا در ذخیره تنظیمات.');
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: 'رمز عبور جدید و تکرار آن یکسان نیستند.' });
      return;
    }
    const token = localStorage.getItem('speednet_token');
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setPassMessage({ type: 'success', text: 'رمز عبور با موفقیت تغییر کرد.' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassMessage({ type: 'error', text: data.error || 'خطا در تغییر رمز عبور.' });
      }
    } catch {
      setPassMessage({ type: 'error', text: 'خطا در ارتباط با سرور.' });
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    const token = localStorage.getItem('speednet_token');
    try {
      const res = await fetch('/api/supabase/sync', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('همگام‌سازی با موفقیت انجام شد.');
        setLastSync(new Date().toISOString());
      } else {
        alert(data.error || 'خطا در همگام‌سازی.');
      }
    } catch (e: any) {
      alert('خطا در ارتباط با سرور.');
    }
    setSyncing(false);
  };

  const formatJalali = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('fa-IR', {
        calendar: 'persian',
        timeZone: 'Asia/Tehran',
        dateStyle: 'long',
        timeStyle: 'medium'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="animate-in fade-in duration-500 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white tracking-tight">تنظیمات سیستم</h1>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col p-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-400">
            <Database size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">دیتابیس ابری (Supabase)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">اتصال به سوپابیس برای بکاپ و همگام‌سازی ابری اطلاعات</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-2 text-indigo-400 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
            <h3 className="font-bold text-sm">پشتیبان‌گیری ابری (Supabase)</h3>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">Project URL</label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">API Key (service_role یا anon)</label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleTestConnection}
              disabled={loading || !supabaseUrl || !supabaseKey}
              className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:bg-slate-600 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {loading ? 'در حال بررسی...' : 'تست اتصال'}
            </button>
            {testResult && (
              <div className={`flex items-center gap-2 text-sm ${testResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                {testResult.success ? <Check size={16} /> : <AlertTriangle size={16} />}
                {testResult.message}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">بازه زمانی همگام‌سازی</label>
            <select
              value={syncInterval}
              onChange={(e) => setSyncInterval(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="0">فقط دستی</option>
              <option value="1">هر ۱ ساعت</option>
              <option value="6">هر ۶ ساعت</option>
              <option value="24">روزانه (هر ۲۴ ساعت)</option>
            </select>
          </div>

          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50 mt-2">
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 block mb-1">آخرین همگام‌سازی</span>
              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium" dir="ltr">
                {lastSync ? formatJalali(lastSync) : 'تاکنون همگام‌سازی نشده است'}
              </span>
            </div>
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'در حال سینک...' : 'سینک دستی'}
            </button>
          </div>

          <div className="pt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
            </button>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col p-6 max-w-3xl mt-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-400">
            <Check size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">تغییر رمز عبور پنل</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تغییر رمز عبور مدیر سیستم</p>
          </div>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {passMessage && (
            <div className={`p-3 rounded text-sm ${passMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {passMessage.text}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">رمز عبور فعلی</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">رمز عبور جدید</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">تکرار رمز عبور جدید</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              تغییر رمز عبور
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
