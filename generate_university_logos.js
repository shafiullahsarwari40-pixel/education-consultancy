const fs = require('fs');
const path = require('path');
const logos = [
  ['adiyaman-university','Adıyaman University'],
  ['ankara-yildirim-beyazit-university','Ankara Yıldırım Beyazıt University'],
  ['burdur-mehmet-akif-ersoy-university','Burdur Mehmet Akif Ersoy University'],
  ['kirikkale-university','Kırıkkale University'],
  ['duzce-university','Düzce University'],
  ['zonguldak-bulent-ecevit-university','Zonguldak Bülent Ecevit University'],
  ['kastamonu-university','Kastamonu University'],
  ['usak-university','Uşak University'],
  ['izmir-katip-celebi-university','İzmir Katip Çelebi University'],
  ['mersin-university','Mersin University'],
  ['ondokuz-mayis-university','Ondokuz Mayıs University'],
  ['anadolu-university','Anadolu University'],
];
const dir = path.join(__dirname, 'public', 'images', 'universities');
fs.mkdirSync(dir, { recursive: true });
for (const [slug, name] of logos) {
  const clean = name.replace(/İ/g, 'I').replace(/Ş/g, 'S').replace(/Ğ/g, 'G').replace(/Ü/g, 'U').replace(/Ö/g, 'O').replace(/Ç/g, 'C').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c');
  const acronym = clean.split(' ').filter(Boolean).map(part => part[0].toUpperCase()).slice(0, 3).join('');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="360" height="120" viewBox="0 0 360 120" fill="none" xmlns="http://www.w3.org/2000/svg">\n  <rect x="0" y="0" width="360" height="120" rx="24" fill="#FFFFFF"/>\n  <rect x="6" y="6" width="348" height="108" rx="20" fill="#F8FAFC" stroke="#E5E7EB" stroke-width="2"/>\n  <text x="180" y="72" text-anchor="middle" dominant-baseline="middle" font-family="Inter, Arial, sans-serif" font-size="36" font-weight="800" fill="#1D4ED8">${acronym}</text>\n</svg>`;
  fs.writeFileSync(path.join(dir, `${slug}.svg`), svg);
  console.log(`created ${slug}.svg`);
}
