const fs = require('fs');
const path = require('path');
const root = process.cwd();
const files = [
  'components/Navbar.js',
  'components/Hero.js',
  'components/About.js',
  'components/WhyChooseHorizon.js',
  'components/Testimonials.js',
  'components/WhyTurkey.js',
  'components/Services.js',
  'components/SocialProof.js',
  'components/Universities.js',
  'components/Programs.js',
  'components/ApplicationProcessTimeline.js',
  'components/StudentDashboard.js',
  'components/FAQSection.js',
  'components/AgentPartnership.js',
  'components/Contact.js',
  'components/FollowHorizon.js',
  'components/Footer.js',
  'components/WhatsAppButton.js',
];
function collectKeys() {
  const regex = /t\(['"`]([^'"`]+?)['"`]\)/g;
  const keys = new Set();
  for (const file of files) {
    const content = fs.readFileSync(path.join(root, file), 'utf8');
    let m;
    while ((m = regex.exec(content))) {
      keys.add(m[1]);
    }
  }
  return [...keys].sort();
}
function parseTranslations() {
  const content = fs.readFileSync(path.join(root, 'lib', 'translations.js'), 'utf8');
  const start = content.indexOf('export const translations = {');
  if (start === -1) throw new Error('start not found');
  let i = content.indexOf('{', start);
  let depth = 0;
  let end = -1;
  for (; i < content.length; i++) {
    const ch = content[i];
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth === 0) { end = i; break; }
  }
  if (end === -1) throw new Error('end not found');
  const objText = content.slice(content.indexOf('{', start), end + 1);
  const translations = eval('(' + objText + ')');
  return translations;
}
function collectPaths(obj, prefix = '') {
  const keys = [];
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const pathKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectPaths(v, pathKey));
    } else {
      keys.push(pathKey);
    }
  }
  return keys;
}
const usedKeys = collectKeys();
const translations = parseTranslations();
const frKeys = new Set(collectPaths(translations.fr || {}));
const missingKeys = usedKeys.filter((key) => !frKeys.has(key));
console.log(missingKeys.length);
console.log(missingKeys.join('\n'));
