const fs = require('fs');
const path = require('path');
const https = require('https');

// Замените эти переменные на ваши
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

  res.on('end', () => {
    const release = JSON.parse(data);
    const version = release.tag_name;
    const asset = release.assets.find(asset => asset.name.endsWith('.zip'));
    if (!asset) {
      console.error('No .zip asset found in the latest release.');
      return;
    }
    const url = asset.browser_download_url;

    const latestYmlContent = `
version: ${version}
url: ${url}
`;

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