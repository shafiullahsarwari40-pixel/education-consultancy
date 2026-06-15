const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const assets = [
  { slug: 'adiyaman-university', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Ad%C4%B1yaman_University_logo.svg/250px-Ad%C4%B1yaman_University_logo.svg.png' },
  { slug: 'ankara-yildirim-beyazit-university', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Ankara_Y%C4%B1ld%C4%B1r%C4%B1m_Beyaz%C4%B1t_University_logo.svg/250px-Ankara_Y%C4%B1ld%C4%B1r%C4%B1m_Beyaz%C4%B1t_University_logo.svg.png' },
  { slug: 'burdur-mehmet-akif-ersoy-university', url: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/63/Mehmet_akif_ersoy_university_logo.png/250px-Mehmet_akif_ersoy_university_logo.png' },
  { slug: 'kirikkale-university', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/K%C4%B1r%C4%B1kkale-%C3%9Cniversitesi-Logo.svg/250px-K%C4%B1r%C4%B1kkale-%C3%9Cniversitesi-Logo.svg.png' },
  { slug: 'duzce-university', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/D%C3%BCzce_University_logo.svg/250px-D%C3%BCzce_University_logo.svg.png' },
  { slug: 'zonguldak-bulent-ecevit-university', url: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/96/Zonguldak_B%C3%BClent_Ecevit_University_Logo.png/250px-Zonguldak_B%C3%BClent_Ecevit_University_Logo.png' },
  { slug: 'kastamonu-university', url: 'https://www.kastamonu.edu.tr/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fkastamonu_logo_m_en.468ae362.png&w=750&q=75' },
  { slug: 'usak-university', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/U%C5%9Fak_University_logo.svg/250px-U%C5%9Fak_University_logo.svg.png' },
  { slug: 'izmir-katip-celebi-university', url: 'https://ikcu.edu.tr/Images/logos/ikclogo_transparent.png' },
  { slug: 'mersin-university', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Mersin_University_logo.svg/250px-Mersin_University_logo.svg.png' },
  { slug: 'ondokuz-mayis-university', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/OM%C3%9C_%C4%B0ngilizce_Logo.png/250px-OM%C3%9C_%C4%B0ngilizce_Logo.png' },
  { slug: 'anadolu-university', url: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/Anadolu_University_logo.svg/250px-Anadolu_University_logo.svg.png' },
];

const dir = path.join(__dirname, 'public', 'images', 'universities');
fs.mkdirSync(dir, { recursive: true });

function getAgent(url) {
  return url.startsWith('https://') ? https : http;
}

function download(url, dest, redirects = 0) {
  return new Promise((resolve, reject) => {
    const lib = getAgent(url);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Referer: 'https://en.wikipedia.org/',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      rejectUnauthorized: false,
    };
    lib.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects < 5) {
        return resolve(download(new URL(res.headers.location, url).toString(), dest, redirects + 1));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    }).on('error', reject);
  });
}

(async () => {
  for (const asset of assets) {
    const ext = asset.url.split('.').pop().split('?')[0] || 'png';
    const dest = path.join(dir, `${asset.slug}.${ext}`);
    try {
      await download(asset.url, dest);
      console.log('saved', dest);
    } catch (err) {
      console.error('error', asset.slug, err.message);
    }
  }
})();
