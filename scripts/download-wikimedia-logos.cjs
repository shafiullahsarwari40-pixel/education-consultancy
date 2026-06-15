const fs = require('fs');
const path = require('path');
const https = require('https');

const logos = [
  {
    slug: 'adiyaman-university',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Ad%C4%B1yaman_University_logo.svg/250px-Ad%C4%B1yaman_University_logo.svg.png',
    dest: 'public/images/universities/adiyaman-university.png',
  },
  {
    slug: 'ankara-yildirim-beyazit-university',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Ankara_Y%C4%B1ld%C4%B1r%C4%B1m_Beyaz%C4%B1t_University_logo.svg',
    dest: 'public/images/universities/ankara-yildirim-beyazit-university.svg',
  },
  {
    slug: 'burdur-mehmet-akif-ersoy-university',
    url: 'https://upload.wikimedia.org/wikipedia/en/6/63/Mehmet_akif_ersoy_university_logo.png',
    dest: 'public/images/universities/burdur-mehmet-akif-ersoy-university.png',
  },
  {
    slug: 'kirikkale-university',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/K%C4%B1r%C4%B1kkale-%C3%9Cniversitesi-Logo.svg',
    dest: 'public/images/universities/kirikkale-university.svg',
  },
  {
    slug: 'duzce-university',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/29/D%C3%BCzce_University_logo.svg',
    dest: 'public/images/universities/duzce-university.svg',
  },
  {
    slug: 'zonguldak-bulent-ecevit-university',
    url: 'https://upload.wikimedia.org/wikipedia/en/9/96/Zonguldak_B%C3%BClent_Ecevit_University_Logo.png',
    dest: 'public/images/universities/zonguldak-bulent-ecevit-university.png',
  },
  {
    slug: 'kastamonu-university',
    url: 'https://upload.wikimedia.org/wikipedia/tr/3/37/Kastamonu_%C3%9Cniversitesi_logosu.jpg',
    dest: 'public/images/universities/kastamonu-university.jpg',
  },
  {
    slug: 'usak-university',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/U%C5%9Fak_University_logo.svg',
    dest: 'public/images/universities/usak-university.svg',
  },
  {
    slug: 'izmir-katip-celebi-university',
    url: 'https://upload.wikimedia.org/wikipedia/tr/thumb/0/05/%C4%B0zmir_K%C3%A2tip_%C3%87elebi_%C3%9Cniversitesi_logosu.png/250px-%C4%B0zmir_K%C3%A2tip_%C3%87elebi_%C3%9Cniversitesi_logosu.png',
    dest: 'public/images/universities/izmir-katip-celebi-university.png',
  },
  {
    slug: 'mersin-university',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Mersin_University_logo.svg',
    dest: 'public/images/universities/mersin-university.svg',
  },
  {
    slug: 'ondokuz-mayis-university',
    url: 'https://upload.wikimedia.org/wikipedia/d/d7/OM%C3%9C_%C4%B0ngilizce_Logo.png',
    dest: 'public/images/universities/ondokuz-mayis-university.png',
  },
  {
    slug: 'anadolu-university',
    url: 'https://upload.wikimedia.org/wikipedia/en/b/b8/Anadolu_University_logo.svg',
    dest: 'public/images/universities/anadolu-university.svg',
  },
];

const ensureDir = (dest) => {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const opts = new URL(url);
    const req = https.get({
      hostname: opts.hostname,
      path: opts.pathname + opts.search,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Referer: 'https://wikipedia.org',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.destroy();
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`${res.statusCode} ${res.statusMessage}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    req.on('error', (err) => {
      fs.unlinkSync(dest, { force: true });
      reject(err);
    });
  });
};

(async () => {
  for (const logo of logos) {
    try {
      ensureDir(logo.dest);
      await download(logo.url, logo.dest);
      console.log('Saved', logo.dest);
    } catch (err) {
      console.error('Failed', logo.slug, err.message);
    }
  }
})();
