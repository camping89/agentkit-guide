"""Gộp data/*.json + data/detail/*.json thành site/data.js để site chạy được qua file:// lẫn GitHub Pages."""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
D = ROOT / 'data'
def load_detail(folder):
    out = {}
    for f in sorted((D / folder).glob('*.json')):
        out.update(json.loads(f.read_text()))
    return out

detail = load_detail('detail')
detail_en = load_detail('detail-en')
bundle = {n: json.loads((D / f'{n}.json').read_text()) for n in ['skills', 'agents', 'hooks', 'rules', 'groups', 'meta', 'relations']}
# Site chỉ phủ Engineer Kit: bỏ nhóm marketing, agent marketing và skill riêng ngoài AgentKit.
MARKETING_AGENTS = {'analytics-analyst', 'attraction-specialist', 'campaign-debugger', 'campaign-manager',
                    'community-manager', 'content-creator', 'content-reviewer', 'continuity-specialist',
                    'copywriter', 'email-wizard', 'funnel-architect', 'lead-qualifier', 'sale-enabler',
                    'seo-specialist', 'social-media-manager', 'upsell-maximizer'}
bundle['groups'] = [g for g in bundle['groups'] if g['kit'] != 'marketing']
keep = {'ak-' + k for g in bundle['groups'] for k in g['skills']}
bundle['skills'] = [s for s in bundle['skills'] if s['id'] in keep]
bundle['agents'] = [a for a in bundle['agents'] if a['id'] not in MARKETING_AGENTS]
detail = {k: v for k, v in detail.items() if k in keep}
detail_en = {k: v for k, v in detail_en.items() if k in keep}
for d in [*detail.values(), *detail_en.values()]:
    d['related'] = [r for r in d.get('related', []) if r in keep]
    d['agents'] = [a for a in d.get('agents', []) if a.split(' ')[0] not in MARKETING_AGENTS]
bundle['detail'] = {'vi': detail, 'en': detail_en}
# Quan hệ chỉ giữ đầu mút thuộc Engineer: skill đã giữ, agent không phải marketing, hook script.
nodes = keep | {a['id'] for a in bundle['agents']} | {h['script'] for h in bundle['hooks']}
bundle['relations'] = [{k: e[k] for k in ('from', 'kind', 'to', 'where', 'flags')}
                       for e in bundle['relations'] if e['from'] in nodes and e['to'] in nodes]
# Không publish nguyên văn rules/docstring của kit (nội dung có license); site dùng tóm tắt tự viết.
bundle['rules'] = [{'id': r['id']} for r in bundle['rules']]
for h in bundle['hooks']:
    h['doc'] = ''
(ROOT / 'site' / 'data.js').write_text('window.AK_DATA=' + json.dumps(bundle, ensure_ascii=False) + ';\n')

# Cache-busting: gắn ?v=<hash nội dung> cho asset để trình duyệt không dùng lại JS/CSS cũ sau mỗi lần deploy.
import hashlib, re
index = ROOT / 'site' / 'index.html'
html = index.read_text()
for asset in ['styles.css', 'data.js', 'content-en.js', 'content-vi.js', 'relations.js', 'app.js']:
    digest = hashlib.sha256((ROOT / 'site' / asset).read_bytes()).hexdigest()[:10]
    html = re.sub(r'(["\'])' + re.escape(asset) + r'(\?v=[0-9a-f]+)?\1', lambda m: f'{m.group(1)}{asset}?v={digest}{m.group(1)}', html)
index.write_text(html)
ak = bundle['skills']
missing = [s['id'] for s in ak if s['id'] not in detail]
missing_en = [s['id'] for s in ak if s['id'] not in detail_en]
print(f"{len(bundle['relations'])} relations, {len(ak)} skills, {len(detail)} vi / {len(detail_en)} en detail, missing vi: {missing}, missing en: {len(missing_en)}")
