const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

// Пример: создаем dummy файл блокмапа
const blockmapFile = path.join(distDir, 'slpb.blockmap');

const blockmapContent = { /* данные блокмапа */ };
fs.writeFileSync(blockmapFile, JSON.stringify(blockmapContent, null, 2));
console.log("Blockmap создан успешно в директории dist.");