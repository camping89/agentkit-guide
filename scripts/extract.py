"""Trích metadata AgentKit đã cài (~/.claude) thành data/*.json cho website."""
import json, re, pathlib, subprocess, datetime
HOME = pathlib.Path.home() / '.claude'
OUT = pathlib.Path(__file__).resolve().parent.parent / 'data'

def frontmatter(text):
    m = re.match(r'^---\n(.*?)\n---\n(.*)$', text, re.S)
    if not m: return {}, text
    fm, body = {}, m.group(2)
    key = None
    for line in m.group(1).splitlines():
        km = re.match(r'^([A-Za-z_][\w-]*):\s*(.*)$', line)
        if km:
            key, val = km.group(1), km.group(2).strip()
            fm[key] = '' if val in ('>', '>-', '|', '|-') else (val.strip('"\'') if val else '')
        elif key and line.startswith('  '):
            fm[key] = (fm[key] + ('\n' if key == 'metadata' else ' ') + line.strip()) if fm[key] else (line if key == 'metadata' else line.strip())
    return fm, body

def listval(s):
    s = (s or '').strip()
    if s.startswith('['): return [x.strip().strip('"\'') for x in s[1:-1].split(',') if x.strip()]
    return []

skills = []
for f in sorted((HOME / 'skills').glob('*/SKILL.md')):
    text = f.read_text(errors='ignore')
    fm, body = frontmatter(text)
    meta = fm.get('metadata', '')
    follows = re.search(r'follows:\s*\[(.*?)\]', meta)
    precedes = re.search(r'precedes:\s*\[(.*?)\]', meta)
    version = re.search(r'version:\s*"?([\w.\-]+)', meta)
    author = re.search(r'author:\s*(\S+)', meta)
    hint = fm.get('argument-hint', '')
    flags = sorted(set(re.findall(r'--[a-z][a-z0-9-]*', hint)))
    headings = re.findall(r'^##\s+(.+)$', body, re.M)
    refs = sorted(p.name for p in (f.parent / 'references').glob('*.md')) if (f.parent / 'references').is_dir() else []
    scripts = sorted(p.name for p in (f.parent / 'scripts').iterdir()) if (f.parent / 'scripts').is_dir() else []
    skills.append({
        'id': f.parent.name, 'name': fm.get('name', f.parent.name),
        'description': fm.get('description', ''), 'whenToUse': fm.get('when_to_use', ''),
        'category': fm.get('category', ''), 'keywords': listval(fm.get('keywords')),
        'argumentHint': hint, 'flags': flags, 'userInvocable': fm.get('user-invocable', '') == 'true',
        'modelInvocable': fm.get('disable-model-invocation', '') != 'true',
        'version': version.group(1) if version else '', 'author': author.group(1) if author else '',
        'follows': [x.strip() for x in follows.group(1).split(',') if x.strip()] if follows else [],
        'precedes': [x.strip() for x in precedes.group(1).split(',') if x.strip()] if precedes else [],
        'sections': headings, 'references': refs, 'scripts': scripts,
        'lines': text.count('\n'),
    })

agents = []
for f in sorted((HOME / 'agents').glob('*.md')):
    fm, body = frontmatter(f.read_text(errors='ignore'))
    agents.append({'id': f.stem, 'name': fm.get('name', f.stem),
                   'description': re.sub(r'<example>.*?</example>', '', fm.get('description', ''), flags=re.S).strip()[:600],
                   'model': fm.get('model', ''), 'tools': fm.get('tools', ''),
                   'memory': fm.get('memory', '')})

hooks = []
hj = json.loads((HOME / 'hooks/hooks.json').read_text())['hooks']
for ev, arr in hj.items():
    for m in arr:
        for h in m['hooks']:
            script = (h.get('args') or [h.get('command')])[-1].split('/')[-1]
            src = HOME / 'hooks' / script
            doc = ''
            if src.exists():
                head = src.read_text(errors='ignore')[:2500]
                c = re.search(r'/\*\*?(.*?)\*/', head, re.S)
                doc = re.sub(r'^\s*\* ?', '', c.group(1), flags=re.M).strip()[:700] if c else ''
            hooks.append({'event': ev, 'matcher': m.get('matcher'), 'script': script, 'doc': doc})

rules = [{'id': f.stem, 'text': f.read_text()} for f in sorted((HOME / 'rules').glob('*.md'))]

def relations():
    """Cạnh skill→skill, skill→agent, agent→agent, agent→skill, hook→skill tìm thấy trong source kit.
    Mỗi cạnh ghi nơi xuất hiện (core = SKILL.md, ref = references/) và flag của skill nguồn nằm cùng dòng."""
    skill_ids = {s['id'] for s in skills}
    agent_ids = {a['id'] for a in agents}
    alt = '|'.join(sorted(agent_ids | {'Explore'}, key=len, reverse=True))
    agent_pats = [re.compile(p % alt) for p in (
        r'subagent_type\s*[=:]\s*["\']?(%s)\b', r'`(%s)`', r'Task\(\s*["\']?(%s)\b',
        r'\b(%s)\s+(?:agent|subagent)s?\b')]
    # Tên agent có gạch nối không trùng từ thường, nên nhận cả khi viết trơn.
    plain = re.compile(r'(?<![\w/-])(%s)(?![\w-])' % '|'.join(sorted((a for a in agent_ids if '-' in a), key=len, reverse=True)))
    skill_pats = [re.compile(r'\bak[:](\w[\w-]*)'), re.compile(r'the (?:engineer|installed) ([a-z0-9-]+) skill')]
    edges = {}
    def add(src, kind, dst, where, flags):
        e = edges.setdefault((src, kind, dst), {'from': src, 'kind': kind, 'to': dst, 'where': set(), 'flags': set(), 'n': 0})
        e['where'].add(where); e['flags'].update(flags); e['n'] += 1
    def scan(src, text, where, own_flags, want_agents=True):
        for line in text.splitlines():
            flags = [f for f in re.findall(r'--[a-z][a-z0-9-]*', line) if f in own_flags]
            for p in skill_pats:
                for m in p.findall(line):
                    dst = 'ak-' + m.rstrip('-')
                    if dst in skill_ids and dst != src:
                        add(src, 'skill', dst, where, flags)
            if want_agents:
                found = {m for p in agent_pats + [plain] for m in p.findall(line)}
                for m in found:
                    add(src, 'agent', 'explore' if m == 'Explore' else m, where, flags)
    for s in skills:
        if not s['id'].startswith('ak-'):
            continue
        d = HOME / 'skills' / s['id']
        own = set(s['flags'])
        scan(s['id'], (d / 'SKILL.md').read_text(errors='ignore'), 'core', own)
        for f in sorted(d.glob('references/**/*.md')):
            scan(s['id'], f.read_text(errors='ignore'), 'ref', own)
    for a in agents:
        text = (HOME / 'agents' / f"{a['id']}.md").read_text(errors='ignore')
        for m in re.findall(r'Task\(([\w-]+)\)', a['tools']):
            add(a['id'], 'agent', m.lower(), 'tools', [])
        scan(a['id'], text, 'core', set(), want_agents=False)
    for h in {h['script'] for h in hooks}:
        src = HOME / 'hooks' / h
        if src.exists():
            scan(h, src.read_text(errors='ignore'), 'core', set(), want_agents=False)
    out = []
    for e in edges.values():
        if e['from'] == e['to']:
            continue
        out.append({**e, 'where': sorted(e['where']), 'flags': sorted(e['flags'])})
    return sorted(out, key=lambda e: (e['from'], e['kind'], e['to']))
def ak_meta():
    """Phiên bản ak CLI và Engineer Kit đang cài, cùng thời điểm trích dữ liệu."""
    meta = {'extractedAt': datetime.datetime.now().astimezone().isoformat(timespec='minutes')}
    try:
        v = json.loads(subprocess.run(['ak', 'versions', '--json', '--local-only'], capture_output=True, text=True, timeout=30).stdout)
        b = v['data']['binary']
        meta.update(akVersion=b.get('version', ''), akBuildDate=b.get('date', '')[:10])
    except Exception:
        pass
    manifest = pathlib.Path.home() / '.agentkit/adapters/claude-code/engineer/.agentkit/install-manifest.json'
    if manifest.exists():
        meta['engineerKitVersion'] = json.loads(manifest.read_text()).get('kit_version', '')
    return meta

OUT.mkdir(exist_ok=True)
(OUT / 'meta.json').write_text(json.dumps(ak_meta(), ensure_ascii=False, indent=1))
for n, d in [('skills', skills), ('agents', agents), ('hooks', hooks), ('rules', rules), ('relations', relations())]:
    (OUT / f'{n}.json').write_text(json.dumps(d, ensure_ascii=False, indent=1))
print(len(skills), 'skills', len(agents), 'agents', len(hooks), 'hooks', len(rules), 'rules')
