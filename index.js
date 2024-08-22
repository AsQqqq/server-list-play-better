const path = require('path');
const url = require('url');
const { app, BrowserWindow, ipcMain } = require('electron');
const { updateElectronApp, UpdateSourceType } = require('update-electron-app')


updateElectronApp({
    updateSource: {
      type: UpdateSourceType.StaticStorage,
      baseUrl: `https://my-bucket.s3.amazonaws.com/my-app-updates/${process.platform}/${process.arch}`
    }
  })


function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        minHeight: 400,
        minWidth: 720,
        title: 'Список серверов CS2',
        frame: false,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });
    // win.webContents.openDevTools();

    ipcMain.on('minimize-window', () => {
        win.minimize();
    });

    ipcMain.on('maximize-window', (event, arg) => {
        if (!win.isMaximized()) {
            win.maximize();
        } else {
            win.unmaximize();
        }
    });

    app.on('ready', () => {
        ipcMain.on('get-state-window', (event, arg) => {
            event.returnValue = {
                isMaximized: win.isMaximized()
            }
        });
    });

    ipcMain.on('close-window', () => {
        win.close();
    });

    // Загрузка страницы загрузки
    win.loadFile('design/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});