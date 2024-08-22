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