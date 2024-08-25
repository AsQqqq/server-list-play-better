const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

// Проверьте существование директории, и если её нет, создайте её
if (!fs.existsSync(distDir)){
    fs.mkdirSync(distDir, { recursive: true });
}

const data = { /* ваши данные */ };
const jsonPath = path.join(distDir, 'latest.json');

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
console.log("latest.json создан успешно в директории dist.");