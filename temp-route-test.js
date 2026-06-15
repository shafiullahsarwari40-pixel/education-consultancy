const urls = [
  'https://horizoneducon.com/',
  'https://horizoneducon.com/student/signup',
  'https://horizoneducon.com/student/login',
  'https://horizoneducon.com/student/dashboard',
  'https://horizoneducon.com/api/submit',
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
