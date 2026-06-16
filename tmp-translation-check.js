const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'lib', 'translations.js');
const content = fs.readFileSync(file, 'utf8');
const match = content.match(/export const translations\s*=\s*(\{[\s\S]*\})\s*;\s*$/m);
if (!match) {
  console.error('translations object not found');
  process.exit(1);
}
const translations = eval('(' + match[1] + ')');
function collect(obj, prefix = '') {
  const keys = [];
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collect(v, key));
    } else {
      keys.push(key);
    }
  }
  return keys;
}
const enKeys = collect(translations.en);
const frKeys = new Set(collect(translations.fr || {}));
const missing = enKeys.filter((key) => !frKeys.has(key));
console.log(missing.length);
console.log(missing.join('\n'));
