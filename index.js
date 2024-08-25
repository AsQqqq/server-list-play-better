const path = require('path');
const url = require('url');
const { app, BrowserWindow, ipcMain } = require('electron');
const packageJson = require('./package.json');
const { updateElectronApp } = require('update-electron-app');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Настройка логов
const logPath = path.join(__dirname, 'log.txt');
log.transports.file.resolvePath = () => logPath;
log.transports.file.level = 'debug';
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';

log.transports.console.level = 'debug';
log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';

const server = 'https://update.electronjs.org';
const feed = `${server}/${process.env.REPO_OWNER}/${process.env.REPO_NAME}/${process.platform}-${process.arch}/${app.getVersion()}`;

log.info(`Logging to file: ${logPath}`);

function logEvent(message) {
    console.log(message);
    log.info(message);
}

logEvent(`Feed url: ${feed}`);

if (process.env.NODE_ENV === undefined) {
    process.env.NODE_ENV = 'production';
}
logEvent(`NODE_ENV: ${process.env.NODE_ENV}`);

if (process.env.NODE_ENV === 'production') {
    updateElectronApp({
        repo: 'AsQqqq/server-list-play-better',
        updateInterval: '1 hour',
        logger: log
    });
} else {
    logEvent('App is in development mode; skipping update checks.');
}

autoUpdater.on('update-available', (info) => {
    logEvent(`Update available: version ${info.version}`);
});

autoUpdater.on('update-downloaded', (info) => {
    logEvent('Update downloaded, installing...');
    autoUpdater.quitAndInstall();
});

function createWindow() {
    logEvent('Creating main application window');
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        minHeight: 400,
        minWidth: 720,
        title: 'CS2 Server List',
        frame: false,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            devTools: true
        }
    });

    win.webContents.on('did-finish-load', () => {
        logEvent('Main window loaded');
        win.webContents.send('app-info', {
            version: packageJson.version,
            server_version: packageJson.server_version,
            date: packageJson.date
        });
    });

    ipcMain.on('minimize-window', () => {
        logEvent('Window minimized');
        win.minimize();
    });

    ipcMain.on('maximize-window', () => {
        if (!win.isMaximized()) {
            logEvent('Window maximized');
            win.maximize();
        } else {
            logEvent('Window unmaximized from maximized state');
            win.unmaximize();
        }
    });

    ipcMain.on('get-state-window', (event) => {
        logEvent('Window state request');
        event.returnValue = {
            isMaximized: win.isMaximized()
        };
    });

    ipcMain.on('close-window', () => {
        logEvent('Window closed');
        win.close();
    });

    logEvent('Loading design page');
    win.loadFile('design/index.html');
}

app.whenReady().then(() => {
    logEvent('App ready, creating window');
    createWindow();

    // Инициализация автообновления здесь
    autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        logEvent('All windows closed, quitting app');
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        logEvent('App activated, creating new window');
        createWindow();
    }
});