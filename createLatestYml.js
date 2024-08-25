const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const owner = 'AsQqqq';
const repo = 'server-list-play-better';

const options = {
  hostname: 'api.github.com',
  path: `/repos/${owner}/${repo}/releases/latest`,
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
    const release = JSON.parse(data);
    const version = release.tag_name;
    const asset = release.assets.find(asset => asset.name.endsWith('.zip'));
    if (!asset) {
      console.error('No .zip asset found in the latest release.');
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