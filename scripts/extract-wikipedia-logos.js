const pages = [
  ['Adiyaman University','https://en.wikipedia.org/wiki/Ad%C4%B1yaman_University'],
  ['Ankara Yildirim Beyazit University','https://en.wikipedia.org/wiki/Ankara_Y%C4%B1ld%C4%B1r%C4%B1m_Beyaz%C4%B1t_University'],
  ['Burdur Mehmet Akif Ersoy University','https://en.wikipedia.org/wiki/Burdur_Mehmet_Akif_Ersoy_University'],
  ['Kirikkale University','https://en.wikipedia.org/wiki/K%C4%B1r%C4%B1kkale_University'],
  ['Duzce University','https://en.wikipedia.org/wiki/D%C3%BCzce_University'],
  ['Zonguldak Bulent Ecevit University','https://en.wikipedia.org/wiki/Zonguldak_B%C3%BClent_Ecevit_University'],
  ['Kastamonu University','https://en.wikipedia.org/wiki/Kastamonu_University'],
  ['Usak University','https://en.wikipedia.org/wiki/U%C5%9Fak_University'],
  ['Izmir Katip Celebi University','https://en.wikipedia.org/wiki/%C4%B0zmir_Katip_%C3%87elebi_University'],
  ['Mersin University','https://en.wikipedia.org/wiki/Mersin_University'],
  ['Ondokuz Mayis University','https://en.wikipedia.org/wiki/Ondokuz_May%C4%B1s_University'],
  ['Anadolu University','https://en.wikipedia.org/wiki/Anadolu_University']
];

async function fetchPage(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.text();
}

(async () => {
  for (const [name, url] of pages) {
    try {
      const html = await fetchPage(url);
      const infoboxMatch = html.match(/<table[^>]*class=['"][^'"]*infobox[^'"]*['"][\s\S]*?<\/table>/i);
      const imgs = [];
      if (infoboxMatch) {
        let m;
        const re = /<img[^>]+src=['\"]([^'\"]+)['\"]/gi;
        while ((m = re.exec(infoboxMatch[0])) !== null) imgs.push(m[1]);
      }
      const og = html.match(/<meta property=['\"]og:image['\"] content=['\"]([^'\"]+)['\"]/i);
      console.log('---', name, '---');
      if (imgs.length) imgs.forEach(src => console.log('INFOBOX', src)); else console.log('INFOBOX NONE');
      if (og) console.log('OGIMG', og[1]);
    } catch (err) {
      console.error('ERR', name, err.message);
    }
  }
})();
