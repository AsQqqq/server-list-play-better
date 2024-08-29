const fs = require('fs');
const path = require('path');

const dist = JSON.parse(fs.readFileSync('server_dist.json', 'utf8'));
const temp = JSON.parse(fs.readFileSync('server_temp.json', 'utf8'));

const distKeys = new Set(Object.keys(dist));
const tempKeys = new Set(Object.keys(temp));
const commonKeys = new Set([...distKeys].filter(x => tempKeys.has(x)));

// Удаление параметра если он есть и в temp и в dist
for (let key of commonKeys) {
    delete temp[key];
}

// Удаление параметра если его нет в temp, но есть в dist
for (let key of distKeys) {
    if (!tempKeys.has(key)) {
        delete dist[key];
    }
}

Object.assign(dist, temp);

// Сохранение обновленного dist в файл server_dist.json
fs.writeFileSync('server_dist.json', JSON.stringify(dist, null, 4));
