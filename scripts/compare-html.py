"""Render the evidence-backed CoKit vs AgentKit report (markdown) into one standalone HTML file."""
import pathlib, re, sys, markdown

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'plans/reports/researcher-260926-1442-cokit-vs-agentkit.md'
OUT = ROOT / 'site/cokit-vs-agentkit.html'

md = SRC.read_text()
title = re.search(r'^# (.+)$', md, re.M).group(1)
body = markdown.markdown(re.sub(r'^# .+\n', '', md, count=1), extensions=['tables', 'fenced_code', 'toc'])
# Tag evidence paths so each side's proof is visually distinct.
body = re.sub(r'<code>(CK:[^<]*)</code>', r'<code class="ck">\1</code>', body)
body = re.sub(r'<code>((?:AK:|\$CACHE)[^<]*)</code>', r'<code class="ak">\1</code>', body)
# The comparison table is the one with 6 columns; mark it for wide layout.
body = body.replace('<table>\n<thead>\n<tr>\n<th>#</th>', '<table class="cmp">\n<thead>\n<tr>\n<th>#</th>', 1)

OUT.parent.mkdir(exist_ok=True)
OUT.write_text(f'''<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%237c9cff'/><text x='16' y='22' font-size='14' text-anchor='middle' font-family='sans-serif' font-weight='700' fill='%230e1117'>vs</text></svg>">
<style>
:root {{ --bg:#0e1117; --panel:#161b22; --line:#2a3242; --text:#e6edf3; --muted:#8b96a8; --accent:#7c9cff; --ck:#f5b454; --ak:#3ddc97; --code:#0b0f15; }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; background: var(--bg); color: var(--text); font: 15px/1.6 "Inter","Segoe UI",system-ui,sans-serif; }}
main {{ max-width: 1500px; margin: 0 auto; padding: 32px 28px 80px; }}
h1 {{ font-size: 2rem; margin: 0 0 .3em; letter-spacing: -.02em; }}
h2 {{ font-size: 1.35rem; margin: 2em 0 .6em; padding-bottom: .3em; border-bottom: 1px solid var(--line); }}
h3 {{ font-size: 1.08rem; margin: 1.4em 0 .5em; }}
a {{ color: var(--accent); }}
code {{ font: .84em "JetBrains Mono","Fira Code",ui-monospace,monospace; background: var(--code); border: 1px solid var(--line); padding: 1px 5px; border-radius: 5px; color: #c9d7ff; word-break: break-word; }}
code.ck {{ color: var(--ck); border-color: #5a4524; }}
code.ak {{ color: var(--ak); border-color: #1f5a44; }}
pre {{ background: var(--code); border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; overflow-x: auto; }}
pre code {{ border: 0; padding: 0; background: none; color: #d5def0; }}
.legend {{ display: flex; gap: 18px; flex-wrap: wrap; color: var(--muted); font-size: .9em; margin: .4em 0 1.2em; }}
.legend b.ck {{ color: var(--ck); }} .legend b.ak {{ color: var(--ak); }}
.wrap {{ overflow-x: auto; border: 1px solid var(--line); border-radius: 10px; }}
table {{ width: 100%; border-collapse: collapse; font-size: .9em; }}
th, td {{ border: 1px solid var(--line); padding: 8px 10px; text-align: left; vertical-align: top; }}
th {{ background: var(--panel); position: sticky; top: 0; }}
table.cmp {{ min-width: 1200px; }}
table.cmp td:nth-child(3) {{ border-left: 3px solid var(--ck); }}
table.cmp td:nth-child(5) {{ border-left: 3px solid var(--ak); }}
table.cmp td:nth-child(4), table.cmp td:nth-child(6) {{ font-size: .88em; color: #b9c3d3; }}
table.cmp td:nth-child(2) {{ font-weight: 600; white-space: nowrap; }}
tr:nth-child(even) td {{ background: #12171f; }}
li {{ margin: .25em 0; }}
footer {{ margin-top: 3em; color: var(--muted); font-size: .85em; }}
</style></head><body><main>
<h1>{title}</h1>
<div class="legend"><span><b class="ck">CK:</b> file trong repo CoKit (<code>camping89/cokit</code>)</span><span><b class="ak">AK: / $CACHE</b> file của bản AgentKit đã cài</span><span>Mọi dòng đều có dẫn chứng file:dòng hoặc output lệnh.</span></div>
{body.replace('<table class="cmp">', '<div class="wrap"><table class="cmp">').replace('</table>', '</table></div>', 1) if '<table class="cmp">' in body else body}
<footer>Sinh từ <code>{SRC.relative_to(ROOT)}</code> bằng <code>scripts/compare-html.py</code>. Xem thêm <a href="https://camping89.github.io/agentkit-guide/">AgentKit Guide</a>.</footer>
</main></body></html>
''')
print('wrote', OUT.relative_to(ROOT))
