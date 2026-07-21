import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Trash2, Link as LinkIcon, Check, Power, PowerOff, Edit, QrCode, X, Globe } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  // Edit mode state
  const [editUserId, setEditUserId] = useState<number | null>(null);

  // QR Code Modal State
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  
  // Form state
  const [username, setUsername] = useState('');
  const [dataLimit, setDataLimit] = useState('50');
  const [durationDays, setDurationDays] = useState('30');
  const [network, setNetwork] = useState('ws');
  const [fingerprint, setFingerprint] = useState('chrome');
  const [port, setPort] = useState('443');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();

  const fetchUsers = async () => {
    const token = localStorage.getItem('speednet_token');
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) return navigate('/');
      setUsers(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [navigate]);

  const handleOpenAddModal = () => {
    setEditUserId(null);
    setUsername('');
    setDataLimit('50');
    setDurationDays('30');
    setNetwork('ws');
    setFingerprint('chrome');
    setPort('443');
    setShowModal(true);
  };

  const handleOpenEditModal = (user: any) => {
    setEditUserId(user.id);
    setUsername(user.username);
    setDataLimit(user.data_limit_gb.toString());
    
    let days = 30;
    if (user.expire_date) {
      const remaining = Math.ceil((new Date(user.expire_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      days = remaining > 0 ? remaining : 0;
    }
    setDurationDays(days.toString());
    
    setNetwork(user.network || 'ws');
    setFingerprint(user.fingerprint || 'chrome');
    setPort((user.port || 443).toString());
    
    setShowModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('speednet_token');
    
    const url = editUserId ? `/api/users/${editUserId}` : '/api/users';
    const method = editUserId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ username, data_limit_gb: parseFloat(dataLimit), duration_days: parseInt(durationDays), network, fingerprint, port: parseInt(port) })
    });
    
    setShowModal(false);
    fetchUsers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این کاربر اطمینان دارید؟')) return;
    const token = localStorage.getItem('speednet_token');
    await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchUsers();
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const token = localStorage.getItem('speednet_token');
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    await fetch(`/api/users/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus })
    });
    fetchUsers();
  };

  const generateVlessLink = (user: any) => {
    const host = window.location.hostname;
    const netRaw = user.network || 'ws';
    let net = netRaw;
    let extraParams = '';
    
    if (netRaw === 'xhttp-packet') {
      net = 'xhttp';
      extraParams = '&mode=packet';
    } else if (netRaw === 'xhttp-stream') {
      net = 'xhttp';
      extraParams = '&mode=stream';
    }

    const fp = user.fingerprint || 'chrome';
    const p = user.port || 443;
    let link = `vless://${user.uuid}@${host}:${p}?encryption=none&security=tls&sni=${host}&fp=${fp}&type=${net}${extraParams}`;
    if (net === 'ws') {
      link += `&path=%2Fspeednet%2F${user.uuid}`;
    }
    link += `#${user.username}`;
    return link;
  };

  const handleCopyLink = (user: any) => {
    const link = generateVlessLink(user);
    navigator.clipboard.writeText(link);
    setCopiedId(user.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShowQrCode = (user: any) => {
    const link = generateVlessLink(user);
    setQrCodeData(link);
    setShowQrModal(true);
  };

  const formatJalali = (dateStr: string | null) => {
    if (!dateStr) return 'نامحدود';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('fa-IR', {
        calendar: 'persian',
        timeZone: 'Asia/Tehran',
        dateStyle: 'long'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="animate-in fade-in duration-500 flex flex-col gap-6 overflow-hidden h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <h1 className="text-xl font-bold text-white tracking-tight">مدیریت کاربران</h1>
        <button
          onClick={handleOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded text-sm font-medium flex items-center justify-center sm:justify-start gap-2 transition-colors w-full sm:w-auto"
        >
          <Plus size={16} />
          ساخت کاربر جدید
        </button>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden flex-1">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800">
          <h2 className="text-sm font-bold text-white">لیست کاربران</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="جستجو با نام کاربری یا UUID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 sm:py-1 text-xs focus:outline-none focus:border-indigo-500 w-full sm:w-64 text-slate-700 dark:text-slate-300" 
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {/* Desktop View */}
          <div className="hidden md:block">
            <table className="w-full text-right text-xs min-w-[700px]">
              <thead className="bg-white dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 sticky top-0 border-b border-slate-200 dark:border-slate-700 z-10">
                <tr>
                  <th className="p-3 font-medium">نام کاربری</th>
                  <th className="p-3 font-medium">حجم مصرفی / کل (GB)</th>
                  <th className="p-3 font-medium">تاریخ انقضا</th>
                  <th className="p-3 font-medium">وضعیت</th>
                  <th className="p-3 font-medium text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {users.filter(user => 
                  user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (user.uuid && user.uuid.toLowerCase().includes(searchTerm.toLowerCase()))
                ).map((user) => (
                  <tr key={user.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-medium text-white">{user.username}</td>
                    <td className="p-3" dir="ltr">
                      <div className="flex items-center justify-end gap-2 text-[10px] md:text-xs">
                        <span className="text-slate-500 dark:text-slate-400">{user.data_limit_gb} /</span>
                        <span className={user.used_gb > user.data_limit_gb * 0.8 ? 'text-rose-400 font-medium' : 'text-slate-700 dark:text-slate-300'}>
                          {user.used_gb.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400" dir="rtl">
                      {formatJalali(user.expire_date)}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${user.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/20 text-rose-400 border border-rose-500/20'}`}>
                        {user.status === 'active' ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td className="p-3 text-left">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className={`transition-colors tooltip ${user.status === 'active' ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400'}`}
                          title={user.status === 'active' ? 'غیرفعال کردن کاربر' : 'فعال کردن کاربر'}
                        >
                          {user.status === 'active' ? <Power size={16} /> : <PowerOff size={16} />}
                        </button>
                        <button
                          onClick={() => handleCopyLink(user)}
                          className={`transition-colors tooltip ${user.status === 'active' ? 'text-indigo-400 hover:text-indigo-300' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
                          title={user.status === 'active' ? 'کپی لینک اشتراک' : 'کاربر غیرفعال است'}
                          disabled={user.status !== 'active'}
                        >
                          {copiedId === user.id ? <Check size={16} className="text-emerald-400" /> : <LinkIcon size={16} />}
                        </button>
                        <button
                          onClick={() => window.open('/portal/' + user.uuid, '_blank')}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors tooltip"
                          title="پورتال اختصاصی کاربر"
                        >
                          <Globe size={16} />
                        </button>
                        <button
                          onClick={() => handleShowQrCode(user)}
                          className={`transition-colors tooltip ${user.status === 'active' ? 'text-indigo-400 hover:text-indigo-300' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
                          title={user.status === 'active' ? 'نمایش QR Code' : 'کاربر غیرفعال است'}
                          disabled={user.status !== 'active'}
                        >
                          <QrCode size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="text-slate-500 dark:text-slate-400 hover:text-indigo-400 transition-colors tooltip"
                          title="ویرایش کاربر"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-rose-400 hover:text-rose-300 transition-colors tooltip"
                          title="حذف کاربر"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm">
                      هیچ کاربری یافت نشد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden flex flex-col divide-y divide-slate-700/50">
            {users.filter(user => 
              user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
              (user.uuid && user.uuid.toLowerCase().includes(searchTerm.toLowerCase()))
            ).map((user) => (
              <div key={user.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">{user.username}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${user.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/20 text-rose-400 border border-rose-500/20'}`}>
                    {user.status === 'active' ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/50 p-2 rounded border border-slate-200 dark:border-slate-700/50">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 dark:text-slate-500 text-[10px]">حجم مصرفی</span>
                    <div className="flex gap-1 items-center" dir="ltr">
                      <span>{user.data_limit_gb} /</span>
                      <span className={user.used_gb > user.data_limit_gb * 0.8 ? 'text-rose-400 font-medium' : 'text-slate-700 dark:text-slate-300'}>
                        {user.used_gb.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-slate-200 dark:bg-slate-700/50"></div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-slate-400 dark:text-slate-500 text-[10px]">تاریخ انقضا</span>
                    <span dir="rtl">{formatJalali(user.expire_date)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700/50 pt-3 mt-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">عملیات:</span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      className={`transition-colors p-1 ${user.status === 'active' ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400'}`}
                      title={user.status === 'active' ? 'غیرفعال' : 'فعال'}
                    >
                      {user.status === 'active' ? <Power size={18} /> : <PowerOff size={18} />}
                    </button>
                    <button
                      onClick={() => handleCopyLink(user)}
                      className={`transition-colors p-1 ${user.status === 'active' ? 'text-indigo-400 hover:text-indigo-300' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
                      disabled={user.status !== 'active'}
                    >
                      {copiedId === user.id ? <Check size={18} className="text-emerald-400" /> : <LinkIcon size={18} />}
                    </button>
                    <button
                      onClick={() => handleShowQrCode(user)}
                      className={`transition-colors p-1 ${user.status === 'active' ? 'text-indigo-400 hover:text-indigo-300' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
                      disabled={user.status !== 'active'}
                    >
                      <QrCode size={18} />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(user)}
                      className="text-slate-500 dark:text-slate-400 hover:text-indigo-400 transition-colors p-1"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-rose-400 hover:text-rose-300 transition-colors p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {users.filter(user => 
              user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
              (user.uuid && user.uuid.toLowerCase().includes(searchTerm.toLowerCase()))
            ).length === 0 && (
              <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm">
                هیچ کاربری یافت نشد.
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-100 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl w-full max-w-sm shadow-2xl">
            <h2 className="text-base font-bold text-white mb-6">
              {editUserId ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
            </h2>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">نام کاربری</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">محدودیت حجم (گیگابایت)</label>
                <input
                  type="number"
                  value={dataLimit}
                  onChange={(e) => setDataLimit(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">مدت زمان (روز)</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">پورت</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">شبکه انتقال</label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="ws">WebSocket (ws)</option>
                    <option value="tcp">TCP</option>
                    <option value="grpc">gRPC</option>
                    <option value="xhttp-packet">xhttp (Packet Up)</option>
                    <option value="xhttp-stream">xhttp (Stream Up)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">فینگرپرینت (fp)</label>
                  <select
                    value={fingerprint}
                    onChange={(e) => setFingerprint(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="chrome">Chrome</option>
                    <option value="firefox">Firefox</option>
                    <option value="safari">Safari</option>
                    <option value="ios">iOS</option>
                    <option value="android">Android</option>
                    <option value="edge">Edge</option>
                    <option value="random">Random</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded text-sm font-medium transition-colors"
                >
                  ذخیره
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-200 py-2 rounded text-sm font-medium transition-colors"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQrModal && (
        <div className="fixed inset-0 bg-slate-100 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowQrModal(false)}>
          <div className="bg-white p-6 rounded-xl shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowQrModal(false)}
              className="absolute top-2 right-2 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-600"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center gap-4 mt-2">
              <h2 className="text-slate-800 font-bold">QR Code لینک اشتراک</h2>
              <div className="bg-white p-2 rounded-lg">
                <QRCodeSVG value={qrCodeData} size={200} level="M" />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
