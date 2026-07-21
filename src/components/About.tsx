import React from 'react';
import { Info, ShieldAlert, Send, ListChecks } from 'lucide-react';

export default function About() {
  return (
    <div className="animate-in fade-in duration-500 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white tracking-tight">درباره پنل اسپید نت</h1>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="space-y-8">
          
          <section>
            <div className="flex items-start gap-4">
              <div className="bg-indigo-500/20 text-indigo-400 p-3 rounded-lg shrink-0">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white mb-2">معرفی و هدف</h2>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed text-justify">
                  سازنده، این پنل را برای اتصال راحت و بدون فیلترینگ مردم ایران به شبکه اینترنت و فضای مجازی جهانی ساخته و به صورت رایگان برای استفاده عمومی قرار داده است.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-start gap-4">
              <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-lg shrink-0">
                <ListChecks className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white mb-2">امکانات و ویژگی‌های پنل</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 dark:text-slate-300 text-sm leading-relaxed mt-4">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                    <span><strong>پشتیبانی از پروتکل‌های مدرن:</strong> پروتکل Vless با شبکه‌های WebSocket، TCP، gRPC و XHTTP (پوشش Packet/Stream).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                    <span><strong>داشبورد مدیریتی جامع:</strong> بررسی لحظه‌ای وضعیت سیستم، مشاهده مصرف داده‌ها و فعالیت کاربران به صورت گرافیکی.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                    <span><strong>مدیریت پیشرفته کاربران:</strong> افزودن، ویرایش، حذف و غیرفعال‌سازی خودکار کاربران پس از اتمام حجم یا مهلت زمانی اکانت.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                    <span><strong>مانیتورینگ بلادرنگ سرور:</strong> نمایش نمودارهای زنده از بار پردازنده (CPU)، مصرف رم و ترافیک شبکه (مصرف کل، پیک و حداقل).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                    <span><strong>دسترسی سریع با کد QR:</strong> تولید هوشمند و سریع کد QR برای هر کانفیگ جهت اتصال بسیار آسان کاربران.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                    <span><strong>طراحی ریسپانسیو و مدرن:</strong> پنل کاربری تاریک (Dark Theme) بسیار زیبا، سریع و کاملاً سازگار با تمامی نمایشگرها و موبایل.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                    <span><strong>امنیت و پایداری بالا:</strong> احراز هویت امن، استفاده از توکن‌های JWT و ذخیره‌سازی ایمن اطلاعات در پایگاه داده.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                    <span><strong>جستجو و مدیریت آسان:</strong> جستجوی سریع کاربران از طریق نام کاربری یا UUID و تولید خودکار لینک‌های اتصال.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-start gap-4">
              <div className="bg-rose-500/20 text-rose-400 p-3 rounded-lg shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white mb-2">قوانین استفاده</h2>
                <p className="text-rose-300 font-medium text-sm leading-relaxed text-justify">
                  از فروش این پنل به هیچ صورتی راضی نیستیم. استفاده تجاری و فروش این پنل به هر نحوی ممنوع و حرام می‌باشد و صرفاً جهت استفاده رایگان توسعه یافته است.
                </p>
              </div>
            </div>
          </section>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded text-sm text-slate-700 dark:text-slate-300 font-mono">
                نسخه ۲.۰.۰
              </div>
            </div>
            <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/20 text-sm font-medium w-full md:w-auto">
              <Send className="w-4 h-4 shrink-0" />
              <span>به زودی: Vless+reality</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
