const { ipcRenderer } = require('electron');

const minimizeButton = document.querySelector('.btn-min');
const maximizeButton = document.querySelector('.btn-max');
const closeButton = document.querySelector('.btn-close');

minimizeButton.addEventListener('click', () => {
    ipcRenderer.send('minimize-window');
});
maximizeButton.addEventListener('click', () => {
    ipcRenderer.send('get-state-window')
    ipcRenderer.on('get-state-window', (event, arg) => {
        const { isMaximized } = event.returnValue
            console.log(isMaximized)
    });
    
    ipcRenderer.send('maximize-window');
});
closeButton.addEventListener('click', () => {
    ipcRenderer.send('close-window');
});

ipcRenderer.on('app-info', (event, appInfo) => {
    document.getElementById('version').innerText = appInfo.version;
    document.getElementById('server_version').innerText = appInfo.server_version;
    document.getElementById('date').innerText = appInfo.date;
});


ipcRenderer.on('update-available', (event) => {
    document.getElementsByClassName('updateUP')[0].style.opacity = "100%";
});


async function loadGitHubVersion() {
    try {
        const response = await fetch('https://api.github.com/repos/AsQqqq/server-list-play-better/contents/package.json');
        const data = await response.json();
        
        // Декодирование base64 содержимого
        const content = atob(data.content);
        const packageJson = JSON.parse(content);
        
        const githubVersion = packageJson.version;

        document.getElementById('github_version').innerText = githubVersion;
    } catch (error) {
        console.error('Ошибка при получении версии с GitHub:', error);
    }
}

loadGitHubVersion();