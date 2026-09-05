const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { execFile } = require('child_process');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const https = require('https');
const http = require('http');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 940,
    minWidth: 1120,
    minHeight: 720,
    backgroundColor: '#08090b',
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#08090b', symbolColor: '#f5f5f5', height: 42 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

function runSpicetify(args) {
  return new Promise((resolve, reject) => {
    execFile('spicetify', args, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        error.message = (stderr || error.message || '').trim();
        reject(error);
        return;
      }
      resolve((stdout || '').trim());
    });
  });
}

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

function mediaExtension(input, contentType='') {
  const clean = (input || '').split('?')[0].toLowerCase();
  const fromPath = path.extname(clean);
  if (['.gif','.png','.jpg','.jpeg','.webp'].includes(fromPath)) return fromPath === '.jpeg' ? '.jpg' : fromPath;
  if (contentType.includes('gif')) return '.gif';
  if (contentType.includes('png')) return '.png';
  if (contentType.includes('webp')) return '.webp';
  return '.jpg';
}

function download(url, destinationBase, redirects=0) {
  return new Promise((resolve, reject) => {
    if (redirects > 8) return reject(new Error('Too many redirects while downloading the background.'));
    let parsed;
    try { parsed = new URL(url); } catch { return reject(new Error('Invalid background URL.')); }
    const client = parsed.protocol === 'http:' ? http : https;
    const req = client.get(parsed, { headers: { 'User-Agent': 'Customify/1.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = new URL(res.headers.location, parsed).toString();
        res.resume();
        return resolve(download(next, destinationBase, redirects + 1));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('Background download failed with HTTP ' + res.statusCode));
      }
      const ext = mediaExtension(parsed.pathname, String(res.headers['content-type'] || ''));
      const destination = destinationBase + ext;
      const file = fs.createWriteStream(destination);
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve({ destination, filename: path.basename(destination) })));
      file.on('error', reject);
    });
    req.setTimeout(20000, () => req.destroy(new Error('Background download timed out.')));
    req.on('error', reject);
  });
}

function safeHex(value, fallback) {
  const v = String(value || '').replace('#','').trim();
  return /^[0-9a-f]{6}$/i.test(v) ? v : fallback;
}

function buildColorIni(t) {
  return `[Customify]
text               = ${safeHex(t.text, 'f5f5f5')}
subtext            = ${safeHex(t.subtext, 'a7a7ad')}
main               = ${safeHex(t.background, '090a0c')}
main-elevated      = ${safeHex(t.panel, '13151a')}
highlight          = ${safeHex(t.panelHover, '1c1f25')}
highlight-elevated = ${safeHex(t.panelHover, '1c1f25')}
sidebar            = ${safeHex(t.background, '090a0c')}
player             = ${safeHex(t.panel, '13151a')}
card               = ${safeHex(t.panel, '13151a')}
shadow             = 000000
selected-row       = ${safeHex(t.panelHover, '1c1f25')}
button             = ${safeHex(t.accent, '1ed760')}
button-active      = ${safeHex(t.accent, '1ed760')}
button-disabled    = 53545a
tab-active         = ${safeHex(t.accent, '1ed760')}
notification       = ${safeHex(t.accent, '1ed760')}
notification-error = e5484d
misc               = ${safeHex(t.accent, '1ed760')}
`;
}

function buildUserCss(t, mediaFile) {
  const opacity = Math.max(20, Math.min(100, Number(t.opacity ?? 82))) / 100;
  const blur = Math.max(0, Math.min(60, Number(t.blur ?? 18)));
  const radius = Math.max(0, Math.min(40, Number(t.radius ?? 14)));
  const dim = Math.max(0, Math.min(90, Number(t.dim ?? 42))) / 100;
  const bg = mediaFile ? `url("./${mediaFile}")` : 'none';

  return `:root {
  --customify-accent: #${safeHex(t.accent,'1ed760')};
  --customify-radius: ${radius}px;
  --customify-panel: rgba(${hexRgb(safeHex(t.panel,'13151a'))}, ${opacity});
  --customify-blur: ${blur}px;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -3;
  background-image: ${bg};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -2;
  background: rgba(0,0,0,${dim});
  pointer-events: none;
}

.Root__top-container,
.Root__main-view,
.Root__nav-bar,
.Root__now-playing-bar,
.main-view-container,
.main-view-container__scroll-node,
.main-home-homeHeader,
.main-yourLibraryX-libraryRootlist {
  background-color: transparent !important;
}

.main-view-container,
.Root__nav-bar,
.Root__now-playing-bar,
.main-yourLibraryX-library,
.main-nowPlayingBar-nowPlayingBar {
  backdrop-filter: blur(var(--customify-blur));
  -webkit-backdrop-filter: blur(var(--customify-blur));
}

.main-card-card,
.main-card-cardMetadata,
.main-trackList-trackListRow,
.main-yourLibraryX-listItem,
.main-entityHeader-backgroundColor {
  border-radius: var(--customify-radius) !important;
}

.main-card-card {
  background: var(--customify-panel) !important;
  transition: transform .18s ease, background-color .18s ease;
}
.main-card-card:hover { transform: translateY(-2px); }

button[class*="Button"],
.encore-bright-accent-set {
  border-radius: calc(var(--customify-radius) + 8px) !important;
}

a[href="/search"] input,
input {
  border-radius: 999px !important;
}

.main-playButton-PlayButton,
button[data-testid="play-button"] {
  box-shadow: 0 8px 32px color-mix(in srgb, var(--customify-accent) 30%, transparent);
}

::-webkit-scrollbar { width: 10px; }
::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,.17);
  border: 3px solid transparent;
  background-clip: padding-box;
  border-radius: 999px;
}
`;
}

function hexRgb(hex) {
  const n = parseInt(hex,16);
  return `${(n>>16)&255}, ${(n>>8)&255}, ${n&255}`;
}

ipcMain.handle('status', async () => {
  try {
    const version = await runSpicetify(['-v']);
    return { ok: true, spicetify: true, version };
  } catch (e) {
    return { ok: true, spicetify: false, error: e.message };
  }
});

ipcMain.handle('choose-media', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Images & GIFs', extensions: ['png','jpg','jpeg','webp','gif'] }]
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('open-external', async (_, url) => {
  if (/^https?:\/\//i.test(String(url))) await shell.openExternal(url);
});

ipcMain.handle('apply-theme', async (_, theme) => {
  const appData = process.env.APPDATA;
  if (!appData) return { ok:false, error:'APPDATA could not be found.' };
  const themeDir = path.join(appData, 'spicetify', 'Themes', 'CustomifyStudio');
  await ensureDir(themeDir);

  for (const name of ['background.jpg','background.png','background.webp','background.gif']) {
    await fsp.rm(path.join(themeDir, name), { force:true }).catch(()=>{});
  }

  let mediaFile = '';
  try {
    if (theme.mediaType === 'local' && theme.media) {
      const ext = mediaExtension(theme.media);
      mediaFile = 'background' + ext;
      await fsp.copyFile(theme.media, path.join(themeDir, mediaFile));
    } else if (theme.media) {
      const dl = await download(theme.media, path.join(themeDir, 'background'));
      mediaFile = dl.filename;
    }
  } catch (e) {
    return { ok:false, error:'Could not load the selected background: ' + e.message };
  }

  await fsp.writeFile(path.join(themeDir, 'color.ini'), buildColorIni(theme), 'utf8');
  await fsp.writeFile(path.join(themeDir, 'user.css'), buildUserCss(theme, mediaFile), 'utf8');

  try {
    await runSpicetify(['config', 'current_theme', 'CustomifyStudio']);
    await runSpicetify(['config', 'color_scheme', 'Customify']);
    await runSpicetify(['apply']);
    return { ok:true, themeDir };
  } catch (e) {
    return { ok:false, error:'Theme files were created, but Spicetify could not apply them. ' + e.message, themeDir };
  }
});

ipcMain.handle('restore', async () => {
  try {
    await runSpicetify(['restore']);
    return { ok:true };
  } catch (e) {
    return { ok:false, error:e.message };
  }
});

ipcMain.handle('save-theme-file', async (_, theme) => {
  const out = await dialog.showSaveDialog(mainWindow, {
    defaultPath: (theme.name || 'customify-theme').replace(/[^a-z0-9-_ ]/gi,'') + '.json',
    filters: [{ name:'Customify theme', extensions:['json'] }]
  });
  if (out.canceled || !out.filePath) return { canceled:true };
  await fsp.writeFile(out.filePath, JSON.stringify(theme, null, 2), 'utf8');
  return { ok:true };
});

ipcMain.handle('load-theme-file', async () => {
  const selected = await dialog.showOpenDialog(mainWindow, {
    properties:['openFile'],
    filters:[{ name:'Customify theme', extensions:['json'] }]
  });
  if (selected.canceled) return null;
  try {
    return JSON.parse(await fsp.readFile(selected.filePaths[0], 'utf8'));
  } catch {
    return { error:'That file is not a valid Customify theme.' };
  }
});
