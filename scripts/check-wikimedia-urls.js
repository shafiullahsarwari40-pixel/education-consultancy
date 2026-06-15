const https = require('https');
const urls = [
  {
    name: 'Anadolu SVG',
    url: 'https://upload.wikimedia.org/wikipedia/en/b/b8/Anadolu_University_logo.svg',
  },
  {
    name: 'Anadolu thumb PNG',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Anadolu_University_logo.svg/250px-Anadolu_University_logo.svg.png',
  },
  {
    name: 'Izmir thumb PNG',
    url: 'https://upload.wikimedia.org/wikipedia/tr/thumb/0/05/%C4%B0zmir_K%C3%A2tip_%C3%87elebi_%C3%9Cniversitesi_logosu.png/250px-%C4%B0zmir_K%C3%A2tip_%C3%87elebi_%C3%9Cniversitesi_logosu.png',
  },
  {
    name: 'Izmir direct PNG',
    url: 'https://upload.wikimedia.org/wikipedia/tr/0/05/%C4%B0zmir_K%C3%A2tip_%C3%87elebi_%C3%9Cniversitesi_logosu.png',
  },
  {
    name: 'Ondokuz direct PNG',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/OM%C3%9C_%C4%B0ngilizce_Logo.png',
  },
  {
    name: 'Duzce SVG',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/29/D%C3%BCzce_University_logo.svg',
  },
  {
    name: 'Mersin SVG',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Mersin_University_logo.svg',
  },
];
function check(url) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        Referer: 'https://wikipedia.org',
      },
    }, (res) => {
      resolve({ status: res.statusCode, headers: res.headers, url });
    });
    req.on('error', (err) => resolve({ status: 'ERR', error: err.message, url }));
    req.end();
  });
}
(async () => {
  for (const item of urls) {
    const result = await check(item.url);
    console.log(item.name, result.status, result.headers && result.headers['content-type']);
  }
})();
