import pathlib
import re
from collections import defaultdict

root = pathlib.Path('components')
files = list(root.glob('*.js'))
# also include App files if needed
keys = set()
regex = re.compile(r"t\(['\"]([^'\"]+)['\"]\)")
for path in files:
    text = path.read_text(encoding='utf-8')
    keys.update(regex.findall(text))

# parse translations.fr
trans = pathlib.Path('lib/translations.js').read_text(encoding='utf-8')
# find fr object by first occurrence of 'fr:' at top-level
m = re.search(r"fr\s*:\s*\{", trans)
if not m:
    raise SystemExit('fr not found')
start = m.end()
brace = 1
obj = ''
for c in trans[start:]:
    if c == '{':
        brace += 1
    elif c == '}':
        brace -= 1
        if brace == 0:
            break
    obj += c

fr_keys = set()
prefix = []
for line in obj.splitlines():
    stripped = line.strip()
    if not stripped or stripped.startswith('//'):
        continue
    m_obj = re.match(r"([a-zA-Z0-9_]+)\s*:\s*\{", stripped)
    if m_obj:
        prefix.append(m_obj.group(1))
        continue
    if stripped.startswith('}'): 
        if prefix:
            prefix.pop()
        continue
    m_k = re.match(r"([a-zA-Z0-9_]+)\s*:\s*(?:'[^']*'|\"[^\"]*\")\s*,?", stripped)
    if m_k:
        key = '.'.join(prefix + [m_k.group(1)])
        fr_keys.add(key)

missing = sorted(k for k in keys if k not in fr_keys)
print('missing count', len(missing))
print('\n'.join(missing))
