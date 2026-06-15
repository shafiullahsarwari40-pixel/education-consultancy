const fs = require('fs');
const path = require('path');
const root = path.resolve('.');
const homepageReport = JSON.parse(fs.readFileSync(path.join(root, 'homepage_translation_report.json'), 'utf8'));
const homepageKeys = homepageReport.homepageKeys;
const tx = fs.readFileSync(path.join(root, 'lib', 'translations.js'), 'utf8');
let translations = {};
eval(tx.replace(/^export const translations =/, 'translations ='));
const langs = ['en', 'tr', 'fa', 'ps', 'ar', 'fr', 'ur', 'hi'];
for (const lang of langs) {
  const langKeys = new Set();
  function collect(obj, prefix = '') {
    if (!obj || typeof obj !== 'object') return;
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        collect(v, key);
      } else {
        langKeys.add(key);
      }
    }
  }
  collect(translations[lang]);
  const missing = homepageKeys.filter((k) => !langKeys.has(k));
  console.log(`${lang}: ${missing.length}`);
  if (missing.length) console.log(missing.join('\n'));
  console.log('---');
}
