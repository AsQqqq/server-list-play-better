const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const filePath = path.join(distDir, 'your-app.exe'); // Укажите нужный файл

function generateChecksum(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => {
      hash.update(data);
    });
    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
    stream.on('error', err => reject(err));
  });
}

generateChecksum(filePath).then(checksum => {
  const checksumFile = path.join(distDir, 'your-app.sha256');
  fs.writeFileSync(checksumFile, checksum);
  console.log('Checksum создан успешно:', checksum);
}).catch(err => {
  console.error('Ошибка создания checksum:', err);
});