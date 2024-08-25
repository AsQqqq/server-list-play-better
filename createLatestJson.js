const fs = require('fs');

const data = {
  version: '0.1.9-beta',
  description: 'Список серверов Counter Strike 2',
  date: new Date().toISOString(),
};

fs.writeFileSync('dist/latest.json', JSON.stringify(data, null, 2));
console.log('latest.json file has been created');