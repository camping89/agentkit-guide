"""Gộp data/*.json + data/detail/*.json thành site/data.js để site chạy được qua file:// lẫn GitHub Pages."""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
D = ROOT / 'data'
detail = {}
for f in sorted((D / 'detail').glob('*.json')):
    detail.update(json.loads(f.read_text()))
bundle = {n: json.loads((D / f'{n}.json').read_text()) for n in ['skills', 'agents', 'hooks', 'rules', 'groups', 'meta']}
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
for d in detail.values():
    d['related'] = [r for r in d.get('related', []) if r in keep]
    d['agents'] = [a for a in d.get('agents', []) if a.split(' ')[0] not in MARKETING_AGENTS]
bundle['detail'] = detail
# Không publish nguyên văn rules/docstring của kit (nội dung có license); site dùng tóm tắt tự viết.
bundle['rules'] = [{'id': r['id']} for r in bundle['rules']]
for h in bundle['hooks']:
    h['doc'] = ''
(ROOT / 'site' / 'data.js').write_text('window.AK_DATA=' + json.dumps(bundle, ensure_ascii=False) + ';\n')
ak = bundle['skills']
missing = [s['id'] for s in ak if s['id'] not in detail]
print(f"{len(ak)} skills, {len(detail)} detail, missing detail: {missing}")
