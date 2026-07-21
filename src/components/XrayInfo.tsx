import { useState, useEffect } from 'react';
import { Shield, Activity, HardDrive, CheckCircle, XCircle } from 'lucide-react';


interface XrayStatus {
  isRunning: boolean;
  isDownloaded: boolean;
  version: string;
  activeUsersCount: number;
}

export default function XrayInfo() {
  const [status, setStatus] = useState<XrayStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/xray-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch status');
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-slate-500 dark:text-slate-400">
        در حال بارگذاری اطلاعات هسته...
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-400">
        خطا در دریافت اطلاعات.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700/50 pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-100">اطلاعات هسته Xray</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">وضعیت فعلی هسته نصب شده روی سرور</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">وضعیت دانلود</h3>
            <HardDrive className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="flex items-center gap-2">
            {status.isDownloaded ? (
              <><CheckCircle className="h-5 w-5 text-emerald-400" /><span className="text-lg font-medium text-emerald-400">دانلود شده</span></>
            ) : (
              <><XCircle className="h-5 w-5 text-red-400" /><span className="text-lg font-medium text-red-400">پیدا نشد</span></>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">وضعیت اجرا</h3>
            <Activity className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="flex items-center gap-2">
            {status.isRunning ? (
              <><CheckCircle className="h-5 w-5 text-emerald-400" /><span className="text-lg font-medium text-emerald-400">در حال اجرا</span></>
            ) : (
              <><XCircle className="h-5 w-5 text-red-400" /><span className="text-lg font-medium text-red-400">متوقف</span></>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 p-5 md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">نسخه Xray</h3>
            <Shield className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="text-lg font-mono text-slate-800 dark:text-slate-200">
            {status.version}
          </div>
        </div>
      </div>
    </div>
  );
}
