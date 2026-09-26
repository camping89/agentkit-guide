// Relationship diagrams (skill ↔ skill ↔ agent ↔ hook) drawn as plain SVG from D.relations.
window.AK_REL = (ctx) => {
  const { D, esc, cmd, skillById, groupOf, lang } = ctx;
  const T = {
    en: {
      callers: 'Referenced by', skills: 'Hands off to skills', agents: 'Spawns agents', sub: 'Those agents delegate to',
      core: 'in SKILL.md (always loaded)', ref: 'in references/ (loaded when that step runs)', wf: 'workflow order (follows / precedes)',
      tools: 'agent tool grant Task(x)', none: 'No links found in the source.', more: (n) => `+${n} more (see list)`,
      list: 'All links with their source', from: 'From', to: 'To', where: 'Found in', when: 'Only with',
      whereText: { core: 'SKILL.md', ref: 'references/', tools: 'agent tools', wf: 'frontmatter' },
      hint: 'Hover a node to trace its links. Click to open its diagram below.',
      show: 'Show', kSkill: 'skill → skill', kAgent: 'skill → agent', kOther: 'agent / hook links', coreOnly: 'SKILL.md only', hideCat: 'Hide catalog skills',
      pick: 'Click any node above to see its diagram here.', open: 'Open skill page',
      hubs: ['Skill', 'Links out', 'Referenced by'], agentCols: ['Agent', 'Spawned by skills', 'Delegates to'],
    },
    vi: {
      callers: 'Được tham chiếu bởi', skills: 'Chuyển tiếp sang skill', agents: 'Spawn agent', sub: 'Agent đó giao tiếp cho',
      core: 'trong SKILL.md (luôn được nạp)', ref: 'trong references/ (nạp khi tới bước đó)', wf: 'thứ tự workflow (follows / precedes)',
      tools: 'agent được cấp Task(x)', none: 'Không thấy liên kết nào trong source.', more: (n) => `+${n} nữa (xem danh sách)`,
      list: 'Toàn bộ liên kết và nơi tìm thấy', from: 'Từ', to: 'Tới', where: 'Tìm thấy ở', when: 'Chỉ khi có',
      whereText: { core: 'SKILL.md', ref: 'references/', tools: 'tools của agent', wf: 'frontmatter' },
      hint: 'Rê chuột vào một nút để lần theo liên kết. Bấm để mở sơ đồ riêng bên dưới.',
      show: 'Hiện', kSkill: 'skill → skill', kAgent: 'skill → agent', kOther: 'liên kết agent / hook', coreOnly: 'Chỉ SKILL.md', hideCat: 'Ẩn skill danh mục',
      pick: 'Bấm vào một nút ở trên để xem sơ đồ của nó ở đây.', open: 'Mở trang skill',
      hubs: ['Skill', 'Liên kết ra', 'Được tham chiếu bởi'], agentCols: ['Agent', 'Được spawn bởi skill', 'Giao tiếp cho'],
    },
  };
  const L = T[lang] || T.en;
  // Skills that list the whole catalog; their links say "exists", not "calls".
  const CATALOG = new Set(['ak-find-skills', 'ak-agentkit', 'ak-help']);
  const GROUP_COLOR = { start: '#7c9cff', plan: '#b48cff', build: '#3ddc97', git: '#f5b454', session: '#4fd1e8', docs: '#ff9fb2', frontend: '#ffd166' };
  const agentIds = new Set(D.agents.map((a) => a.id));
  const kindOf = (id) => (skillById[id] ? 'skill' : agentIds.has(id) ? 'agent' : 'hook');
  const colorOf = (id) => {
    const k = kindOf(id);
    if (k === 'skill') return GROUP_COLOR[(groupOf[id] || {}).id] || '#8b96a8';
    if (k === 'agent') return id === 'kongming' ? '#c792ea' : '#ff9f6b';
    return '#8b96a8';
  };
  const label = (id) => (kindOf(id) === 'skill' ? cmd(id) : id);
  const href = (id) => (kindOf(id) === 'skill' ? `#/skill/${id}` : kindOf(id) === 'agent' ? '#/agents' : '#/hooks');

  const out = {}, inc = {};
  const edges = D.relations.map((e) => ({ ...e }));
  D.skills.forEach((s) => {
    (s.follows || []).forEach((f) => skillById[f] && edges.push({ from: f, kind: 'skill', to: s.id, where: ['wf'], flags: [] }));
    (s.precedes || []).forEach((p) => skillById[p] && edges.push({ from: s.id, kind: 'skill', to: p, where: ['wf'], flags: [] }));
  });
  edges.forEach((e) => { (out[e.from] = out[e.from] || []).push(e); (inc[e.to] = inc[e.to] || []).push(e); });
  const uniq = (arr, key) => { const m = new Map(); arr.forEach((e) => { const k = key(e); m.set(k, m.has(k) ? merge(m.get(k), e) : e); }); return [...m.values()]; };
  const merge = (a, b) => ({ ...a, where: [...new Set([...a.where, ...b.where])], flags: [...new Set([...a.flags, ...b.flags])] });
  const styleOf = (e) => (e.where.includes('core') ? 'core' : e.where.includes('ref') ? 'ref' : e.where.includes('tools') ? 'tools' : 'wf');

  // ---------- Column diagram ----------
  const NW = 168, NH = 32, GAP = 6, COLW = 215, MAXN = 22;
  const column = (cols) => {
    const shown = cols.map((c) => c.nodes.slice(0, MAXN));
    const rows = Math.max(1, ...shown.map((c) => c.length + (c.length ? 0 : 0)));
    const H = rows * (NH + GAP) + 50;
    const pos = {};
    shown.forEach((nodes, ci) => {
      const top = 36 + (H - 36 - nodes.length * (NH + GAP)) / 2;
      nodes.forEach((n, ri) => (pos[ci + ':' + n.id] = { x: ci * COLW + 8, y: top + ri * (NH + GAP), n }));
    });
    return { shown, pos, H, W: cols.length * COLW };
  };
  const nodeSvg = (p, center) => {
    const id = p.n.id, c = colorOf(id), lbl = label(id), fl = (p.n.flags || []).join(' ');
    return `<a href="${href(id)}" class="rn" data-id="${esc(id)}"><g>
      <rect x="${p.x}" y="${p.y}" width="${NW}" height="${NH}" rx="6" fill="${center ? c : '#161b22'}" stroke="${c}" stroke-width="${center ? 2 : 1.2}"/>
      <text x="${p.x + NW / 2}" y="${p.y + (fl ? 14 : 20)}" text-anchor="middle" class="${center ? 'rc' : ''}">${esc(lbl.length > 24 ? lbl.slice(0, 23) + '…' : lbl)}</text>
      ${fl ? `<text x="${p.x + NW / 2}" y="${p.y + 27}" text-anchor="middle" class="rf">${esc(fl.length > 26 ? fl.slice(0, 25) + '…' : fl)}</text>` : ''}
      <title>${esc(lbl + (fl ? ' · ' + fl : ''))}</title></g></a>`;
  };
  const edgeSvg = (a, b, e) => {
    const x1 = a.x + NW, y1 = a.y + NH / 2, x2 = b.x, y2 = b.y + NH / 2, mx = (x1 + x2) / 2;
    return `<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" class="re re-${styleOf(e)}${b.n.id === 'kongming' ? ' re-esc' : ''}" data-a="${esc(e.from)}" data-b="${esc(e.to)}"/>`;
  };

  const legend = () => `<div class="rlegend">
    <span><i class="lk lk-core"></i>${L.core}</span><span><i class="lk lk-ref"></i>${L.ref}</span>
    <span><i class="lk lk-wf"></i>${L.wf}</span><span><i class="lk lk-tools"></i>${L.tools}</span>
    ${Object.entries(GROUP_COLOR).map(([g, c]) => `<span><i class="dot" style="background:${c}"></i>${esc(ctx.groupLabel(D.groups.find((x) => x.id === g) || { id: g, label: g }))}</span>`).join('')}
    <span><i class="dot" style="background:#ff9f6b"></i>agent</span><span><i class="dot" style="background:#c792ea"></i>kongming</span><span><i class="dot" style="background:#8b96a8"></i>hook</span></div>`;

  const edgeTable = (list) => list.length ? `<details class="rlist"><summary>${L.list} (${list.length})</summary><table>
    <tr><th>${L.from}</th><th>${L.to}</th><th>${L.where}</th><th>${L.when}</th></tr>
    ${list.map((e) => `<tr><td><a href="${href(e.from)}">${esc(label(e.from))}</a></td><td><a href="${href(e.to)}">${esc(label(e.to))}</a></td>
      <td>${e.where.map((w) => esc(L.whereText[w] || w)).join(', ')}</td><td>${e.flags.map((f) => `<code>${esc(f)}</code>`).join(' ')}</td></tr>`).join('')}</table></details>` : '';

  // Ego diagram: who points at `id` → id → skills it hands off to / agents it spawns → what those agents delegate to.
  const ego = (id) => {
    const callers = uniq(inc[id] || [], (e) => e.from);
    const outs = uniq(out[id] || [], (e) => e.to);
    const toSkills = outs.filter((e) => kindOf(e.to) === 'skill');
    const toAgents = outs.filter((e) => kindOf(e.to) === 'agent');
    const sub = kindOf(id) === 'skill' ? uniq(toAgents.flatMap((e) => (out[e.to] || []).filter((x) => kindOf(x.to) === 'agent')), (e) => e.from + '>' + e.to) : [];
    if (!callers.length && !outs.length) return `<p class="muted">${L.none}</p>`;
    const byTo = (a, b) => label(a.to).localeCompare(label(b.to));
    const cols = [
      { title: L.callers, nodes: callers.sort((a, b) => label(a.from).localeCompare(label(b.from))).map((e) => ({ id: e.from, flags: e.flags })) },
      { title: '', nodes: [{ id }] },
      { title: L.skills, nodes: toSkills.sort(byTo).map((e) => ({ id: e.to, flags: e.flags })) },
      { title: L.agents, nodes: toAgents.sort(byTo).map((e) => ({ id: e.to, flags: e.flags })) },
    ];
    const subNodes = uniq(sub, (e) => e.to).map((e) => ({ id: e.to }));
    if (subNodes.length) cols.push({ title: L.sub, nodes: subNodes });
    const { pos, H, W } = column(cols);
    const P = (ci, nid) => pos[ci + ':' + nid];
    const paths = [
      ...callers.map((e) => P(0, e.from) && edgeSvg(P(0, e.from), P(1, id), e)),
      ...toSkills.map((e) => P(2, e.to) && edgeSvg(P(1, id), P(2, e.to), e)),
      // Agents sit one column further right; route their edges from the center node.
      ...toAgents.map((e) => P(3, e.to) && edgeSvg(P(1, id), P(3, e.to), e)),
      ...sub.map((e) => P(3, e.from) && P(4, e.to) && edgeSvg(P(3, e.from), P(4, e.to), e)),
    ].filter(Boolean).join('');
    const titles = cols.map((c, ci) => (c.title ? `<text x="${ci * COLW + 8 + NW / 2}" y="18" text-anchor="middle" class="rt">${esc(c.title)} (${c.nodes.length})</text>` : '')).join('');
    const extra = cols.map((c, ci) => (c.nodes.length > MAXN ? `<text x="${ci * COLW + 8 + NW / 2}" y="${H - 8}" text-anchor="middle" class="rf">${esc(L.more(c.nodes.length - MAXN))}</text>` : '')).join('');
    const nodes = Object.entries(pos).map(([k, p]) => nodeSvg(p, k === '1:' + id)).join('');
    const list = [...callers, ...outs, ...sub];
    return `<div class="rwrap"><svg class="rsvg" viewBox="0 0 ${W} ${H}" style="min-width:${Math.min(W, 760)}px">${titles}${paths}${nodes}${extra}</svg></div>${legend()}${edgeTable(list)}`;
  };

  // ---------- Whole-kit circle map ----------
  const mapSvg = (opt) => {
    const skills = D.groups.flatMap((g) => g.skills.map((k) => 'ak-' + k)).filter((id) => skillById[id] && !(opt.hideCat && CATALOG.has(id)));
    const inner = [...D.agents.map((a) => a.id), ...[...new Set(D.relations.filter((e) => kindOf(e.from) === 'hook').map((e) => e.from))]];
    const P = {}, R1 = 370, R2 = 195;
    const slots = skills.length + D.groups.length * 2;
    let i = 0, prev = null;
    skills.forEach((id) => {
      const g = groupOf[id].id;
      if (g !== prev) { i += 2; prev = g; }
      const a = -Math.PI / 2 + (2 * Math.PI * i++) / slots;
      P[id] = { a, x: R1 * Math.cos(a), y: R1 * Math.sin(a), ring: 1 };
    });
    inner.forEach((id, j) => {
      const a = -Math.PI / 2 + (2 * Math.PI * j) / inner.length;
      P[id] = { a, x: R2 * Math.cos(a), y: R2 * Math.sin(a), ring: 2 };
    });
    const vis = edges.filter((e) => P[e.from] && P[e.to] && e.from !== e.to).filter((e) => {
      const ks = kindOf(e.from), kt = kindOf(e.to);
      if (opt.coreOnly && !e.where.includes('core') && !e.where.includes('tools')) return false;
      if (ks === 'skill' && kt === 'skill') return opt.kSkill;
      if (ks === 'skill' && kt === 'agent') return opt.kAgent;
      return opt.kOther;
    });
    const col = (e) => (kindOf(e.from) === 'skill' && kindOf(e.to) === 'skill' ? colorOf(e.from) : kindOf(e.to) === 'agent' ? colorOf(e.to) : '#c7cfdb');
    const paths = vis.map((e) => {
      const a = P[e.from], b = P[e.to], k = a.ring === 1 && b.ring === 1 ? 0.15 : 0.45;
      return `<path d="M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${((a.x + b.x) * k).toFixed(1)},${((a.y + b.y) * k).toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}" stroke="${col(e)}" class="me${styleOf(e) === 'ref' ? ' me-ref' : ''}" data-a="${esc(e.from)}" data-b="${esc(e.to)}"/>`;
    }).join('');
    const deg = {};
    vis.forEach((e) => { deg[e.from] = (deg[e.from] || 0) + 1; deg[e.to] = (deg[e.to] || 0) + 1; });
    const nodes = Object.entries(P).map(([id, p]) => {
      const deg1 = deg[id] || 0, r = Math.min(9, 3 + Math.sqrt(deg1)), dgr = (p.a * 180) / Math.PI;
      const left = Math.cos(p.a) < 0, txt = kindOf(id) === 'skill' ? id.slice(3) : id;
      const lx = p.x + Math.cos(p.a) * (r + 5), ly = p.y + Math.sin(p.a) * (r + 5);
      const t = p.ring === 1
        ? `<text transform="translate(${lx.toFixed(1)},${ly.toFixed(1)}) rotate(${(left ? dgr + 180 : dgr).toFixed(1)})" text-anchor="${left ? 'end' : 'start'}" dy="3">${esc(txt)}</text>`
        : `<text x="${(p.x + Math.cos(p.a) * (r + 4)).toFixed(1)}" y="${(p.y + Math.sin(p.a) * (r + 4)).toFixed(1)}" text-anchor="${Math.abs(Math.cos(p.a)) < 0.3 ? 'middle' : left ? 'end' : 'start'}" dy="${Math.sin(p.a) > 0.3 ? 9 : Math.sin(p.a) < -0.3 ? -2 : 3}" class="mi">${esc(txt)}</text>`;
      return `<g class="mn${deg1 ? '' : ' mn-0'}" data-id="${esc(id)}"><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" fill="${colorOf(id)}"/>${t}<title>${esc(label(id))} · ${deg1}</title></g>`;
    }).join('');
    return `<svg class="msvg" viewBox="-560 -520 1120 1040">${paths}${nodes}</svg>`;
  };

  const hubTables = () => {
    const sk = D.skills.map((s) => ({ id: s.id, o: uniq(out[s.id] || [], (e) => e.to).length, i: uniq(inc[s.id] || [], (e) => e.from).length }))
      .filter((x) => !CATALOG.has(x.id)).sort((a, b) => b.o + b.i - (a.o + a.i)).slice(0, 15);
    const ag = D.agents.map((a) => ({
      id: a.id,
      by: uniq((inc[a.id] || []).filter((e) => kindOf(e.from) === 'skill'), (e) => e.from).map((e) => e.from).sort(),
      to: uniq((out[a.id] || []).filter((e) => kindOf(e.to) === 'agent'), (e) => e.to).map((e) => e.to),
    })).sort((a, b) => b.by.length - a.by.length);
    const link = (id) => `<a href="${href(id)}">${esc(label(id))}</a>`;
    return `<table><tr>${L.hubs.map((h) => `<th>${h}</th>`).join('')}</tr>${sk.map((x) => `<tr><td>${link(x.id)}</td><td>${x.o}</td><td>${x.i}</td></tr>`).join('')}</table>
      <table><tr>${L.agentCols.map((h) => `<th>${h}</th>`).join('')}</tr>${ag.map((x) => `<tr><td><b>${esc(x.id)}</b></td><td class="small">${x.by.map(link).join(', ') || '—'}</td><td class="small">${x.to.map(esc).join(', ') || '—'}</td></tr>`).join('')}</table>`;
  };

  const spawnedBy = (agentId) => uniq((inc[agentId] || []).filter((e) => kindOf(e.from) === 'skill'), (e) => e.from).map((e) => e.from);

  // Bind hover highlighting on any svg containing .re/.me edges and [data-id] nodes.
  const bindHover = (root) => {
    root.querySelectorAll('svg').forEach((svg) => {
      svg.addEventListener('mouseover', (ev) => {
        const n = ev.target.closest('[data-id]');
        if (!n) return;
        const id = n.dataset.id, near = new Set([id]);
        svg.querySelectorAll('path[data-a]').forEach((p) => {
          const on = p.dataset.a === id || p.dataset.b === id;
          p.classList.toggle('hl', on);
          p.classList.toggle('hl-in', on && p.dataset.b === id);
          if (on) { near.add(p.dataset.a); near.add(p.dataset.b); }
        });
        svg.querySelectorAll('[data-id]').forEach((x) => x.classList.toggle('near', near.has(x.dataset.id)));
        svg.classList.add('focus');
      });
      svg.addEventListener('mouseleave', () => svg.classList.remove('focus'));
    });
  };

  return { ego, mapSvg, hubTables, spawnedBy, bindHover, L, kindOf, label };
};
