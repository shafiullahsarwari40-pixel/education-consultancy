import fs from 'fs';

const pages = [
  {
    name: 'İzmir Katip Çelebi University',
    wikiFilePage: 'https://tr.wikipedia.org/wiki/Dosya:%C4%B0zmir_Katip_%C3%87elebi_%C3%9Cniversitesi_logosu.png',
    localName: 'izmir-katip-celebi-university.png',
  },
  {
    name: 'Kastamonu University',
    wikiFilePage: 'https://tr.wikipedia.org/wiki/Dosya:Kastamonu_%C3%9Cniversitesi_logosu.jpg',
    localName: 'kastamonu-university.jpg',
  },
];

async function fetchPage(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return await res.text();
}

(async () => {
  for (const page of pages) {
    try {
      const html = await fetchPage(page.wikiFilePage);
      const match = html.match(/<a[^>]+href=['\"]([^'\"]+)['\"][^>]*>\s*Original file|Dosya|Original file/i);
      console.log('---', page.name, '---');
      if (match) {
        console.log('link', match[1]);
      } else {
        const urlMatch = html.match(/https:\/\/upload\.wikimedia\.org\/[^"'<>]+/i);
        console.log('urlMatch', urlMatch ? urlMatch[0] : 'NONE');
      }
    } catch (err) {
      console.error('ERR', page.name, err.message);
    }
  }
})();
