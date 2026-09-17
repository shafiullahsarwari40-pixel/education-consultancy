import { universities } from '../lib/universities';

export default function sitemap() {
  return [
    { url: 'https://horizoneducon.com', changeFrequency: 'weekly', priority: 1 },
    { url: 'https://horizoneducon.com/universities', changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://horizoneducon.com/guide', changeFrequency: 'monthly', priority: 0.8 },
    ...universities.map(({ slug }) => ({ url: `https://horizoneducon.com/universities/${slug}`, changeFrequency: 'monthly', priority: 0.7 })),
    { url: 'https://horizoneducon.com/apply', changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://horizoneducon.com/privacy', changeFrequency: 'yearly', priority: 0.2 },
    { url: 'https://horizoneducon.com/terms', changeFrequency: 'yearly', priority: 0.2 },
  ];
}
