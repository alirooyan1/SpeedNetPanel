import React, { useEffect, useState } from 'react';
import { Activity, Cpu, Server, Clock, HardDrive, Wifi } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function Monitoring() {
  const [stats, setStats] = useState<any>(null);
  const [cpuHistory, setCpuHistory] = useState<any[]>(Array.from({length: 15}).map((_, i) => ({ name: '', cpu: 0 })));

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('speednet_token');
      try {
        const res = await fetch('/api/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          setCpuHistory(prev => {
            const timeStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            return [...prev.slice(1), { name: timeStr, cpu: data.cpu }];
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return <div className="text-slate-500 dark:text-slate-400">در حال بارگذاری اطلاعات مانیتورینگ...</div>;
  }

  const { cpu, memory, active_connections, uptime, chartData, total_usage, peak_usage, lowest_usage } = stats;

  return (
    <div className="animate-in fade-in duration-500 flex flex-col gap-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-white tracking-tight">مانیتورینگ سرور</h1>
        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          سرور در دسترس است
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="bg-blue-500/20 text-blue-400 p-3 rounded-lg"><Cpu size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">مصرف پردازنده (CPU)</p>
            <p className="text-2xl font-bold text-white mt-1" dir="ltr">{cpu}%</p>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="bg-indigo-500/20 text-indigo-400 p-3 rounded-lg"><HardDrive size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">مصرف حافظه (RAM)</p>
            <p className="text-2xl font-bold text-white mt-1" dir="ltr">{memory}%</p>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-lg"><Activity size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">کاربران فعال</p>
            <p className="text-2xl font-bold text-white mt-1">{active_connections}</p>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="bg-amber-500/20 text-amber-400 p-3 rounded-lg"><Clock size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">آپتایم سرور</p>
            <p className="text-lg font-bold text-white mt-1" dir="rtl">{uptime}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-base font-bold text-white">مصرف ترافیک شبکه</h2>
            {total_usage !== undefined && (
              <div className="flex gap-4 text-xs font-medium bg-white dark:bg-slate-900/50 p-2 rounded-lg border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                <div className="flex flex-col items-center flex-1 px-2">
                  <span className="text-slate-500 dark:text-slate-400 mb-1">مصرف کل</span>
                  <span className="text-white font-bold" dir="ltr">{total_usage.toFixed(1)} GB</span>
                </div>
                <div className="flex flex-col items-center flex-1 border-r border-slate-200 dark:border-slate-700 pr-4">
                  <span className="text-emerald-400 mb-1">پیک مصرف</span>
                  <span className="text-white font-bold" dir="ltr">{peak_usage.toFixed(1)} GB</span>
                </div>
                <div className="flex flex-col items-center flex-1 border-r border-slate-200 dark:border-slate-700 pr-4">
                  <span className="text-blue-400 mb-1">کمترین مصرف</span>
                  <span className="text-white font-bold" dir="ltr">{lowest_usage.toFixed(1)} GB</span>
                </div>
              </div>
            )}
          </div>
          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}GB`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#818cf8' }}
                  formatter={(value) => [`${value} GB`, 'مصرف']}
                />
                <Area type="monotone" dataKey="مصرف" stroke="#6366f1" fillOpacity={1} fill="url(#colorUsage)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h2 className="text-base font-bold text-white mb-6">وضعیت پردازش لحظه‌ای (CPU)</h2>
          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cpuHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#10b981' }}
                  formatter={(value) => [`${value} %`, 'بار پردازنده']}
                />
                <Line type="monotone" dataKey="cpu" name="بار پردازنده" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
