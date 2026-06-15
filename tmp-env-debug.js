const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), '.env.local');
console.log('cwd:', process.cwd());
console.log('file:', file);
const content = fs.readFileSync(file, 'utf8');
console.log('--- raw content ---');
console.log(content);
console.log('--- lines ---');
content.split(/\r?\n/).forEach((line, i) => {
  const hex = Buffer.from(line, 'utf8').toString('hex');
  console.log(`${i + 1}: [${hex}] ${line}`);
});
const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
};
console.log('initial env:', JSON.stringify(env, null, 2));
for (const line of content.split(/\r?\n/)) {
  const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)$/);
  console.log('line check:', JSON.stringify(line), 'match:', match ? [match[1].trim(), match[2].trim()] : null);
  if (!match) continue;
  const key = match[1].trim();
  let value = match[2].trim();
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1);
  }
  if (key in env && !env[key]) {
    env[key] = value;
    console.log('set', key, '=>', value);
  }
}
console.log('final env:', JSON.stringify(env, null, 2));
