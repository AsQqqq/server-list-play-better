const { ipcRenderer } = require('electron');

const minimizeButton = document.querySelector('.btn-min');
const maximizeButton = document.querySelector('.btn-max');
const closeButton = document.querySelector('.btn-close');

let iconBtnMax = maximizeButton.children[0];

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