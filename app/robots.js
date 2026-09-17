export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin', '/student/', '/auth/', '/route-test/'],
    },
    sitemap: 'https://horizoneducon.com/sitemap.xml',
    host: 'https://horizoneducon.com',
  };
}
