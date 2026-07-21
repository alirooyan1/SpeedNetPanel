import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

export function ensureXrayDownloaded() {
  const xrayPath = path.join(process.cwd(), 'xray');
  if (fs.existsSync(xrayPath)) return;

  console.log("Downloading Xray...");
  const arch = os.arch() === 'x64' ? '64' : (os.arch() === 'arm64' ? 'arm64-v8a' : null);
  if (!arch) {
    console.error("Unsupported arch: " + os.arch());
    return;
  }
  const url = `https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-${arch}.zip`;
  try {
    execSync(`wget -qO xray.zip ${url} && unzip -q xray.zip xray && rm xray.zip && chmod +x xray`, { stdio: 'inherit' });
    console.log("Xray downloaded.");
  } catch (e) {
    console.error("Failed to download Xray", e);
  }
}

