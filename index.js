const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const packageJson = require('./package.json');
const { updateElectronApp } = require('update-electron-app');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const { spawn } = require('child_process');
const fs = require('fs');
const extract = require('extract-zip'); // библиотека для распаковки zip архивов

const src = path.join(__dirname, 'app-update.yml');
const dest = path.join(__dirname, '..', 'app-update.yml');

const src_1 = path.join(__dirname, 'elevate.exe');
const dest_1 = path.join(__dirname, '..', 'elevate.exe');

// Задание переменных среды для тестирования
process.env.REPO_OWNER = 'AsQqqq';
process.env.REPO_NAME = 'server-list-play-better';

// Настройка логирования
log.transports.file.resolvePath = () => path.join(__dirname, 'log.txt'); 
log.transports.file.level = 'debug';
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
log.transports.console.level = 'debug';
log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';

// Логирование событий
function logEvent(message) {
    console.log(message);
    log.info(message);
}

// runElevated(path.join(dest_1), ['--app', path.join(__dirname, 'index.js')], (code) => {
//     if (code !== 0) {
//         logEvent(`Elevate failed with exit code: ${code}`);
//     } else {
//         logEvent('Elevate succeeded');
//     }
// });

fs.copyFile(src_1, dest_1, (err) => {
  if (err) {
    logEvent('Error copying elevate.exe:', err);
  } else {
    logEvent('elevate.exe successfully copied to', dest_1);
  }
});
fs.copyFile(src, dest, (err) => {
  if (err) {
    logEvent('Error copying app-update.yml:', err);
  } else {
    logEvent('app-update.yml successfully copied to', dest);
  }
});


function started_copy_program() {
    // Путь к вашему bat файлу
    const batFilePath = path.join(__dirname, 'script.bat');

    // Параметры для запуска bat файла
    const options = {
    detached: true,
    stdio: 'ignore'
    };

    // Запуск bat файла
    const bat = spawn('cmd.exe', ['/c', batFilePath], options);

    // Отсоединяем дочерний процесс от родительского
    bat.unref();

    logEvent('Bat файл запущен и работает независимо от Node.js скрипта');
}


// Проверка, установлены ли переменные среды
if (!process.env.REPO_OWNER || !process.env.REPO_NAME) {
    log.error('REPO_OWNER или REPO_NAME переменные среды не установлены.');
    app.quit();
}

// Установка URL для обновлений
const server = 'https://update.electronjs.org';
const feed = `${server}/${process.env.REPO_OWNER}/${process.env.REPO_NAME}/${process.platform}-${process.arch}/${app.getVersion()}`;
log.info(`URL для обновлений: ${feed}`);

// Установка NODE_ENV по умолчанию
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
}
logEvent(`NODE_ENV: ${process.env.NODE_ENV}`);


// Настройка автообновления
if (process.env.NODE_ENV === 'production') {
    updateElectronApp({
        repo: `${process.env.REPO_OWNER}/${process.env.REPO_NAME}`,
        updateInterval: '5 minutes',
        logger: log
    });
} else {
    logEvent('Программа в режиме разработки; пропуск проверки обновлений.');
}

// Обработка ошибок автообновления
autoUpdater.on('error', (error) => {
    logEvent(`Ошибка обновления: ${error}`);
});

// Обработка события доступности обновления
autoUpdater.on('update-available', (info) => {
    logEvent(`Доступно обновление: версия ${info.version}`);
});

autoUpdater.on('update-downloaded', async (info) => {
    logEvent(`Обновление загружено: версия ${info.version}`);
    await unpackAndUpdate();
    app.quit();
});

// Просто функция для распаковки zip файла
async function unpackAndUpdate() {
    logEvent('Начинается распаковка архива...');
    const userHomeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    const zipPath = path.join(userHomeDir, 'AppData', 'Local', 'slpb', 'pending', 'slpb-win32-x64.zip');
    const tempDir = path.join(__dirname, '../../temp');

    try {
        // Создание новой директории temp, если она не существует
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
            logEvent(`Создана директория ${tempDir}`);
        }

        // Распаковка архива в директорию temp
        logEvent(`Начинается распаковка архива ${zipPath} в ${tempDir}`);
        await extract(zipPath, { dir: tempDir });
        logEvent(`Распаковка успешно завершена в директорию ${tempDir}`);
        started_copy_program();
    } catch (err) {
        logEvent(`Ошибка распаковки архива: ${err}`);
    }
}

// Создание главного окна приложения
function createWindow() {
    logEvent('Создание главного окна приложения');
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
        logEvent('Главное окно загружено');
        win.webContents.send('app-info', {
            version: packageJson.version,
            server_version: packageJson.server_version,
            date: packageJson.date
        });
    });

    ipcMain.on('minimize-window', () => {
        logEvent('Окно свернуто');
        win.minimize();
    });

    ipcMain.on('maximize-window', () => {
        if (!win.isMaximized()) {
            logEvent('Окно развернуто');
            win.maximize();
        } else {
            logEvent('Окно свернуто с развернутого состояния');
            win.unmaximize();
        }
    });

    ipcMain.on('get-state-window', (event) => {
        logEvent('Запрос состояния окна');
        event.returnValue = {
            isMaximized: win.isMaximized()
        };
    });

    ipcMain.on('close-window', () => {
        logEvent('Окно закрыто');
        win.close();
    });

    logEvent('Загрузка страницы дизайна');
    win.loadFile('design/index.html');
}

app.whenReady().then(() => {
    logEvent('Приложение готово, создание окна');
    createWindow();

    // Инициализация автообновления
    autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        logEvent('Все окна закрыты, выход из приложения');
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        logEvent('Приложение активировано, создание нового окна');
        createWindow();
    }
});