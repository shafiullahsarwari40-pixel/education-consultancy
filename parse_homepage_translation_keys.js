const fs = require('fs');
const path = require('path');
const root = path.resolve('.');
const files = [
  'components/Navbar.js',
  'components/Hero.js',
  'components/About.js',
  'components/WhyTurkey.js',
  'components/WhyChooseHorizon.js',
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
  'components/WhatsAppButton.js'
];
const keyPattern = /t\(\s*['\"]([\w\.]+)['\"]\s*\)/g;
const keys = new Set();
for (const file of files) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  let m;
  while ((m = keyPattern.exec(content)) !== null) {
    keys.add(m[1]);
  }
}
const tx = fs.readFileSync(path.join(root,'lib','translations.js'),'utf8');
let translations;
eval(tx.replace(/^export const translations =/, 'translations ='));
const enKeys = new Set();
function collect(obj,prefix=''){
  for(const [k,v] of Object.entries(obj)){
    const key = prefix?`${prefix}.${k}`:k;
    if(v && typeof v==='object' && !Array.isArray(v)) collect(v,key);
    else enKeys.add(key);
  }
}
collect(translations.en);
const missing = [...keys].filter(k=>!enKeys.has(k)).sort();
console.log('homepageKeysCount', keys.size);
console.log('missingFromEnglishCount', missing.length);
console.log(missing.join('\n'));
fs.writeFileSync(path.join(root,'homepage_translation_report.json'), JSON.stringify({ homepageKeys:[...keys].sort(), missing }, null, 2));
