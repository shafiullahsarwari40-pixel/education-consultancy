// Read-only smoke crawl of the university directory on a local running server.
// Usage: node scripts/smoke-universities.mjs http://localhost:3001
import { universities } from '../lib/universities.js';

const base = new URL(process.argv[2] || 'http://localhost:3001');
if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)) {
  throw new Error('This smoke check only accepts a local server.');
}
const origin = base.origin;
const brand = 'Horizon Educational Consultancy';
const safeProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const cache = new Map();
const failures = [];

function decode(value) {
  const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (entity, code) => {
    if (code.startsWith('#x')) return String.fromCodePoint(parseInt(code.slice(2), 16));
    if (code.startsWith('#')) return String.fromCodePoint(parseInt(code.slice(1), 10));
    return named[code.toLowerCase()] || entity;
  });
}

function anchors(html) {
  return [...html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi)].map((match) => decode(match[2]));
}

async function readPage(url) {
  const target = new URL(url, origin);
  target.hash = '';
  if (target.origin !== origin) throw new Error('External HTTP requests are outside this smoke check.');
  const key = target.href;
  if (!cache.has(key)) {
    cache.set(key, (async () => {
      let current = key;
      for (let redirects = 0; redirects <= 4; redirects++) {
        const response = await fetch(current, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(15000) });
        if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
          const next = new URL(response.headers.get('location'), current);
          if (next.origin !== origin) throw new Error(`External redirect from ${current}`);
          current = next.href;
          continue;
        }
        return { status: response.status, html: await response.text(), url: current };
      }
      throw new Error(`Too many redirects for ${key}`);
    })());
  }
  return cache.get(key);
}

async function parallel(items, task) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(4, items.length) }, async () => {
    while (next < items.length) await task(items[next++]);
  }));
}

const internal = new Map();
let officialLinksChecked = 0;
let safeLinksChecked = 0;
const profiles = [{ path: '/universities', title: 'Explore Universities in Türkiye' }, ...universities.map((university) => ({
  path: `/universities/${university.slug}`,
  title: `${university.name} | Study in ${university.city}`,
  officialLinks: [university.officialUrl, university.admissionsUrl],
}))];

await parallel(profiles, async (profile) => {
  try {
    const page = await readPage(profile.path);
    const title = decode(page.html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
    if (page.status !== 200) failures.push(`${profile.path}: HTTP ${page.status}`);
    const expectedTitle = `${profile.title} | ${brand}`;
    if (title !== expectedTitle) failures.push(`${profile.path}: unexpected title ${JSON.stringify(title)}`);
    if (title.split(brand).length - 1 !== 1) failures.push(`${profile.path}: brand appears more or less than once`);
    const links = anchors(page.html);
    for (const expected of profile.officialLinks || []) {
      if (!links.includes(expected)) failures.push(`${profile.path}: missing official source ${expected}`);
      else officialLinksChecked++;
      if (new URL(expected).protocol !== 'https:') failures.push(`${profile.path}: official source is not HTTPS`);
    }
    for (const href of links) {
      try {
        const target = new URL(href, page.url);
        if (!safeProtocols.has(target.protocol) || target.username || target.password) {
          failures.push(`${profile.path}: unsafe outgoing link ${JSON.stringify(href)}`);
          continue;
        }
        safeLinksChecked++;
        if (target.origin === origin) internal.set(target.href, target);
      } catch {
        failures.push(`${profile.path}: malformed link ${JSON.stringify(href)}`);
      }
    }
    console.log(`CHECK ${page.status} ${profile.path}`);
  } catch (error) {
    failures.push(`${profile.path}: ${error.message}`);
  }
});

// The directory has a finite set of navigation/application destinations. Stop if
// an unexpected page creates an unbounded link set rather than crawling it.
if (internal.size > 80) {
  failures.push(`Unexpected internal link count: ${internal.size}; internal crawl stopped.`);
} else {
  await parallel([...internal.values()], async (target) => {
    try {
      const page = await readPage(target.href);
      if (page.status !== 200) failures.push(`${target.pathname}${target.search}: HTTP ${page.status}`);
      if (target.hash) {
        const fragment = decodeURIComponent(target.hash.slice(1));
        const ids = [...page.html.matchAll(/\bid\s*=\s*(["'])(.*?)\1/gi)].map((match) => decode(match[2]));
        if (!ids.includes(fragment)) failures.push(`${target.pathname}${target.hash}: missing anchor target`);
      }
    } catch (error) {
      failures.push(`${target.pathname}${target.search}: ${error.message}`);
    }
  });
}

console.log(JSON.stringify({
  origin,
  profiles: universities.length,
  pagesWithCheckedTitles: profiles.length,
  officialLinksChecked,
  renderedLinksWithSafeProtocols: safeLinksChecked,
  internalDestinationsChecked: internal.size,
  uniqueHttpPagesRequested: cache.size,
  failures,
  result: failures.length ? 'FAIL' : 'PASS',
}, null, 2));
if (failures.length) process.exitCode = 1;
