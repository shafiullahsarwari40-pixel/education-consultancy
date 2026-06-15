import fs from 'fs';
import path from 'path';

const logos = [
  {
    slug: 'adiyaman-university',
    src: 'https://upload.wikimedia.org/wikipedia/commons/a/91/Ad%C4%B1yaman_University_logo.svg',
  },
  {
    slug: 'ankara-yildirim-beyazit-university',
    src: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Ankara_Y%C4%B1ld%C4%B1r%C4%B1m_Beyaz%C4%B1t_University_logo.svg',
  },
  {
    slug: 'burdur-mehmet-akif-ersoy-university',
    src: 'https://upload.wikimedia.org/wikipedia/en/6/63/Mehmet_akif_ersoy_university_logo.png',
  },
  {
    slug: 'kirikkale-university',
    src: 'https://upload.wikimedia.org/wikipedia/commons/3/36/K%C4%B1r%C4%B1kkale-%C3%9Cniversitesi-Logo.svg',
  },
  {
    slug: 'duzce-university',
    src: 'https://upload.wikimedia.org/wikipedia/commons/2/29/D%C3%BCzce_University_logo.svg',
  },
  {
    slug: 'zonguldak-bulent-ecevit-university',
    src: 'https://upload.wikimedia.org/wikipedia/en/9/96/Zonguldak_B%C3%BClent_Ecevit_University_Logo.png',
  },
  {
    slug: 'kastamonu-university',
    src: 'https://upload.wikimedia.org/wikipedia/tr/3/37/Kastamonu_%C3%9Cniversitesi_logosu.jpg',
  },
  {
    slug: 'usak-university',
    src: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/U%C5%9Fak_University_logo.svg',
  },
  {
    slug: 'izmir-katip-celebi-university',
    src: 'https://upload.wikimedia.org/wikipedia/tr/0/05/%C4%B0zmir_K%C3%A2tip_%C3%87elebi_%C3%9Cniversitesi_logosu.png',
  },
  {
    slug: 'mersin-university',
    src: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Mersin_University_logo.svg',
  },
  {
    slug: 'ondokuz-mayis-university',
    src: 'https://upload.wikimedia.org/wikipedia/d/d7/OM%C3%9C_%C4%B0ngilizce_Logo.png',
  },
  {
    slug: 'anadolu-university',
    src: 'https://upload.wikimedia.org/wikipedia/en/b/b8/Anadolu_University_logo.svg',
  },
];

const destDir = path.resolve('public', 'images', 'universities');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const getExt = (url, contentType) => {
  const pathname = new URL(url).pathname;
  const fromPath = path.extname(pathname);
  if (fromPath) return fromPath;
  if (contentType) {
    if (contentType.includes('svg')) return '.svg';
    if (contentType.includes('png')) return '.png';
    if (contentType.includes('jpeg')) return '.jpg';
    if (contentType.includes('bmp')) return '.bmp';
  }
  return '.img';
};

const download = async () => {
  for (const logo of logos) {
    try {
      const res = await fetch(logo.src, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const contentType = res.headers.get('content-type') || '';
      const ext = getExt(logo.src, contentType);
      const dest = path.join(destDir, `${logo.slug}${ext}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(`Saved ${logo.slug}${ext}`);
    } catch (err) {
      console.error(`Failed ${logo.slug}:`, err.message);
    }
  }
};

download().catch((err) => {
  console.error(err);
  process.exit(1);
});
