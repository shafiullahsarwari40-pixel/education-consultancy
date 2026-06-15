const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const logos = [
  {
    dest: 'public/images/universities/duzce-university.svg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/29/D%C3%BCzce_University_logo.svg',
  },
  {
    dest: 'public/images/universities/zonguldak-bulent-ecevit-university.png',
    url: 'https://upload.wikimedia.org/wikipedia/en/9/96/Zonguldak_B%C3%BClent_Ecevit_University_Logo.png',
  },
  {
    dest: 'public/images/universities/kastamonu-university.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/tr/3/37/Kastamonu_%C3%9Cniversitesi_logosu.jpg',
  },
  {
    dest: 'public/images/universities/usak-university.png',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/U%C5%9Fak_University_logo.svg/250px-U%C5%9Fak_University_logo.svg.png',
  },
  {
    dest: 'public/images/universities/izmir-katip-celebi-university.png',
    url: 'https://upload.wikimedia.org/wikipedia/tr/thumb/0/05/%C4%B0zmir_K%C3%A2tip_%C3%87elebi_%C3%9Cniversitesi_logosu.png/250px-%C4%B0zmir_K%C3%A2tip_%C3%87elebi_%C3%9Cniversitesi_logosu.png',
  },
  {
    dest: 'public/images/universities/ondokuz-mayis-university.png',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/OM%C3%9C_%C4%B0ngilizce_Logo.png',
  },
  {
    dest: 'public/images/universities/anadolu-university.svg',
    url: 'https://upload.wikimedia.org/wikipedia/en/b/b8/Anadolu_University_logo.svg',
  },
  {
    dest: 'public/images/universities/mersin-university.svg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Mersin_University_logo.svg',
  },
];

const ensureDir = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https:') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        Referer: 'https://wikipedia.org',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.destroy();
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest, { force: true });
        return reject(new Error(`${res.statusCode} ${res.statusMessage}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
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
    const destPath = path.join(process.cwd(), logo.dest);
    ensureDir(destPath);
    try {
      console.log(`Downloading ${logo.url} -> ${logo.dest}`);
      await download(logo.url, destPath);
      const size = fs.statSync(destPath).size;
      console.log(`Saved ${logo.dest} (${size} bytes)`);
    } catch (err) {
      console.error(`Failed ${logo.dest}:`, err.message);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
})();
