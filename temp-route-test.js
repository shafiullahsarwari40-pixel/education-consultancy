const urls = [
  'http://localhost:3000/',
  'http://localhost:3000/student/signup',
  'http://localhost:3000/student/login',
  'http://localhost:3000/student/dashboard',
  'http://localhost:3000/api/submit',
];

(async () => {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'GET' });
      console.log(url, res.status, res.statusText);
      if (url.endsWith('/submit')) {
        const text = await res.text();
        console.log('body:', text.slice(0, 250));
      }
    } catch (err) {
      console.error(url, 'ERROR', err.message);
    }
  }
})();
