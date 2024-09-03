const { shell, ipcRenderer } = require('electron');
const configData = require('../config/config.json');


function readPBFromConfig() {
    return configData.pb === "true";
};

let currentServers = new Map();

function fetchAndUpdateContent(url) {
    const loadingElement = document.getElementById('loading');
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const contentElement = document.getElementById('content');
            const emptyListExists = document.querySelector('.empty-list') !== null;

            if (Object.entries(data).length === 0) {
                const errorMessageElement = document.getElementsByClassName('error-message');
                try {
                    if (errorMessage) {
                        errorMessage.remove();
                        console.log('Элемент найден и удалён');
                    } else {
                        console.log('Элемент не найден');
                    }
                } catch (error) {
                    console.error('Произошла ошибка:', error);
                }
                const emptyMessageElement = document.getElementsByClassName('empty-server-list');
                try {
                    if (errorMessage) {
                        emptyMessageElement.remove();
                        console.log('Элемент найден и удалён');
                    } else {
                        console.log('Элемент не найден');
                    }
                } catch (error) {
                    console.error('Произошла ошибка:', error);
                }
                if (loadingElement) {
                    loadingElement.classList.add('hidden');
                }
                console.log('Список серверов пуст');
                if (!emptyListExists) {
                    const emptyBlock = document.createElement('div');
                    document.getElementById('content').innerHTML = ``;
                    emptyBlock.className = 'empty-server-list';
                    emptyBlock.innerHTML = `
                        <div class="empty-list">
                            <img src="../image/icon/empty.png" alt="Empty server" class="image-empty" draggable="false">
                            <div class="refresh-instruction title-text">CTRL + R</div>
                        </div>
                    `;
                    contentElement.appendChild(emptyBlock);
                }
            } else {
                // Если данные серверов не пустые, убираем элемент с пустым списком, если он есть
                if (emptyListExists) {
                    const emptyBlock = document.querySelector('.empty-list').parentNode;
                    if (emptyBlock) {
                        emptyBlock.remove();
                    }
                }

                // Скрываем элемент загрузки после успешной загрузки данных
                if (loadingElement) {
                    loadingElement.classList.add('hidden');
                }

                // Обновление карточек серверов
                updateServerCards(currentServers, data, contentElement);
            }

            const playIcons = document.querySelectorAll('.play-icon');
            playIcons.forEach(icon => {
                icon.addEventListener('click', function() {
                    const connectServer = this.getAttribute('data-connect-server');
                    join_to_server(connectServer);
                });
            });
        })
        .catch(error => {
            console.error('Ошибка:', error);
            document.getElementById('content').innerHTML = `
            <div class="error-message">
                <div class="error-code title-text">404</div>
                <div class="refresh-instruction title-text">CTRL + R</div>
            </div>
            `;
        });
}

function updateServerCards(currentServers, data, contentElement) {
    const newServers = new Map(Object.entries(data));
    const serversToRemove = [];

    // Поиск серверов для удаления
    currentServers.forEach((value, key) => {
        if (!newServers.has(key)) {
            serversToRemove.push(key);
        }
    });

    // Удаление старых серверов
    serversToRemove.forEach(port => {
        const blockToRemove = document.querySelector(`.block[data-port="${port}"]`);
        if (blockToRemove) {
            blockToRemove.classList.remove('visible');
            blockToRemove.classList.add('invisible');
            setTimeout(() => blockToRemove.remove(), 300);
            currentServers.delete(port);
        }
    });

    // Добавление новых и обновление существующих серверов
    newServers.forEach((serverInfo, port) => {
        const existingBlock = document.querySelector(`.block[data-port="${port}"]`);

        const pingMs = String(Math.floor(parseFloat(serverInfo.ping) * 1000));

        let pingClass = '';
        if (parseInt(pingMs) > 80) {
            pingClass = 'ping-red';
        } else if (parseInt(pingMs) > 50) {
            pingClass = 'ping-yellow';
        } else {
            pingClass = 'ping-green';
        }

        if (existingBlock) {
            // Обновление существующего блока сервера
            const pingElement = existingBlock.querySelector('.ping');
            const peopleElement = existingBlock.querySelector('.people');

            if (pingElement) {
                pingElement.textContent = pingMs;
                pingElement.className = `ping title-text ${pingClass}`;
            }

            if (peopleElement) {
                peopleElement.textContent = `${serverInfo.now_players}/${serverInfo.max_players}`;
            }
        } else {
            // Добавление нового блока сервера
            const serverBlock = document.createElement('div');
            serverBlock.className = 'block invisible';
            serverBlock.setAttribute('data-port', port);

            const imageUrl = `../image/${serverInfo.map}.png`;

            const errorMessage = document.querySelector('.error-message');
            try {
                if (errorMessage) {
                    errorMessage.remove();
                    console.log('Элемент найден и удалён');
                } else {
                    console.log('Элемент не найден');
                }
            } catch (error) {
                console.error('Произошла ошибка:', error);
            }


            
            let bpb = readPBFromConfig();
            const regex = /^steam:\/\/connect\/([\d\.]+):(\d+)$/;
            const match = serverInfo.connect_server.match(regex);
            const ip_server = match[1];
            const port_server = match[2];
            console.log(ip_server);
            console.log(port_server);
            if (bpb == true) {
                serverBlock.innerHTML = `
                    <div class="image" style="background-image: 
                        linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(0, 0, 0, 0.986) 80%),
                        url('${imageUrl}');"></div>
                    <div class="people title-text">${serverInfo.now_players}/${serverInfo.max_players}</div>
                    <div class="play">
                        <div class="play-icon" data-connect-server="${serverInfo.connect_server}" onclick="sendrecordlocal('${ip_server}', '${port_server}')">
                            <img src="../image/icon/play-icon.png" alt="Play-icon" draggable="false">
                        </div>
                        <div class="circle-icon">
                            <img src="../image/icon/circle.png" alt="circle-icon" draggable="false">
                        </div>
                    </div>
                    <div class="server_name title-text">${serverInfo.server_name}</div>
                    <div class="map title-text">${serverInfo.map}</div>
                `;
            } else {
                serverBlock.innerHTML = `
                    <div class="image" style="background-image: 
                        linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(0, 0, 0, 0.986) 80%),
                        url('${imageUrl}');"></div>
                    <div class="ping title-text ${pingClass}">${pingMs}</div>
                    <div class="people title-text">${serverInfo.now_players}/${serverInfo.max_players}</div>
                    <div class="play">
                        <div class="play-icon" data-connect-server="${serverInfo.connect_server}" onclick="sendrecordglobal('${ip_server}', '${port_server}')">
                            <img src="../image/icon/play-icon.png" alt="Play-icon" draggable="false">
                        </div>
                        <div class="circle-icon">
                            <img src="../image/icon/circle.png" alt="circle-icon" draggable="false">
                        </div>
                    </div>
                    <div class="server_name title-text">${serverInfo.server_name}</div>
                    <div class="map title-text">${serverInfo.map}</div>
                `;

            }
            contentElement.appendChild(serverBlock);

            setTimeout(() => {
                serverBlock.classList.remove('invisible');
                serverBlock.classList.add('visible');
            }, 50);

            currentServers.set(port, serverInfo);
        }
    });
}

function join_to_server(connectServer) {
    shell.openExternal(connectServer);
}

const iconButton = document.querySelector('.icon-image');
iconButton.addEventListener('click', () => {
    get_admin();
});

function get_admin() {
    shell.openExternal("https://t.me/danilka_pikaso");
}

function addReloadButtonListener() {
    const reloadButton = document.querySelector('.refresh-instruction');
    if (reloadButton) {
        reloadButton.addEventListener('click', () => {
            location.reload();
        });
    }
}

const observer = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            addReloadButtonListener();
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });

addReloadButtonListener();

document.addEventListener("DOMContentLoaded", function() {
    let bpb = readPBFromConfig();
    let url
    if (bpb == true) {
        url = `http://${configData.addres}/api/v0.1/getinfoserverslocal`;
    } else {
        url = `http://${configData.addres}/api/v0.1/getinfoserversglobal`;
    }
    fetchAndUpdateContent(url);
    setInterval(() => fetchAndUpdateContent(url), 15000);
});


document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('networkModeToggle');

    // Инициализация состояния слайдера
    toggle.checked = readPBFromConfig();

    // Обработка события переключения слайдера
    toggle.addEventListener('change', function () {
        const newValue = toggle.checked;
        const saveButton = document.querySelector('.save');
        saveButton.classList.toggle('active');
        saveButton.setAttribute('data-new-value', newValue);
    });

    // Обработка события нажатия на кнопку "Сохранить"
    document.querySelector('.save').addEventListener('click', function () {
        if (this.classList.contains('active')) {
            const newConfigValue = this.getAttribute('data-new-value');
            
            // Отправляем новое значение в основной процесс
            ipcRenderer.send('save-config', { pb: newConfigValue });

            // Перезагрузка страницы или другой код
            // location.reload();
        }
    });
});

// Слушаем событие конфигурационного сохранения и перезагружаем страницу
ipcRenderer.on('config-saved', () => {
    location.reload();
});

// Если вам нужно обработать клик на изображении для переключения настроек:
document.querySelector('.setting img').onclick = function() {
    document.querySelector('.settings-menu').classList.toggle('active');
};