(() => {
  const D = window.AK_DATA;
  const CONTENT = { en: window.AK_CONTENT_EN, vi: window.AK_CONTENT_VI };
  const COMMON = CONTENT.vi.common;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const code = (s) => `<code>${esc(s)}</code>`;

  // ---------- UI strings ----------
  const T = {
    en: {
      menu: 'Open menu', search: 'Search skills, flags, agents, hooks…  (press /)', noResults: 'No results',
      statSkills: 'Engineer skills', statAgents: 'agents', statHooks: 'hook scripts', statEvents: 'lifecycle events', statRules: 'rules', statFlags: 'distinct flags',
      badge: (M, u) => `ak ${M.akVersion || '?'} · Engineer ${M.engineerKitVersion || '?'} · updated ${u}`,
      versionLine: (M, b, u) => `Covers <b>ak CLI ${esc(M.akVersion || '?')}</b> (built ${esc(b)}) and <b>Engineer Kit ${esc(M.engineerKitVersion || '?')}</b>. Last updated: <b>${esc(u)}</b>.`,
      vComponent: 'Component', vVersion: 'Version', vExtracted: 'Data extracted', vBuilt: 'built',
      vCheck: `Check yours with ${code('ak --version')} and ${code('ak versions')}. If you're newer, some flags or skills may have changed.`,
      footer: (M, u) => `AgentKit Guide · ak ${esc(M.akVersion || '?')} · Engineer Kit ${esc(M.engineerKitVersion || '?')} · Updated ${esc(u)} · <a href="#/sources">Sources &amp; updates</a>`,
      hookCols: ['Script', 'Registered on', 'What it does', 'Disable with'],
      agentFilter: 'Filter agents…', usedBy: 'Used by', tools: 'Tools',
      skillFilter: 'Filter by name, description, flag (e.g. --tdd)…', allGroups: 'All groups', allParts: 'All parts', core: 'Core (shared)', engineer: 'Engineer', commonOnly: 'Common only', common: 'COMMON',
      count: (n) => `${n} skills`,
      notFound: (id) => `Skill ${esc(id)} not found.`,
      pCols: ['Param', 'Kind', 'Effect'], noFlags: 'No flags. Pass a free-form description or argument.',
      userInv: 'callable with /', modelInv: 'model can auto-invoke', manualOnly: 'manual only', lines: 'lines in SKILL.md',
      syntax: 'Syntax', chainLabel: 'Position in workflow', overview: 'Overview', original: 'Original description (frontmatter)',
      how: 'How it works', params: 'Parameters', examples: 'Examples', useWhen: 'Use when', avoidWhen: 'Avoid when', tips: 'Tips',
      rel: 'Relationships', relNote: 'Every link below was found in the installed kit source by scripts/extract.py, not written by hand.',
      agents: 'Subagents spawned', artifacts: 'Artifacts produced', related: 'Related skills', refFiles: 'Reference files', sections: 'Sections in SKILL.md',
      matrixNote: 'Only flags used by 2+ skills. See each skill page for its own flags.',
      levels: { '': 'All levels', easy: 'Easy', medium: 'Medium', advanced: 'Advanced' }, steps: 'steps', when: 'Use when', options: 'Options',
      chooserCols: ['I want to…', 'Use', 'Look-alikes / alternatives'], cliCols: ['Command', 'What it does', 'Subcommands / flags'],
      buildInfo: (a, d, ag, h, r) => `Data: ${a} Engineer skills (${d} with detailed explanations), ${ag} agents, ${h} hooks, ${r} rules.`,
    },
    vi: {
      menu: 'Mở menu', search: 'Tìm skill, flag, agent, hook…  (phím /)', noResults: 'Không có kết quả',
      statSkills: 'skills Engineer', statAgents: 'agents', statHooks: 'hook scripts', statEvents: 'sự kiện lifecycle', statRules: 'rules', statFlags: 'flag khác nhau',
      badge: (M, u) => `ak ${M.akVersion || '?'} · Engineer ${M.engineerKitVersion || '?'} · cập nhật ${u}`,
      versionLine: (M, b, u) => `Nội dung ứng với <b>ak CLI ${esc(M.akVersion || '?')}</b> (build ${esc(b)}), <b>Engineer Kit ${esc(M.engineerKitVersion || '?')}</b>. Cập nhật lần cuối: <b>${esc(u)}</b>.`,
      vComponent: 'Thành phần', vVersion: 'Phiên bản', vExtracted: 'Dữ liệu trích lúc', vBuilt: 'build',
      vCheck: `Kiểm tra phiên bản trên máy bạn: ${code('ak --version')} và ${code('ak versions')}. Nếu bản của bạn mới hơn, có thể vài flag hoặc skill đã thay đổi.`,
      footer: (M, u) => `AgentKit Guide · ak ${esc(M.akVersion || '?')} · Engineer Kit ${esc(M.engineerKitVersion || '?')} · Cập nhật ${esc(u)} · <a href="#/sources">Nguồn &amp; cách cập nhật</a>`,
      hookCols: ['Script', 'Đăng ký ở sự kiện', 'Làm gì', 'Tắt bằng'],
      agentFilter: 'Lọc agent…', usedBy: 'Được dùng bởi', tools: 'Tools',
      skillFilter: 'Lọc theo tên, mô tả, flag (vd: --tdd)…', allGroups: 'Tất cả nhóm', allParts: 'Mọi phần', core: 'Core (dùng chung)', engineer: 'Engineer', commonOnly: 'Chỉ skill hay dùng', common: 'HAY DÙNG',
      count: (n) => `${n} skill`,
      notFound: (id) => `Không tìm thấy skill ${esc(id)}.`,
      pCols: ['Tham số', 'Loại', 'Tác dụng'], noFlags: 'Không có flag. Chỉ truyền mô tả hoặc đối số tự do.',
      userInv: 'bạn gọi được bằng /', modelInv: 'model tự kích hoạt được', manualOnly: 'chỉ gọi thủ công', lines: 'dòng SKILL.md',
      syntax: 'Cú pháp', chainLabel: 'Vị trí trong workflow', overview: 'Tổng quan', original: 'Mô tả gốc (frontmatter)',
      how: 'Cách hoạt động', params: 'Tham số', examples: 'Ví dụ', useWhen: 'Nên dùng khi', avoidWhen: 'Không nên dùng khi', tips: 'Mẹo',
      rel: 'Sơ đồ quan hệ', relNote: 'Mọi liên kết dưới đây do scripts/extract.py tìm thấy trong source kit đã cài, không viết tay.',
      agents: 'Subagent được spawn', artifacts: 'Artifact tạo ra', related: 'Skill liên quan', refFiles: 'File references', sections: 'Các mục trong SKILL.md',
      matrixNote: 'Chỉ hiện flag có ở từ 2 skill trở lên. Flag riêng của từng skill xem ở trang chi tiết.',
      levels: { '': 'Mọi mức', easy: 'Dễ', medium: 'Vừa', advanced: 'Nâng cao' }, steps: 'bước', when: 'Dùng khi', options: 'Tùy chọn',
      chooserCols: ['Tôi muốn…', 'Dùng', 'Phân biệt / thay thế'], cliCols: ['Lệnh', 'Làm gì', 'Subcommand / flag'],
      buildInfo: (a, d, ag, h, r) => `Dữ liệu: ${a} skills Engineer (${d} có diễn giải chi tiết), ${ag} agents, ${h} hooks, ${r} rules.`,
    },
  };
  const GROUP_EN = { start: 'Start here (essentials)', plan: 'Plan & research', build: 'Build & ship', git: 'Git, PRs & worktrees', session: 'Sessions, orchestration & knowledge', docs: 'Docs & diagrams', frontend: 'Frontend, design & media' };
  const HOOK_TEXT = {
    en: {
      'session-init.cjs': 'Loads config, detects the project, sets env vars, prints session context (also after resume, clear, compact).',
      'dev-rules-reminder.cjs': 'Injects Session / Rules / Paths / Plan Context / Naming into every prompt and after each Write/Edit.',
      'secret-output-guardrail.cjs': 'When a prompt touches secrets, adds a reminder not to print credentials. Never echoes values.',
      'simplify-gate.cjs': 'Blocks ship/merge/pr/deploy/publish on a large diff (>400 LOC, >8 files, or one file +200 LOC). Commit/release only warn.',
      'usage-quota-cache-refresh.cjs': 'Refreshes the 5-hour and weekly quota cache for the statusline.',
      'privacy-block.cjs': 'Blocks reading or writing .env, credentials, keys. Access needs your approval and the APPROVED: prefix.',
      'scout-block.cjs': 'Blocks heavy dirs from .ckignore (node_modules, dist…) but allows build commands; warns on overly broad globs.',
      'descriptive-name.cjs': 'Before Write, reminds per-language file naming conventions.',
      'plan-format-kanban.cjs': 'Warns when plan.md uses file names as link text instead of readable names.',
      'session-state.cjs': 'Saves progress checkpoints (Agent/Task/Todo) for statusline and handoff.',
      'subagent-init.cjs': 'Injects ~200 tokens of minimal context into every new subagent.',
      'team-context-inject.cjs': 'For Agent Team members, injects teammate info and a task summary.',
      'cook-after-plan-reminder.cjs': 'After the planner finishes, prints next-step choices and the plan\'s absolute path.',
      'context-firewall.cjs': 'Caps how much context one Read/Grep/Glob/Bash returns: allow → warn → narrow → block. Reads warn at 256 KB, block at 2 MB; shell output warns at 128 KB, blocks at 512 KB.',
      'agent-behavior-linter.cjs': 'Watches tool calls all session; at Stop reports provable anti-patterns: re-reading unchanged files, re-running known failures, whole-tree sweeps, full suites for docs-only changes. Never blocks.',
      'precompact-capture.cjs': 'Before compaction, saves worktree, branch, HEAD, dirty count, and active plan to replay afterwards.',
    },
    vi: {
      'session-init.cjs': 'Nạp config, nhận diện project, set env vars, in context đầu phiên (cả sau resume, clear, compact).',
      'dev-rules-reminder.cjs': 'Chèn khối Session / Rules / Paths / Plan Context / Naming vào mỗi prompt và sau mỗi Write/Edit.',
      'secret-output-guardrail.cjs': 'Khi prompt có dấu hiệu liên quan secret, chèn lời nhắc không in credential. Không bao giờ echo lại giá trị.',
      'simplify-gate.cjs': 'Chặn ship/merge/pr/deploy/publish khi diff lớn (hơn 400 LOC, hơn 8 file, hoặc một file thêm hơn 200 LOC). Commit hoặc release thì chỉ cảnh báo.',
      'usage-quota-cache-refresh.cjs': 'Làm mới cache quota 5 giờ và theo tuần cho statusline.',
      'privacy-block.cjs': 'Chặn đọc hoặc ghi .env, credential, key. Muốn truy cập phải được người dùng đồng ý và dùng tiền tố APPROVED:.',
      'scout-block.cjs': 'Chặn duyệt thư mục nặng trong .ckignore (node_modules, dist…) nhưng cho phép lệnh build; cảnh báo glob quá rộng.',
      'descriptive-name.cjs': 'Trước khi Write, nhắc quy ước đặt tên file theo ngôn ngữ.',
      'plan-format-kanban.cjs': 'Cảnh báo khi plan.md dùng tên file làm link text thay vì tên dễ đọc.',
      'session-state.cjs': 'Lưu checkpoint tiến độ (Agent/Task/Todo) cho statusline và handoff.',
      'subagent-init.cjs': 'Chèn khoảng 200 token context tối thiểu cho mọi subagent vừa spawn.',
      'team-context-inject.cjs': 'Nếu subagent là thành viên Agent Team, chèn thông tin đồng đội và tóm tắt task.',
      'cook-after-plan-reminder.cjs': 'Khi planner xong, in các bước tiếp để bạn chọn và đường dẫn tuyệt đối của plan.',
      'context-firewall.cjs': 'Gác cổng lượng context một Read/Grep/Glob/Bash có thể trả về. Thang xử lý allow → warn → narrow (tự thu hẹp input) → block. Đọc file từ 256 KB thì cảnh báo, từ 2 MB thì chặn; output shell từ 128 KB thì cảnh báo, từ 512 KB thì chặn.',
      'agent-behavior-linter.cjs': 'Quan sát tool call cả phiên, khi Stop thì báo anti-pattern chứng minh được: đọc lại file không đổi, chạy lại lỗi deterministic, quét cả cây, output vô ích, chạy full suite cho thay đổi chỉ về docs. Không bao giờ chặn.',
      'precompact-capture.cjs': 'Trước khi compact, lưu worktree, branch, HEAD, số file dirty và plan active để nhắc lại sau compact.',
    },
  };

  // ---------- Language state (default: English) ----------
  const params = new URLSearchParams(location.search);
  let lang = params.get('lang') || localStorage.getItem('ak-lang') || 'en';
  if (!T[lang]) lang = 'en';
  const t = () => T[lang];
  const C = () => CONTENT[lang];
  const detail = (id) => (D.detail[lang] && D.detail[lang][id]) || D.detail.vi[id] || {};
  const groupLabel = (g) => (lang === 'en' ? GROUP_EN[g.id] || g.label : g.label);
  const locale = () => (lang === 'vi' ? 'vi-VN' : 'en-GB');

  const skillById = Object.fromEntries(D.skills.map((s) => [s.id, s]));
  const groupOf = {};
  D.groups.forEach((g) => g.skills.forEach((k) => (groupOf['ak-' + k] = g)));
  const kitOf = (s) => (groupOf[s.id] ? groupOf[s.id].kit : 'other');
  const cmd = (id) => (id.startsWith('ak-') ? '/ak:' + id.slice(3) : '/' + id);
  const skillLink = (id) => (skillById[id] ? `<a href="#/skill/${id}">${esc(cmd(id))}</a>` : esc(id));
  // Turn /ak:xxx and ak-xxx mentions in escaped text into skill links.
  const linkify = (html) =>
    html.replace(/(\/ak:|\bak-)([a-z0-9-]+[a-z0-9])/g, (m, p, name) => (skillById['ak-' + name] ? `<a href="#/skill/ak-${name}">${m}</a>` : m));
  const akSkills = D.skills;
  const M = D.meta || {};
  const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString(locale(), { day: '2-digit', month: '2-digit', year: 'numeric' }) : '?');

  const byScript = {};
  D.hooks.forEach((h) => {
    byScript[h.script] = byScript[h.script] || { script: h.script, regs: [] };
    byScript[h.script].regs.push(`${h.event}${h.matcher && h.matcher !== '*' ? ` (${h.matcher})` : ''}`);
  });
  const uniqueHooks = Object.keys(byScript).length;

  let REL;
  const usedBy = {};
  Object.entries(D.detail.vi).forEach(([sid, d]) => (d.agents || []).forEach((a) => {
    const k = String(a).toLowerCase().replace(/[`\s].*$/, '');
    (usedBy[k] = usedBy[k] || new Set()).add(sid);
  }));

  // ---------- Renderers ----------
  const renderChrome = () => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
    document.querySelectorAll('#langSwitch button').forEach((b) => b.classList.toggle('active', b.dataset.l === lang));
    $('#menuBtn').setAttribute('aria-label', t().menu);
    $('#globalSearch').placeholder = t().search;
    $('#agentFilter').placeholder = t().agentFilter;
    $('#skillFilter').placeholder = t().skillFilter;
    $('#commonLabel').textContent = t().commonOnly;
    const gf = $('#groupFilter'), gv = gf.value;
    gf.innerHTML = `<option value="">${esc(t().allGroups)}</option>` + D.groups.map((g) => `<option value="${g.id}">${esc(groupLabel(g))}</option>`).join('');
    gf.value = gv;
    const kf = $('#kitFilter'), kv = kf.value;
    kf.innerHTML = `<option value="">${esc(t().allParts)}</option><option value="core">${esc(t().core)}</option><option value="engineer">${esc(t().engineer)}</option>`;
    kf.value = kv;
    const wl = $('#wfLevel'), wv = wl.value;
    wl.innerHTML = Object.entries(t().levels).map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('');
    wl.value = wv;
  };

  const renderStatic = () => {
    const updated = fmtDate(M.extractedAt);
    $('#homeStats').innerHTML = [
      [akSkills.length, t().statSkills], [D.agents.length, t().statAgents], [uniqueHooks, t().statHooks],
      [new Set(D.hooks.map((h) => h.event)).size, t().statEvents], [D.rules.length, t().statRules],
      [new Set(akSkills.flatMap((s) => s.flags)).size, t().statFlags],
    ].map(([n, l]) => `<div class="stat"><b>${n}</b><span>${esc(l)}</span></div>`).join('');
    $('#verBadge').textContent = t().badge(M, updated);
    $('#versionLine').innerHTML = t().versionLine(M, fmtDate(M.akBuildDate), updated);
    $('#versionTable').innerHTML = `<table>
      <tr><th>${t().vComponent}</th><th>${t().vVersion}</th></tr>
      <tr><td>ak CLI</td><td>${code(M.akVersion || '?')} (${t().vBuilt} ${esc(fmtDate(M.akBuildDate))})</td></tr>
      <tr><td>Engineer Kit</td><td>${code(M.engineerKitVersion || '?')}</td></tr>
      <tr><td>${t().vExtracted}</td><td>${esc(M.extractedAt ? new Date(M.extractedAt).toLocaleString(locale()) : '?')}</td></tr>
    </table><p class="small muted">${t().vCheck}</p>`;
    $('#siteFooter').innerHTML = t().footer(M, updated);
    const hc = t().hookCols;
    $('#hooksTable').innerHTML = `<table><tr>${hc.map((c) => `<th>${c}</th>`).join('')}</tr>${Object.values(byScript)
      .map((h) => `<tr><td>${code(h.script)}</td><td>${[...new Set(h.regs)].map(esc).join('<br>')}</td><td>${esc(HOOK_TEXT[lang][h.script] || '')}</td><td>${code('hooks.' + h.script.replace('.cjs', '') + ': false')}</td></tr>`)
      .join('')}</table>`;
    const flagCount = {};
    akSkills.forEach((s) => s.flags.forEach((f) => (flagCount[f] = (flagCount[f] || 0) + 1)));
    const topFlags = Object.entries(flagCount).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).map(([f]) => f);
    const withFlags = akSkills.filter((s) => s.flags.some((f) => topFlags.includes(f)));
    $('#flagMatrix').innerHTML = `<table class="matrix"><tr><th>Skill</th>${topFlags.map((f) => `<th><span>${esc(f)}</span></th>`).join('')}</tr>${withFlags
      .map((s) => `<tr><td>${skillLink(s.id)}</td>${topFlags.map((f) => `<td>${s.flags.includes(f) ? '●' : ''}</td>`).join('')}</tr>`).join('')}</table>
      <p class="muted small">${t().matrixNote}</p>`;
    const cc = t().chooserCols;
    $('#chooserTable').innerHTML = `<table><tr>${cc.map((c) => `<th>${c}</th>`).join('')}</tr>${C().chooser
      .map(([w, id, n]) => `<tr><td>${esc(w)}</td><td>${skillLink(id)}</td><td>${linkify(esc(n))}</td></tr>`).join('')}</table>`;
    const lc = t().cliCols;
    $('#cliTables').innerHTML = C().cli.map((g) => `<h2>${esc(g.group)}</h2><table><tr>${lc.map((c) => `<th>${c}</th>`).join('')}</tr>${g.rows
      .map(([c, w, f]) => `<tr><td>${code(c)}</td><td>${esc(w)}</td><td class="small">${esc(f)}</td></tr>`).join('')}</table>`).join('');
    $('#buildInfo').textContent = t().buildInfo(akSkills.length, Object.keys(D.detail[lang] || {}).length, D.agents.length, uniqueHooks, D.rules.length);
  };

  const renderAgents = () => {
    const q = $('#agentFilter').value.toLowerCase();
    $('#agentsGrid').innerHTML = D.agents
      .filter((a) => !q || (a.id + a.description + a.model).toLowerCase().includes(q))
      .map((a) => {
        const users = [...new Set([...REL.spawnedBy(a.id), ...(usedBy[a.id] || [])])].sort();
        return `<div class="card agent"><div class="row"><h3>${esc(a.id)}</h3><span class="model m-${esc(a.model)}">${esc(a.model || 'inherit')}</span></div>
        <p>${esc(a.description.replace(/\s*Examples?:.*$/s, '').slice(0, 420))}</p>
        ${a.tools ? `<p class="muted small">${t().tools}: ${esc(a.tools)}</p>` : ''}
        ${users.length ? `<p class="small">${t().usedBy}: ${users.map(skillLink).join(', ')}</p>` : ''}</div>`;
      }).join('');
  };

  const skillCard = (s) => {
    const d = detail(s.id);
    return `<a class="card skill" href="#/skill/${s.id}">
      <div class="row"><h3>${esc(cmd(s.id))}</h3>${COMMON.includes(s.id) ? `<span class="badge">${t().common}</span>` : ''}</div>
      <p>${esc(d.tagline || s.whenToUse || s.description).slice(0, 220)}</p>
      ${s.argumentHint ? `<div class="hint">${esc(s.argumentHint)}</div>` : ''}</a>`;
  };
  const renderSkills = () => {
    const q = $('#skillFilter').value.toLowerCase().trim();
    const g = $('#groupFilter').value, kit = $('#kitFilter').value, co = $('#commonOnly').checked;
    const list = D.skills.filter((s) => {
      const grp = groupOf[s.id];
      if (g && (!grp || grp.id !== g)) return false;
      if (kit && kitOf(s) !== kit) return false;
      if (co && !COMMON.includes(s.id)) return false;
      if (!q) return true;
      const d = detail(s.id);
      return [s.id, s.description, s.whenToUse, s.argumentHint, d.tagline, d.summary, (s.keywords || []).join(' ')].join(' ').toLowerCase().includes(q);
    });
    $('#skillCount').textContent = t().count(list.length);
    $('#skillsGrid').innerHTML = D.groups.map((grp) => {
      const items = list.filter((s) => groupOf[s.id] && groupOf[s.id].id === grp.id);
      return items.length ? `<h2>${esc(groupLabel(grp))} <span class="muted">(${items.length})</span></h2><div class="cards">${items.map(skillCard).join('')}</div>` : '';
    }).join('');
  };

  const bullets = (arr, cls = '') => (arr && arr.length ? `<ul class="${cls}">${arr.map((x) => `<li>${linkify(esc(x))}</li>`).join('')}</ul>` : '<p class="muted">—</p>');
  const renderSkill = (id) => {
    const s = skillById[id];
    if (!s) return ($('#skillDetail').innerHTML = `<p>${t().notFound(id)}</p>`);
    const d = detail(id), grp = groupOf[id], L = t();
    const paramsHtml = d.params && d.params.length
      ? `<table><tr>${L.pCols.map((c) => `<th>${c}</th>`).join('')}</tr>${d.params.map((p) => `<tr><td>${code(p.name)}</td><td><span class="kind k-${esc(p.kind)}">${esc(p.kind)}</span></td><td>${linkify(esc(p.desc))}</td></tr>`).join('')}</table>`
      : s.flags.length ? `<p>${s.flags.map(code).join(' ')}</p>` : `<p class="muted">${L.noFlags}</p>`;
    const ex = (d.examples || []).map((e) => `<div class="ex"><code>${esc(e.cmd)}</code><span>${linkify(esc(e.note))}</span></div>`).join('');
    const chain = [...(s.follows || []).map((x) => `${skillLink(x)} → `), `<b>${esc(cmd(id))}</b>`, ...(s.precedes || []).map((x) => ` → ${skillLink(x)}`)].join('');
    $('#skillDetail').innerHTML = `
      <p class="crumbs"><a href="#/skills">Skills</a> / ${esc(grp ? groupLabel(grp) : '')}</p>
      <h1>${esc(cmd(id))}</h1>
      <p class="lead">${linkify(esc(d.tagline || s.whenToUse || ''))}</p>
      <div class="meta">
        ${s.version ? `<span>v${esc(s.version)}</span>` : ''}${s.category ? `<span>${esc(s.category)}</span>` : ''}
        <span>kit: ${esc(kitOf(s))}</span>${s.userInvocable ? `<span>${L.userInv}</span>` : ''}<span>${s.modelInvocable ? L.modelInv : L.manualOnly}</span>
        <span>${s.lines} ${L.lines}</span>${s.references.length ? `<span>${s.references.length} references</span>` : ''}
      </div>
      ${s.argumentHint ? `<h2>${L.syntax}</h2><pre><code>${esc(cmd(id))} ${esc(s.argumentHint)}</code></pre>` : ''}
      ${(s.follows.length || s.precedes.length) ? `<p class="chain">${L.chainLabel}: ${chain}</p>` : ''}
      <h2>${L.overview}</h2><p>${linkify(esc(d.summary || s.description))}</p>
      <details class="orig"><summary>${L.original}</summary><p>${esc(s.description)}</p>${s.whenToUse ? `<p><i>when_to_use:</i> ${esc(s.whenToUse)}</p>` : ''}</details>
      ${d.howItWorks ? `<h2>${L.how}</h2><ol class="how">${d.howItWorks.map((x) => `<li>${linkify(esc(x))}</li>`).join('')}</ol>` : ''}
      <h2>${L.params}</h2>${paramsHtml}
      ${ex ? `<h2>${L.examples}</h2><div class="examples">${ex}</div>` : ''}
      <div class="two-col">
        <div><h2>${L.useWhen}</h2>${bullets(d.useWhen, 'yes')}</div>
        <div><h2>${L.avoidWhen}</h2>${bullets(d.avoidWhen, 'no')}</div>
      </div>
      ${d.tips ? `<h2>${L.tips}</h2>${bullets(d.tips, 'tips')}` : ''}
      <div class="two-col">
        <div><h2>${L.agents}</h2>${bullets(d.agents)}</div>
        <div><h2>${L.artifacts}</h2>${bullets(d.artifacts)}</div>
      </div>
      ${d.related && d.related.length ? `<h2>${L.related}</h2><p class="related">${d.related.map(skillLink).join(' · ')}</p>` : ''}
      <h2>${L.rel}</h2><p class="muted small">${L.relNote}</p>${REL.ego(id)}
      ${s.references.length ? `<details><summary>${L.refFiles} (${s.references.length})</summary><p class="small">${s.references.map(code).join(' ')}</p></details>` : ''}
      ${s.sections.length ? `<details><summary>${L.sections}</summary><p class="small">${s.sections.map(esc).join(' · ')}</p></details>` : ''}`;
    REL.bindHover($('#skillDetail'));
  };

  // ---------- Relationship map ----------
  let mapFocus = 'ak-cook';
  const renderMap = () => {
    const opt = Object.fromEntries(['kSkill', 'kAgent', 'kOther', 'coreOnly', 'hideCat'].map((k) => [k, $('#map-' + k).checked]));
    $('#mapGraph').innerHTML = REL.mapSvg(opt);
    $('#mapHubs').innerHTML = REL.hubTables();
    renderMapEgo();
    REL.bindHover($('#mapGraph'));
  };
  const renderMapEgo = () => {
    const isSkill = REL.kindOf(mapFocus) === 'skill';
    $('#mapEgo').innerHTML = `<h2>${esc(REL.label(mapFocus))}${isSkill ? ` <a class="small" href="#/skill/${mapFocus}">${REL.L.open} →</a>` : ''}</h2>${REL.ego(mapFocus)}`;
    REL.bindHover($('#mapEgo'));
  };
  $('#mapGraph').addEventListener('click', (e) => {
    const n = e.target.closest('[data-id]');
    if (!n) return;
    mapFocus = n.dataset.id;
    renderMapEgo();
    $('#mapEgo').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.querySelectorAll('#mapControls input').forEach((i) => i.addEventListener('input', renderMap));

  const renderWf = () => {
    const lv = $('#wfLevel').value, L = t();
    $('#workflowList').innerHTML = C().workflows.filter((w) => !lv || w.level === lv).map((w) => `
      <div class="wf" id="wf-${w.id}">
        <div class="row"><h2>${esc(w.title)}</h2><span class="lvl lvl-${esc(w.level)}">${esc(L.levels[w.level])}</span><span class="muted">${esc(w.time)} · ${w.steps.length} ${L.steps}</span></div>
        <p><b>${L.when}:</b> ${esc(w.when)}</p>
        <ol class="wf-steps">${w.steps.map(([c, n]) => `<li><code>${linkify(esc(c))}</code>${n ? `<span>${linkify(esc(n))}</span>` : ''}</li>`).join('')}</ol>
        ${w.options.length ? `<p class="small"><b>${L.options}:</b> ${w.options.map((o) => linkify(esc(o))).join(' · ')}</p>` : ''}
      </div>`).join('');
  };

  // ---------- Search ----------
  const searchIndex = () => [
    ...D.skills.map((s) => ({ t: cmd(s.id), s: detail(s.id).tagline || s.whenToUse || s.description, h: '#/skill/' + s.id, k: (s.id + ' ' + s.argumentHint + ' ' + s.description + ' ' + (detail(s.id).tagline || '')).toLowerCase() })),
    ...D.agents.map((a) => ({ t: 'agent: ' + a.id, s: a.description, h: '#/agents', k: (a.id + ' ' + a.description).toLowerCase() })),
    ...Object.keys(byScript).map((h) => ({ t: 'hook: ' + h, s: HOOK_TEXT[lang][h] || '', h: '#/hooks', k: h })),
    ...C().workflows.map((w) => ({ t: 'workflow: ' + w.title, s: w.when, h: '#/workflows#wf-' + w.id, k: (w.title + ' ' + w.when).toLowerCase() })),
  ];
  const sr = $('#searchResults'), gs = $('#globalSearch');
  gs.addEventListener('input', () => {
    const q = gs.value.toLowerCase().trim();
    if (!q) return (sr.hidden = true);
    const hits = searchIndex().filter((x) => x.k.includes(q) || x.t.toLowerCase().includes(q)).slice(0, 12);
    sr.innerHTML = hits.length ? hits.map((x) => `<a href="${x.h}"><b>${esc(x.t)}</b><span>${esc(String(x.s).slice(0, 110))}</span></a>`).join('') : `<div class="muted">${t().noResults}</div>`;
    sr.hidden = false;
  });
  sr.addEventListener('click', () => { sr.hidden = true; gs.value = ''; });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); gs.focus(); }
    if (e.key === 'Escape') sr.hidden = true;
  });

  // ---------- Router ----------
  const sidebar = $('#sidebar'), overlay = $('#overlay');
  const toggleMenu = (open) => { sidebar.classList.toggle('open', open); overlay.hidden = !open; };
  $('#menuBtn').addEventListener('click', () => toggleMenu(!sidebar.classList.contains('open')));
  overlay.addEventListener('click', () => toggleMenu(false));
  const route = (keepScroll) => {
    const [, page = 'home', arg] = location.hash.replace(/#wf-.*$/, '').split('/');
    const target = page === 'skill' ? 'skill' : page;
    document.querySelectorAll('section[data-page]').forEach((s) => (s.hidden = s.dataset.page !== target));
    if (!document.querySelector(`section[data-page="${target}"]`)) $('section[data-page="home"]').hidden = false;
    if (page === 'skill') renderSkill(decodeURIComponent(arg || ''));
    document.querySelectorAll('.sidebar a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#/' + (page === 'skill' ? 'skills' : page)));
    toggleMenu(false);
    if (!keepScroll) window.scrollTo(0, 0);
  };

  const renderAll = () => {
    REL = window.AK_REL({ D, esc, cmd, skillById, groupOf, groupLabel, lang });
    renderChrome(); renderMap(); renderStatic(); renderAgents(); renderSkills(); renderWf();
  };
  $('#agentFilter').addEventListener('input', renderAgents);
  ['skillFilter', 'groupFilter', 'kitFilter', 'commonOnly'].forEach((id) => $('#' + id).addEventListener('input', renderSkills));
  $('#wfLevel').addEventListener('input', renderWf);
  $('#langSwitch').addEventListener('click', (e) => {
    const next = e.target.dataset && e.target.dataset.l;
    if (!next || next === lang) return;
    lang = next;
    localStorage.setItem('ak-lang', lang);
    renderAll();
    route(true);
  });
  window.addEventListener('hashchange', () => route());
  renderAll();
  route();
})();
