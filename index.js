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
    // Путь к вашему vbs файлу
    const vbsFilePath = path.join(__dirname, 'run_bat.vbs');
    logEvent(`Путь к vbs файлу: ${vbsFilePath}`);

    // Параметры для запуска vbs файла
    const options = {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: true
    };

    // Запуск vbs файла
    const vbs = spawn('cscript', ['//Nologo', vbsFilePath], options);

    vbs.stdout.on('data', (data) => {
        logEvent(`stdout: ${data}`);
    });

    vbs.stderr.on('data', (data) => {
        logEvent(`stderr: ${data}`);
    });

    vbs.on('error', (err) => {
        logEvent('Ошибка при запуске vbs файла:', err);
    });

    vbs.on('exit', (code) => {
        logEvent(`Vbs файл завершил работу с кодом ${code}`);
    });

    vbs.unref();
    logEvent('Vbs файл запущен');
    app.quit();
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


let mainWindow;
const gotTheLock = app.requestSingleInstanceLock();


if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Фокусируем главное окно, если оно уже открыто
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

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

        const sourceBatPath = path.join(tempDir, 'resources', 'app', 'script.bat');
        const batTo = path.join(__dirname, '../../resources/app');
        const destBatPath = path.join(batTo, 'script.bat');
        
        try {
            await fs.copyFile(sourceBatPath, destBatPath);
            logEvent(`Файл script.bat успешно скопирован в ${batTo}`);
        } catch (err) {
            logEvent(`Ошибка при копировании script.bat: ${err}`);
        }
        
        const distConfigPath = path.join(__dirname, 'config', 'config.json');
        const distConfig = JSON.parse(fs.readFileSync(distConfigPath, 'utf8'));
        const tempConfigPath = path.join(tempDir, 'resources', 'app', 'config', 'config.json');
        const tempConfig = JSON.parse(fs.readFileSync(tempConfigPath, 'utf8'));

        const distKeys = new Set(Object.keys(distConfig));
        const tempKeys = new Set(Object.keys(tempConfig));
        const commonKeys = new Set([...distKeys].filter(x => tempKeys.has(x)));

        // Удаление параметра если он есть и в temp и в dist
        for (let key of commonKeys) {
            delete tempConfig[key];
        }

        // Удаление параметра если его нет в temp, но есть в dist
        for (let key of distKeys) {
            if (!tempKeys.has(key)) {
                delete distConfig[key];
            }
        }

        Object.assign(distConfig, tempConfig);
        fs.writeFileSync(distConfigPath, JSON.stringify(distConfig, null, 4));

        fs.unlink(tempConfigPath, (err) => {
        if (err) {
            console.error('Ошибка при удалении файла:', err);
            return;
        }
        console.log('Файл успешно удален');
        });

        started_copy_program();
    } catch (err) {
        logEvent(`Ошибка распаковки архива: ${err}`);
    }
}

// Создание главного окна приложения
function createWindow() {
    logEvent('Создание главного окна приложения');
    mainWindow = new BrowserWindow({
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
            devTools: false
        }
    });

    mainWindow.webContents.on('did-finish-load', () => {
        logEvent('Главное окно загружено');
        mainWindow.webContents.send('app-info', {
            version: packageJson.version,
            server_version: packageJson.server_version,
            date: packageJson.date
        });
    });

    ipcMain.on('minimize-window', () => {
        logEvent('Окно свернуто');
        mainWindow.minimize();
    });

    ipcMain.on('maximize-window', () => {
        if (!mainWindow.isMaximized()) {
            logEvent('Окно развернуто');
            mainWindow.maximize();
        } else {
            logEvent('Окно свернуто с развернутого состояния');
            mainWindow.unmaximize();
        }
    });

    ipcMain.on('get-state-window', (event) => {
        logEvent('Запрос состояния окна');
        event.returnValue = {
            isMaximized: mainWindow.isMaximized()
        };
    });

    ipcMain.on('close-window', () => {
        logEvent('Окно закрыто');
        mainWindow.close();
    });

    logEvent('Загрузка страницы дизайна');
    mainWindow.loadFile('design/index.html');
}


// Обработка ошибок автообновления
autoUpdater.on('error', (error) => {
    logEvent(`Ошибка обновления: ${error}`);
});

// Обработка события доступности обновления
autoUpdater.on('update-available', (info) => {
    logEvent(`Доступно обновление: версия ${info.version}`);
    logEvent('Отправка уведомления о доступности обновления');
    logEvent('Увдомление отправлено');
    mainWindow.webContents.send('update-available');
});


autoUpdater.on('update-downloaded', async (info) => {
    logEvent(`Обновление загружено: версия ${info.version}`);
    await unpackAndUpdate();
    app.quit();
});



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