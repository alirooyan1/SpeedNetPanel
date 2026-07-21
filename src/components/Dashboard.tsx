import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Server, Users, Cpu, HardDrive } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function Dashboard() {
  const [status, setStatus] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatus = async () => {
      const token = localStorage.getItem('speednet_token');
      if (!token) return navigate('/');
      
      try {
        const res = await fetch('/api/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) return navigate('/');
        const data = await res.json();
        setStatus(data);
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (!status) return <div className="p-8 text-slate-500 dark:text-slate-400">در حال بارگذاری...</div>;

  return (
    <div className="animate-in fade-in duration-500 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white tracking-tight">وضعیت سرور</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {[
          { label: 'پردازنده', value: `${status.cpu}%`, icon: Cpu, color: 'text-indigo-400', bg: 'bg-slate-50 dark:bg-slate-800' },
          { label: 'حافظه موقت (RAM)', value: `${status.memory}%`, icon: HardDrive, color: 'text-emerald-400', bg: 'bg-slate-50 dark:bg-slate-800' },
          { label: 'اتصالات فعال', value: status.active_connections, icon: Users, color: 'text-sky-400', bg: 'bg-slate-50 dark:bg-slate-800' },
          { label: 'زمان روشنی سرور', value: status.uptime, icon: Server, color: 'text-rose-400', bg: 'bg-slate-50 dark:bg-slate-800' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500">{stat.label}</span>
              <div className="text-2xl font-bold text-white mt-1">{stat.value}</div>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-bold text-white">نمودار مصرف ۷ روز گذشته (گیگابایت)</h2>
        </div>
        <div className="h-[300px] w-full p-4" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={status.chartData}>
              <defs>
                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Area type="monotone" dataKey="مصرف" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorUsage)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
