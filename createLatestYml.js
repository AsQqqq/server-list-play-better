// createLatestYml.js
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const owner = 'AsQqqq';
const repo = 'server-list-play-better';

// Изменение здесь: Получение версии из окружения или первым аргументом командной строки
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
      return;
    }

    const release = JSON.parse(data);
    
    if (!release || !release.assets) {
      console.error('No assets found in the specified release.');
      return;
    }

    const asset = release.assets.find(asset => asset.name.endsWith('.zip'));
    if (!asset) {
      console.error('No .zip asset found in the specified release.');
      return;
    }

    const url = asset.browser_download_url;

    const hash = await getSha512Hash(url);

    const latestYmlContent = `
version: ${version}
path: ${url}
sha512: ${hash}`;

    const distPath = path.join(__dirname, 'dist');
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath);
    }

    fs.writeFileSync(path.join(distPath, 'latest.yml'), latestYmlContent);
    console.log('latest.yml created successfully!');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();

function getSha512Hash(fileUrl) {
  return new Promise((resolve, reject) => {
    https.get(fileUrl, (res) => {
      const hash = crypto.createHash('sha512');
      res.on('data', (chunk) => {
        hash.update(chunk);
      });
      res.on('end', () => {
        resolve(hash.digest('hex'));
      });
    }).on('error', (e) => {
      reject(`Failed to download or hash file: ${e.message}`);
    });
  });
}