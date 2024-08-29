const { shell, ipcRenderer } = require('electron');

const configData = require('../config/config.json');

function readPBFromConfig() {
    console.log(configData.pb);
    if (configData.pb == "true") {
      // Значение config.pb истинно (true), выполняем блок кода
      console.log('Значение config.pb истинно');
      return true;
    } else {
      // Значение config.pb ложно (false), выполняем блок кода
      console.log('Значение config.pb ложно');
      return false;
    }
  }

let currentServers = new Map();

function fetchAndUpdateContent(url) {
    const loadingElement = document.getElementById('loading');
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const contentElement = document.getElementById('content');
            const emptyListExists = document.querySelector('.empty-list') !== null;

            if (Object.entries(data).length === 0) {
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
            
            let bpb = readPBFromConfig();
            if (bpb == true) {
                serverBlock.innerHTML = `
                    <div class="image" style="background-image: 
                        linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(0, 0, 0, 0.986) 80%),
                        url('${imageUrl}');"></div>
                    <div class="people title-text">${serverInfo.now_players}/${serverInfo.max_players}</div>
                    <div class="play">
                        <div class="play-icon" data-connect-server="${serverInfo.connect_server}">
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
                        <div class="play-icon" data-connect-server="${serverInfo.connect_server}">
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
        url = "http://212.67.11.92/api/v0.1/getinfoserverslocal";
    } else {
        url = "http://212.67.11.92/api/v0.1/getinfoservers";
    }
    fetchAndUpdateContent(url);
    setInterval(() => fetchAndUpdateContent(url), 15000);
});