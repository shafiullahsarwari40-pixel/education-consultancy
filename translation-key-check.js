const fs = require('fs');
const path = require('path');
const root = process.cwd();
const exts = new Set(['.js', '.jsx', '.ts', '.tsx']);
function walk(dir) {
  let res = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (['node_modules', '.next', 'public', '.git'].includes(name)) continue;
      res = res.concat(walk(p));
    } else if (exts.has(path.extname(name))) {
      res.push(p);
    }
  }
  return res;
}
const files = walk(root);
const regex = /t\(['"`]([^'"`]+?)['"`]\)/g;
const keys = new Set();
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = regex.exec(content)) !== null) {
    keys.add(m[1]);
  }
}
const translations = require('./lib/translations.js').translations;
function flatten(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null && !Array.isArray(v)
      ? flatten(v, prefix ? `${prefix}.${k}` : k)
      : (prefix ? `${prefix}.${k}` : k)
  );
}
const localeKeys = {};
for (const locale of Object.keys(translations)) {
  localeKeys[locale] = new Set(flatten(translations[locale]));
}
const missing = {};
for (const locale of Object.keys(localeKeys)) {
  missing[locale] = [...keys].filter(k => !localeKeys[locale].has(k)).sort();
}
const allKeys = [...keys].sort();
console.log(JSON.stringify({ keys: allKeys, missing }, null, 2));
