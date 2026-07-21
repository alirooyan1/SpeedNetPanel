import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { initBot, reloadBot, processWebhook } from './telegramBot';
import { syncXray, getXrayStatus } from './xrayManager';

const app = express();
import { ensureXrayDownloaded } from "./downloadXray";
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'speednet-secret-key-for-admin';
const CONFIG_FILE = path.join(process.cwd(), 'config.json');

let supabase: any = null;
let supabaseUrl = '';
let supabaseKey = '';

// Load config
function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      if (config.supabaseUrl && config.supabaseKey) {
        supabaseUrl = config.supabaseUrl;
        supabaseKey = config.supabaseKey;
        supabase = createClient(supabaseUrl, supabaseKey);
        return true;
      }
    } catch(e) {}
  }
  return false;
}

let isInstalled = loadConfig();

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  if (!isInstalled) return res.status(403).json({ requiresInstall: true });
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.adminId = decoded.id;
    next();
  });
};

app.get('/api/check-install', (req, res) => {
  res.json({ installed: isInstalled });
});

app.post('/api/install', async (req, res) => {
  if (isInstalled) return res.status(400).json({ error: 'Already installed' });
  const { url, key, dbUrl, adminUser, adminPass } = req.body;
  if (!url || !key || !dbUrl || !adminUser || !adminPass) return res.status(400).json({ error: 'Missing fields' });
  
  try {
    // Create tables via pg client
    const pgClient = new Client({ connectionString: dbUrl });
    await pgClient.connect();
    const sql = fs.readFileSync(path.join(process.cwd(), 'sql_instructions.txt'), 'utf8');
    await pgClient.query(sql);
    
    // Insert admin user
    await pgClient.query('INSERT INTO admin (id, username, password) VALUES (1, $1, $2) ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, password = EXCLUDED.password', [adminUser, adminPass]);
    await pgClient.end();
    
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ supabaseUrl: url, supabaseKey: key }, null, 2));
    isInstalled = loadConfig();
    res.json({ success: true });
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});


app.post('/api/login', async (req, res) => {
  if (!isInstalled) return res.status(403).json({ requiresInstall: true });
  const { username, password } = req.body;
  
  const { data, error } = await supabase.from('admin').select('*').eq('username', username).single();
  
  if (data && data.password === password) {
    const token = jwt.sign({ id: data.id, username }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است' });
  }
});


// Public Portal
app.get('/api/portal/:uuid', async (req, res) => {
  const { data: user, error } = await supabase.from('users').select('*').eq('uuid', req.params.uuid).single();
  if (error || !user) return res.status(404).json({ error: 'User not found' });
  
  res.json({
    username: user.username,
    status: user.status,
    data_limit_gb: user.data_limit_gb,
    used_gb: user.used_gb,
    expire_date: user.expire_date,
    uuid: user.uuid
  });
});

// Users CRUD
app.get('/api/users', authenticate, async (req, res) => {
  const { data, error } = await supabase.from('users').select('*').order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/users', authenticate, async (req, res) => {
  const { data, error } = await supabase.from('users').insert([req.body]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.put('/api/users/:id', authenticate, async (req, res) => {
  const { data, error } = await supabase.from('users').update(req.body).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.delete('/api/users/:id', authenticate, async (req, res) => {
  const { error } = await supabase.from('users').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Settings
app.get('/api/xray-status', authenticate, (req, res) => {
    res.json(getXrayStatus());
});

app.get('/api/settings', authenticate, async (req, res) => {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const settings = data.reduce((acc: any, row: any) => { acc[row.key] = row.value; return acc; }, {});
  res.json(settings);
});

app.post('/api/settings', authenticate, async (req, res) => {
  const settings = req.body;
  const updates = Object.keys(settings).map(key => ({ key, value: settings[key] }));
  const { error } = await supabase.from('settings').upsert(updates);
  if (error) return res.status(500).json({ error: error.message });
  
  if (Object.keys(settings).some(k => k.startsWith('telegram') || k === 'panelUrl')) {
    reloadBot(supabase); // Note: reloadBot needs to be updated to use Supabase client!
  }
  res.json({ success: true });
});

app.post('/api/telegram/webhook', (req, res) => {
  processWebhook(req.body);
  res.sendStatus(200);
});

// Sync Xray and Bot loop
setInterval(async () => {
    if (!isInstalled || !supabase) return;
    try {
        const { data } = await supabase.from('users').select('*');
        if (data) syncXray(data);
    } catch(e) {}
}, 10000);

// Proxy WS for Xray
async function startServer() {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws, req) => {
    // Determine UUID from URL path if possible (e.g. /speednet/UUID)
    let uuid = '';
    const match = req.url?.match(/^\/speednet\/([a-f0-9\-]{36})/i);
    if (match) {
        uuid = match[1];
    }

    const xrayWs = new WebSocket('ws://127.0.0.1:10000/speednet');
    let buffer: Buffer[] = [];
    let isFirst = true;

    ws.on('message', (msg: Buffer) => {
        if (isFirst) {
            isFirst = false;
            if (!uuid && msg.length >= 17) { // Parse UUID from VLESS header
                const uuidHex = msg.subarray(1, 17).toString('hex');
                uuid = `${uuidHex.slice(0,8)}-${uuidHex.slice(8,12)}-${uuidHex.slice(12,16)}-${uuidHex.slice(16,20)}-${uuidHex.slice(20)}`;
            }
        }
        
        if (xrayWs.readyState === WebSocket.OPEN) {
            xrayWs.send(msg);
        } else {
            buffer.push(msg);
        }
    });

    xrayWs.on('open', () => {
        for (const msg of buffer) xrayWs.send(msg);
        buffer = [];
    });

    let bytesCount = 0;
    xrayWs.on('message', (msg: Buffer) => {
        bytesCount += msg.length;
        if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    });

    xrayWs.on('close', () => ws.close());
    xrayWs.on('error', () => ws.close());
    
    ws.on('close', () => {
        xrayWs.close();
        if (bytesCount > 0 && uuid && supabase) {
            const gb = bytesCount / (1024 * 1024 * 1024);
            // We need to fetch current usage and add to it
            supabase.rpc('increment_usage', { user_uuid: uuid, amount_gb: gb }).then(({error}: any) => {
                if (error) {
                    // Fallback if rpc is not created
                    supabase.from('users').select('used_gb').eq('uuid', uuid).single().then(({data}: any) => {
                        if (data) {
                            supabase.from('users').update({ used_gb: (data.used_gb || 0) + gb }).eq('uuid', uuid).then();
                        }
                    });
                }
            });
        }
    });
    ws.on('error', () => xrayWs.close());
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/speednet')) {
      wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (isInstalled && supabase) {
        initBot(supabase); // Ensure Telegram bot boots
    }
  });
}

ensureXrayDownloaded();
startServer();
