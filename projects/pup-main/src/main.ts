import { join } from 'path';
import { format } from 'url';
import { app, BrowserWindow, session, WebContents, webContents } from 'electron';

app.commandLine.appendSwitch('remote-debugging-port', '9444');

app.commandLine.appendSwitch('remote-debugging-address', '127.0.0.1');

app.commandLine.appendSwitch('enable-features', 'NetworkService');


function createWindow(path: string) {
  const url = format({
    pathname: path,
    protocol: 'file:',
    slashes: true,
  });
  let win: BrowserWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
      sandbox: false,
      enableRemoteModule: true,
      webSecurity: false,
      contextIsolation: false
    },
  });
  win.loadURL(url);
  win.on('closed', () => {
    win = null;
  });
  return win;
}

app.on('ready', async () => {
  createWindow(join(__dirname, 'renderers', 'pup-renderer', 'index.html'));
});

app.on('window-all-closed', () => {
  app.quit();
});
