const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'public', 'images', 'universities');
const files = [
  'adiyaman-university.png',
  'adiyaman-university.svg',
  'anadolu-university.svg',
  'ankara-yildirim-beyazit-university.svg',
  'burdur-mehmet-akif-ersoy-university.png',
  'burdur-mehmet-akif-ersoy-university.svg',
  'duzce-university.svg',
  'izmir-katip-celebi-university.png',
  'izmir-katip-celebi-university.svg',
  'kastamonu-university.jpg',
  'kastamonu-university.svg',
  'kirikkale-university.svg',
  'mersin-university.svg',
  'ondokuz-mayis-university.png',
  'ondokuz-mayis-university.svg',
  'usak-university.svg',
  'zonguldak-bulent-ecevit-university.png',
  'zonguldak-bulent-ecevit-university.svg',
];
for (const file of files) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    console.log(file, 'MISSING');
    continue;
  }
  const buffer = fs.readFileSync(filePath);
  const hex = buffer.slice(0, 8).toString('hex');
  const type = hex.startsWith('89504e47') ? 'PNG' : hex.startsWith('ffd8ff') ? 'JPG' : hex.startsWith('3c3f786d') ? 'SVG' : hex.startsWith('504b0304') ? 'ZIP' : 'UNKNOWN';
  console.log(file, buffer.length, type, hex);
}
