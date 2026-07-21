import fs from 'fs';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import os from 'os';

let xrayProcess: ChildProcess | null = null;
let currentUsersHash = '';

export async function syncXray(users: any[]) {
    const activeUsers = users.filter(u => u.status === 'active');
    
    // Hash users to detect changes
    const hash = activeUsers.map(u => u.uuid).sort().join(',');
    if (hash === currentUsersHash && xrayProcess) {
        return; // No changes
    }
    
    console.log("Xray users changed, updating config...");
    currentUsersHash = hash;
    
    const xrayClients = activeUsers.map(u => ({
        id: u.uuid,
        email: u.username
    }));

    const config = {
        log: { loglevel: "warning" },
        inbounds: [
            {
                port: 10000,
                listen: "127.0.0.1",
                protocol: "vless",
                settings: {
                    clients: xrayClients,
                    decryption: "none"
                },
                streamSettings: {
                    network: "ws",
                    security: "none",
                    wsSettings: {
                        path: "/speednet"
                    }
                }
            }
        ],
        outbounds: [
            {
                protocol: "freedom",
                settings: {}
            }
        ]
    };

    fs.writeFileSync(path.join(process.cwd(), 'xray_config.json'), JSON.stringify(config, null, 2));

    if (xrayProcess) {
        xrayProcess.kill();
    }

    const xrayPath = path.join(process.cwd(), 'xray');
    if (fs.existsSync(xrayPath)) {
        xrayProcess = spawn(xrayPath, ['-c', 'xray_config.json'], {
            stdio: 'inherit'
        });
        xrayProcess.on('error', (err) => console.error("Xray spawn error:", err));
    } else {
        console.error("Xray binary not found!");
    }
}

export function getXrayStatus() {
    const xrayPath = path.join(process.cwd(), 'xray');
    const isDownloaded = fs.existsSync(xrayPath);
    let version = 'Unknown';
    if (isDownloaded) {
        try {
            const output = require('child_process').execSync(`${xrayPath} version`).toString();
            version = output.split('\n')[0];
        } catch (e) {
            version = 'Error retrieving version';
        }
    }
    
    return {
        isRunning: !!xrayProcess,
        isDownloaded,
        version,
        activeUsersCount: currentUsersHash ? currentUsersHash.split(',').length : 0
    };
}
