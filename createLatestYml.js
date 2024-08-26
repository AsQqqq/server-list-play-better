// createLatestYml.js
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const owner = 'AsQqqq';
const repo = 'server-list-play-better';

// Получение версии из переменной окружения или из аргумента командной строки
const version = process.env.VERSION || process.argv[2];

if (!version) {
  console.error('Version is not specified.');
  process.exit(1);
}

const options = {
  hostname: 'api.github.com',
  path: `/repos/${owner}/${repo}/releases/tags/${version}`,
  method: 'GET',
  headers: {
    'User-Agent': 'Node.js script',
    'Accept': 'application/vnd.github.v3+json'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', async () => {
    if (res.statusCode !== 200) {
      console.error(`Failed to get release info, status code: ${res.statusCode}`);
      console.error(data); // Логируем ответ для диагностики
      return;
    }

    const release = JSON.parse(data);

    if (!release || !release.assets) {
      console.error('No assets found in the specified release.');
      return;
    }

    const asset = release.assets.find(asset => asset.name.endsWith('.exe'));

    if (!asset) {
      console.error('No executable asset found in the release.');
      return;
    }

    const ymlData = {
      version: release.tag_name,
      path: `https://github.com/${owner}/${repo}/releases/download/${version}/${asset.name}`,
      sha512: await hash(asset.url)
    };

    fs.writeFileSync(
      path.join(__dirname, 'latest.yml'),
      `version: ${ymlData.version}\npath: ${ymlData.path}\nsha512: ${ymlData.sha512}\n`,
      'utf8'
    );

    console.log('latest.yml created successfully.');
  });
});

req.on('error', (e) => {
  console.error(`Error making request: ${e.message}`);
});

req.end();

async function hash(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Node.js script',
        'Accept': 'application/octet-stream'
      }
    }, (res) => {
      const hash = crypto.createHash('sha512');
      res.on('data', chunk => hash.update(chunk));
      res.on('end', () => resolve(hash.digest('hex')));
      res.on('error', reject);
    }).on('error', reject);
  });
}