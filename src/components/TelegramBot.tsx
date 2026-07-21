import React, { useState, useEffect } from 'react';
import { Save, Bot, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function TelegramBot() {
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramAdminId, setTelegramAdminId] = useState('');
  const [panelUrl, setPanelUrl] = useState('');
  
  // Custom Messages
  const [telegramAdminWelcome, setTelegramAdminWelcome] = useState('سلام ادمین عزیز! به پنل مدیریت خوش آمدید.');
  const [telegramUserWelcome, setTelegramUserWelcome] = useState('سلام! به ربات SpeedNet خوش آمدید.\nلطفا کانفیگ Vless خود را ارسال کنید تا اطلاعات مصرفی شما را نمایش دهم.');
  const [telegramInvalidConfig, setTelegramInvalidConfig] = useState('❌ لینک کانفیگ نامعتبر است.');
  const [telegramUserNotFound, setTelegramUserNotFound] = useState('❌ کاربری با این کانفیگ یافت نشد.');

  const [saving, setSaving] = useState(false);
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
        if (data.telegramToken) setTelegramToken(data.telegramToken);
        if (data.telegramAdminId) setTelegramAdminId(data.telegramAdminId);
        if (data.panelUrl) setPanelUrl(data.panelUrl);
        
        if (data.telegramAdminWelcome) setTelegramAdminWelcome(data.telegramAdminWelcome);
        if (data.telegramUserWelcome) setTelegramUserWelcome(data.telegramUserWelcome);
        if (data.telegramInvalidConfig) setTelegramInvalidConfig(data.telegramInvalidConfig);
        if (data.telegramUserNotFound) setTelegramUserNotFound(data.telegramUserNotFound);

      } catch (e) {
        console.error(e);
      }
    }
    fetchSettings();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('speednet_token');
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          telegramToken, 
          telegramAdminId,
          telegramAdminWelcome,
          telegramUserWelcome,
          telegramInvalidConfig,
          telegramUserNotFound,
          panelUrl
        })
      });
      alert('تنظیمات ربات با موفقیت ذخیره شد.');
    } catch (e: any) {
      alert('خطا در ذخیره تنظیمات.');
    }
    setSaving(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">ربات تلگرام</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            اتصال پنل به ربات تلگرام برای مدیریت توسط ادمین و مشاهده مشخصات توسط کاربران.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col p-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-400">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">تنظیمات ربات</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">مدیریت توکن ربات و آیدی ادمین</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">توکن ربات (Bot Token)</label>
            <input
              type="password"
              value={telegramToken}
              onChange={(e) => setTelegramToken(e.target.value)}
              placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">آیدی عددی ادمین (Admin ID)</label>
            <input
              type="text"
              value={telegramAdminId}
              onChange={(e) => setTelegramAdminId(e.target.value)}
              placeholder="12345678"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">با ارسال /start به ربات، ادمین پنل فعال می‌شود.</p>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">آدرس پنل (Panel URL) (خالی برای Polling)</label>
            <input
              type="url"
              value={panelUrl}
              onChange={(e) => setPanelUrl(e.target.value)}
              placeholder="https://app.example.com"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-left"
              dir="ltr"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">جهت استفاده از وب‌هوک آدرس کامل همراه با https را وارد کنید.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col p-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-400">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">تنظیمات پیام‌ها</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">مدیریت متون ارسالی توسط ربات</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">پیام خوش‌آمدگویی ادمین</label>
            <textarea
              value={telegramAdminWelcome}
              onChange={(e) => setTelegramAdminWelcome(e.target.value)}
              rows={2}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">پیام خوش‌آمدگویی کاربران</label>
            <textarea
              value={telegramUserWelcome}
              onChange={(e) => setTelegramUserWelcome(e.target.value)}
              rows={3}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">پیام کانفیگ نامعتبر</label>
            <input
              type="text"
              value={telegramInvalidConfig}
              onChange={(e) => setTelegramInvalidConfig(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">پیام کاربر یافت نشد</label>
            <input
              type="text"
              value={telegramUserNotFound}
              onChange={(e) => setTelegramUserNotFound(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
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
    </div>
  );
}
