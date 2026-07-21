import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { QRCodeSVG } from 'qrcode.react';
import { User, Activity, Calendar, Shield, Copy, Check } from 'lucide-react';

interface UserInfo {
  username: string;
  status: string;
  data_limit_gb: number;
  used_gb: number;
  expire_date: string;
  uuid: string;
}

export default function UserPortal() {
  const { uuid } = useParams();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/portal/${uuid}`)
      .then(res => {
        if (!res.ok) throw new Error('User not found');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        setError('کاربر یافت نشد یا مشکلی در دریافت اطلاعات وجود دارد.');
        setLoading(false);
      });
  }, [uuid]);

  if (loading) {
    return <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400">در حال بارگذاری...</div>;
  }

  if (error || !user) {
    return <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center text-red-400">{error}</div>;
  }

  const vlessLink = `vless://${user.uuid}@${window.location.hostname}:10000?encryption=none&security=none&type=ws&path=%2Fspeednet#${encodeURIComponent(user.username)}`;
  
  const usagePercent = Math.min(100, Math.round(((user.used_gb || 0) / user.data_limit_gb) * 100));
  let expireText = 'نامحدود';
  if (user.expire_date) {
    const days = Math.ceil((new Date(user.expire_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    expireText = days > 0 ? `${days} روز` : 'منقضی شده';
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(vlessLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-center">
          <div className="mx-auto h-16 w-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">پورتال کاربری {user.username}</h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-sm">
            <div className={`h-2 w-2 rounded-full ${user.status === 'active' ? 'bg-green-400' : 'bg-red-400'} shadow-[0_0_8px_currentColor]`} />
            {user.status === 'active' ? 'فعال' : 'غیرفعال'}
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">حجم مصرفی</p>
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    {user.used_gb.toFixed(2)} <span className="text-sm text-slate-400 dark:text-slate-500">از</span> {user.data_limit_gb} GB
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-400">{usagePercent}%</span>
              </div>
            </div>
            
            <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className={`h-2.5 rounded-full ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${usagePercent}%` }}></div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
             <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Calendar className="h-5 w-5" />
             </div>
             <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">زمان باقی‌مانده</p>
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{expireText}</p>
             </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
            <h3 className="text-center text-slate-700 dark:text-slate-300 font-medium mb-4 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" /> بارکد اتصال سریع
            </h3>
            <div className="flex justify-center p-4 bg-white rounded-xl mx-auto w-max">
              <QRCodeSVG value={vlessLink} size={180} level="M" />
            </div>
          </div>
          
          <button 
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            {copied ? 'لینک کپی شد' : 'کپی لینک Vless'}
          </button>
        </div>
      </div>
    </div>
  );
}
