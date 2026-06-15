const fs = require('fs');
const path = require('path');
const https = require('https');

const logos = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/en/b/b8/Anadolu_University_logo.svg',
    dest: path.join(__dirname, '..', 'public', 'images', 'universities', 'anadolu-university.svg'),
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/tr/thumb/0/05/%C4%B0zmir_K%C3%A2tip_%C3%87elebi_%C3%9Cniversitesi_logosu.png/250px-%C4%B0zmir_K%C3%A2tip_%C3%87elebi_%C3%9Cniversitesi_logosu.png',
    dest: path.join(__dirname, '..', 'public', 'images', 'universities', 'izmir-katip-celebi-university.png'),
  },
];

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        Referer: 'https://wikipedia.org',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.destroy();
        return resolve(download(res.headers.location, dest));
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest, { force: true });
        return reject(new Error(`${res.statusCode} ${res.statusMessage}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
    });
    req.on('error', (err) => {
      file.close();
      fs.unlinkSync(dest, { force: true });
      reject(err);
    });
  });
};

(async () => {
  for (const logo of logos) {
    try {
      console.log('Downloading', logo.url);
      await download(logo.url, logo.dest);
      const size = fs.statSync(logo.dest).size;
      console.log('Saved', logo.dest, size, 'bytes');
    } catch (error) {
      console.error('Failed to download', logo.url, error.message);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
})();
