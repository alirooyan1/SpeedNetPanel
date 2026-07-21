import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Settings from './components/Settings';
import XrayInfo from './components/XrayInfo';
import TelegramBot from './components/TelegramBot';
import Monitoring from './components/Monitoring';
import About from './components/About';
import Layout from './components/Layout';
import Install from './components/Install';
import UserPortal from './components/UserPortal';

export default function App() {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/check-install')
      .then(res => res.json())
      .then(data => setIsInstalled(data.installed))
      .catch(() => setIsInstalled(false));
  }, []);

  if (isInstalled === null) {
    return <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400">در حال بارگذاری...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/install" element={!isInstalled ? <Install /> : <Navigate to="/" />} />
        <Route path="/portal/:uuid" element={<UserPortal />} />
        
        {/* If not installed, everything else redirects to install */}
        {!isInstalled && <Route path="*" element={<Navigate to="/install" />} />}
        
        {isInstalled && (
          <>
            <Route path="/" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/xray" element={<XrayInfo />} />
              <Route path="/telegram" element={<TelegramBot />} />
              <Route path="/about" element={<About />} />
            </Route>
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
