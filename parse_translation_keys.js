const fs = require('fs');
const path = require('path');
const root = path.resolve('.');
const keyPattern = /(?:^|[^A-Za-z0-9_$])t\(\s*['"]([\w\.]+)['"]\s*\)/g;
const usedKeys = new Set();

function walk(dir) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === 'node_modules' || name.name.startsWith('.')) continue;
      walk(full);
      continue;
    }
    if (!full.endsWith('.js')) continue;
    const text = fs.readFileSync(full, 'utf8');
    let m;
    while ((m = keyPattern.exec(text)) !== null) {
      usedKeys.add(m[1]);
    }
  }
}
walk(root);
const translationsText = fs.readFileSync(path.join(root, 'lib', 'translations.js'), 'utf8');
let translations;
(function() {
  const exportReplaced = translationsText.replace(/^export const translations =/, 'translations =');
  eval(exportReplaced);
})();
if (!translations || typeof translations !== 'object') {
  throw new Error('Failed to load translations object');
}
const enKeys = new Set();
function collect(obj, prefix = '') {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      collect(v, key);
    } else {
      enKeys.add(key);
    }
  }
}
collect(translations.en);
const missing = [...usedKeys].filter(k => !enKeys.has(k)).sort();
console.log('usedKeysCount', usedKeys.size);
console.log('missingInEnglishCount', missing.length);
if (missing.length) {
  console.log('missingInEnglish:');
  console.log(missing.join('\n'));
}
const output = { usedKeys:[...usedKeys].sort(), missing };
fs.writeFileSync(path.join(root, 'translation_key_report.json'), JSON.stringify(output, null, 2));
console.log('report written to translation_key_report.json');
