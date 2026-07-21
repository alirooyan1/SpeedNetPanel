import TelegramBot from 'node-telegram-bot-api';
import os from 'os';
import { SupabaseClient } from '@supabase/supabase-js';

let bot: TelegramBot | null = null;
let currentToken = '';
let currentPanelUrl = '';

// In-memory store for user config links to UUIDs (chatId -> uuid)
const userConfigs: Record<number, string> = {};

export function processWebhook(body: any) {
  if (bot) {
    bot.processUpdate(body);
  }
}

export async function reloadBot(supabase: SupabaseClient) {
  try {
    const { data: rows } = await supabase.from('settings').select('*');
    if (!rows) return;
    
    const settings = rows.reduce((acc: any, row: any) => { acc[row.key] = row.value; return acc; }, {});
    const token = settings.telegramToken;
    const adminId = parseInt(settings.telegramAdminId || '0');
    const panelUrl = settings.panelUrl;
    
    const adminWelcomeMsg = settings.telegramAdminWelcome || 'سلام ادمین عزیز! به پنل مدیریت خوش آمدید.';
    const userWelcomeMsg = settings.telegramUserWelcome || 'سلام! به ربات SpeedNet خوش آمدید.\nلطفا کانفیگ Vless خود را ارسال کنید تا اطلاعات مصرفی شما را نمایش دهم.';
    const invalidConfigMsg = settings.telegramInvalidConfig || '❌ لینک کانفیگ نامعتبر است.';
    const userNotFoundMsg = settings.telegramUserNotFound || '❌ کاربری با این کانفیگ یافت نشد.';

    if (token && (token !== currentToken || panelUrl !== currentPanelUrl)) {
      if (bot) {
        bot.deleteWebHook().catch(() => {});
      }
      if (panelUrl) {
         bot = new TelegramBot(token, { webHook: true });
      } else {
         bot = new TelegramBot(token, { polling: true });
      }
      currentToken = token;
      currentPanelUrl = panelUrl;

      if (panelUrl) {
         bot.setWebHook(`${panelUrl}/api/telegram/webhook`).catch(e => console.error("Webhook error", e));
      }

      bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        if (chatId === adminId) {
          bot?.sendMessage(chatId, adminWelcomeMsg, {
            reply_markup: {
              keyboard: [
                [{ text: '📊 وضعیت سرور' }, { text: '👥 لیست کاربران' }], [{ text: '📥 بکاپ کاربران' }]
              ],
              resize_keyboard: true
            }
          });
        } else {
          bot?.sendMessage(chatId, userWelcomeMsg);
        }
      });

      bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        if (msg.text === '/start') return;

        if (chatId === adminId) {
          if (msg.text === '📊 وضعیت سرور') {
            const { data: users } = await supabase.from('users').select('*');
            const active = users?.filter(u => u.status === 'active').length || 0;
            const totalUsage = users?.reduce((acc, u) => acc + (u.used_gb || 0), 0).toFixed(2) || '0';
            
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const memoryPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);
            const cpus = os.cpus();
            const loadAvg = os.loadavg()[0];
            const cpuPercent = Math.min(Math.round((loadAvg / cpus.length) * 100), 100);
            
            const text = `📊 **وضعیت سرور**\n\n🟢 کاربران فعال: ${active}\n📡 کل مصرف: ${totalUsage} GB\n💻 پردازنده: ${cpuPercent}%\n🧠 رم: ${memoryPercent}%`;
            bot?.sendMessage(chatId, text, { parse_mode: 'Markdown' });
          } else if (msg.text === '👥 لیست کاربران') {
            const { data: users } = await supabase.from('users').select('*');
            if (!users || users.length === 0) {
               bot?.sendMessage(chatId, 'کاربری یافت نشد.');
               return;
            }
            let text = '👥 **لیست کاربران:**\n\n';
            users.forEach(u => {
              const used = (u.used_gb || 0).toFixed(2);
              text += `👤 ${u.username} | ${u.status === 'active' ? '🟢' : '🔴'} | ${used}/${u.data_limit_gb} GB\n`;
            });
            bot?.sendMessage(chatId, text, { parse_mode: 'Markdown' });
          } else if (msg.text === '📥 بکاپ کاربران') {
            const { data: users } = await supabase.from('users').select('*');
            if (!users || users.length === 0) {
               bot?.sendMessage(chatId, 'کاربری یافت نشد.');
               return;
            }
            let csv = 'ID,Username,Status,DataLimit,UsedGB,ExpireDate,UUID\n';
            users.forEach(u => {
              csv += `${u.id},${u.username},${u.status},${u.data_limit_gb},${u.used_gb},${u.expire_date || ''},${u.uuid}\n`;
            });
            const backupPath = os.tmpdir() + '/users_backup.csv';
            require('fs').writeFileSync(backupPath, csv);
            bot?.sendDocument(chatId, backupPath, { caption: '📥 فایل بکاپ لیست کاربران' });
          }

        } else {
          // Normal user flow
          let uuid = '';
          
          if ((msg.text === '🔄 بروزرسانی اطلاعات' || msg.text === '🌐 پورتال اختصاصی من' || msg.text === '🔗 دریافت لینک اتصال') && userConfigs[chatId]) {
            uuid = userConfigs[chatId];
          } else if (msg.text && msg.text.startsWith('vless://')) {
            try {
              const url = new URL(msg.text);
              uuid = url.username;
              userConfigs[chatId] = uuid;
            } catch (e) {
              bot?.sendMessage(chatId, invalidConfigMsg);
              return;
            }
          } else if (userConfigs[chatId]) {
             bot?.sendMessage(chatId, 'لطفا از دکمه بروزرسانی استفاده کنید یا کانفیگ خود را بفرستید.');
             return;
          } else {
             bot?.sendMessage(chatId, 'لطفا کانفیگ Vless خود را ارسال کنید.');
             return;
          }

          
          
          if (msg.text === '🔗 دریافت لینک اتصال' && userConfigs[chatId]) {
             const { data: user } = await supabase.from('users').select('*').eq('uuid', uuid).single();
             if (!user) return;
             const vlessLink = `vless://${user.uuid}@${new URL(currentPanelUrl || 'http://localhost').hostname}:10000?encryption=none&security=none&type=ws&path=%2Fspeednet#${encodeURIComponent(user.username)}`;
             bot?.sendMessage(chatId, `🔗 **لینک اتصال شما:**\n\n\`${vlessLink}\`\n\n(برای کپی شدن روی لینک کلیک کنید)`, { parse_mode: 'Markdown' });
             return;
          }
          if (msg.text === '🌐 پورتال اختصاصی من' && userConfigs[chatId]) {
             const portalLink = `${currentPanelUrl}/portal/${uuid}`;
             bot?.sendMessage(chatId, `🌐 **پورتال اختصاصی شما**\n\nبرای مشاهده میزان مصرف، بارکد اتصال و جزئیات بیشتر به لینک زیر مراجعه کنید:\n\n${portalLink}`, { parse_mode: 'Markdown' });
             return;
          }
          const { data: user } = await supabase.from('users').select('*').eq('uuid', uuid).single();
          if (!user) {
             bot?.sendMessage(chatId, userNotFoundMsg);
             return;
          }

          const used = (user.used_gb || 0).toFixed(2);
          let expireText = 'نامحدود';
          if (user.expire_date) {
             const remainingDays = Math.max(0, Math.ceil((new Date(user.expire_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
             expireText = `${remainingDays} روز`;
          }

          const text = `👤 **اطلاعات اشتراک شما**\n\n🔹 نام: ${user.username}\nوضعیت: ${user.status === 'active' ? '🟢 فعال' : '🔴 غیرفعال'}\n\n📊 مصرف شده: ${used} گیگابایت\n📦 کل حجم: ${user.data_limit_gb} گیگابایت\n⏳ زمان باقی‌مانده: ${expireText}`;

          bot?.sendMessage(chatId, text, {
            parse_mode: 'Markdown',
            reply_markup: {
              keyboard: [
                [{ text: '🔄 بروزرسانی اطلاعات' }, { text: '🌐 پورتال اختصاصی من' }], [{ text: '🔗 دریافت لینک اتصال' }]
              ],
              resize_keyboard: true
            }
          });
        }
      });
    } else if (!token && bot) {
      bot.deleteWebHook().catch(() => {});
      bot = null;
      currentToken = '';
      currentPanelUrl = '';
    }
  } catch(e) {
    console.error("Bot check error:", e);
  }
}

export function initBot(supabase: SupabaseClient) {
  reloadBot(supabase);
  setInterval(() => reloadBot(supabase), 10000);
}
