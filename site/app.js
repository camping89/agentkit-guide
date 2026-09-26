(() => {
  const D = window.AK_DATA, C = window.AK_CONTENT;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const code = (s) => `<code>${esc(s)}</code>`;

  const skillById = Object.fromEntries(D.skills.map((s) => [s.id, s]));
  const groupOf = {};
  D.groups.forEach((g) => g.skills.forEach((k) => (groupOf['ak-' + k] = g)));
  const kitOf = (s) => (groupOf[s.id] ? groupOf[s.id].kit : 'other');
  const detail = (id) => D.detail[id] || {};
  const cmd = (id) => (id.startsWith('ak-') ? '/ak:' + id.slice(3) : '/' + id);
  const skillLink = (id) => (skillById[id] ? `<a href="#/skill/${id}">${esc(cmd(id))}</a>` : esc(id));
  // Liên kết hóa các tên skill dạng /ak:xxx hoặc ak-xxx trong text đã escape.
  const linkify = (html) =>
    html.replace(/(\/ak:|\bak-)([a-z0-9-]+[a-z0-9])/g, (m, p, name) => (skillById['ak-' + name] ? `<a href="#/skill/ak-${name}">${m}</a>` : m));

  const akSkills = D.skills.filter((s) => s.id.startsWith('ak-'));

  // ---------- Home stats ----------
  const uniqueHooks = new Set(D.hooks.map((h) => h.script)).size;
  $('#homeStats').innerHTML = [
    [akSkills.length, 'skills AgentKit'],
    [D.agents.length, 'agents'],
    [uniqueHooks, 'hook scripts'],
    [new Set(D.hooks.map((h) => h.event)).size, 'sự kiện lifecycle'],
    [D.rules.length, 'rules'],
    [new Set(akSkills.flatMap((s) => s.flags)).size, 'flag khác nhau'],
  ].map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('');
  $('#verBadge').textContent = `${akSkills.length} skills`;

  // ---------- Hooks ----------
  const byScript = {};
  D.hooks.forEach((h) => {
    const k = h.script;
    byScript[k] = byScript[k] || { script: k, doc: h.doc, regs: [] };
    byScript[k].regs.push(`${h.event}${h.matcher && h.matcher !== '*' ? ` (${h.matcher})` : ''}`);
  });
  const hookVi = {
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
  };
  $('#hooksTable').innerHTML = `<table><tr><th>Script</th><th>Đăng ký ở sự kiện</th><th>Làm gì</th><th>Tắt bằng</th></tr>${Object.values(byScript)
    .map((h) => `<tr><td>${code(h.script)}</td><td>${[...new Set(h.regs)].map(esc).join('<br>')}</td><td>${esc(hookVi[h.script] || h.doc)}</td><td>${code('hooks.' + h.script.replace('.cjs', '') + ': false')}</td></tr>`)
    .join('')}</table>`;

  // ---------- Rules ----------

  // ---------- Agents ----------
  const usedBy = {};
  Object.entries(D.detail).forEach(([sid, d]) => (d.agents || []).forEach((a) => {
    const k = String(a).toLowerCase().replace(/[`\s].*$/, '');
    (usedBy[k] = usedBy[k] || new Set()).add(sid);
  }));
  const renderAgents = () => {
    const q = $('#agentFilter').value.toLowerCase();
    $('#agentsGrid').innerHTML = D.agents
      .filter((a) => !q || (a.id + a.description + a.model).toLowerCase().includes(q))
      .map((a) => {
        const users = [...(usedBy[a.id] || [])];
        return `<div class="card agent"><div class="row"><h3>${esc(a.id)}</h3><span class="model m-${esc(a.model)}">${esc(a.model || 'inherit')}</span></div>
        <p>${esc(a.description.replace(/\s*Examples?:.*$/s, '').slice(0, 420))}</p>
        ${a.tools ? `<p class="muted small">Tools: ${esc(a.tools)}</p>` : ''}
        ${users.length ? `<p class="small">Được dùng bởi: ${users.map(skillLink).join(', ')}</p>` : ''}</div>`;
      }).join('');
  };
  $('#agentFilter').addEventListener('input', renderAgents);
  renderAgents();

  // ---------- Skills list ----------
  const gf = $('#groupFilter');
  D.groups.forEach((g) => gf.insertAdjacentHTML('beforeend', `<option value="${g.id}">${esc(g.label)}</option>`));
  const skillCard = (s) => {
    const d = detail(s.id);
    const common = C.common.includes(s.id);
    return `<a class="card skill" href="#/skill/${s.id}">
      <div class="row"><h3>${esc(cmd(s.id))}</h3>${common ? '<span class="badge">HAY DÙNG</span>' : ''}</div>
      <p>${esc(d.tagline || s.whenToUse || s.description).slice(0, 220)}</p>
      ${s.argumentHint ? `<div class="hint">${esc(s.argumentHint)}</div>` : ''}</a>`;
  };
  const renderSkills = () => {
    const q = $('#skillFilter').value.toLowerCase().trim();
    const g = gf.value, kit = $('#kitFilter').value, co = $('#commonOnly').checked;
    const list = D.skills.filter((s) => {
      const grp = groupOf[s.id];
      if (g === 'other' ? grp : g && (!grp || grp.id !== g)) return false;
      if (kit && kitOf(s) !== kit) return false;
      if (co && !C.common.includes(s.id)) return false;
      if (!q) return true;
      const d = detail(s.id);
      return [s.id, s.description, s.whenToUse, s.argumentHint, d.tagline, d.summary, (s.keywords || []).join(' ')].join(' ').toLowerCase().includes(q);
    });
    $('#skillCount').textContent = `${list.length} skill`;
    const groups = D.groups;
    $('#skillsGrid').innerHTML = groups.map((grp) => {
      const items = list.filter((s) => (groupOf[s.id] ? groupOf[s.id].id : 'other') === grp.id);
      return items.length ? `<h2>${esc(grp.label)} <span class="muted">(${items.length})</span></h2><div class="cards">${items.map(skillCard).join('')}</div>` : '';
    }).join('');
  };
  ['skillFilter', 'groupFilter', 'kitFilter', 'commonOnly'].forEach((id) => $('#' + id).addEventListener('input', renderSkills));
  renderSkills();

  // ---------- Skill detail ----------
  const list = (arr, cls = '') => (arr && arr.length ? `<ul class="${cls}">${arr.map((x) => `<li>${linkify(esc(x))}</li>`).join('')}</ul>` : '<p class="muted">—</p>');
  const renderSkill = (id) => {
    const s = skillById[id];
    if (!s) return ($('#skillDetail').innerHTML = `<p>Không tìm thấy skill ${esc(id)}.</p>`);
    const d = detail(id), grp = groupOf[id];
    const params = d.params && d.params.length
      ? `<table><tr><th>Tham số</th><th>Loại</th><th>Tác dụng</th></tr>${d.params.map((p) => `<tr><td>${code(p.name)}</td><td><span class="kind k-${esc(p.kind)}">${esc(p.kind)}</span></td><td>${linkify(esc(p.desc))}</td></tr>`).join('')}</table>`
      : s.flags.length ? `<p>${s.flags.map(code).join(' ')}</p>` : '<p class="muted">Không có flag. Chỉ truyền mô tả hoặc đối số tự do.</p>';
    const ex = (d.examples || []).map((e) => `<div class="ex"><code>${esc(e.cmd)}</code><span>${linkify(esc(e.note))}</span></div>`).join('');
    const chain = [...(s.follows || []).map((x) => `${skillLink(x)} → `), `<b>${esc(cmd(id))}</b>`, ...(s.precedes || []).map((x) => ` → ${skillLink(x)}`)].join('');
    $('#skillDetail').innerHTML = `
      <p class="crumbs"><a href="#/skills">Skills</a> / ${esc(grp ? grp.label : '')}</p>
      <h1>${esc(cmd(id))}</h1>
      <p class="lead">${linkify(esc(d.tagline || s.whenToUse || ''))}</p>
      <div class="meta">
        ${s.version ? `<span>v${esc(s.version)}</span>` : ''}${s.category ? `<span>${esc(s.category)}</span>` : ''}
        <span>kit: ${esc(kitOf(s))}</span>${s.userInvocable ? '<span>bạn gọi được bằng /</span>' : ''}${s.modelInvocable ? '<span>model tự kích hoạt được</span>' : '<span>chỉ gọi thủ công</span>'}
        <span>${s.lines} dòng SKILL.md</span>${s.references.length ? `<span>${s.references.length} references</span>` : ''}
      </div>
      ${s.argumentHint ? `<h2>Cú pháp</h2><pre><code>${esc(cmd(id))} ${esc(s.argumentHint)}</code></pre>` : ''}
      ${(s.follows.length || s.precedes.length) ? `<p class="chain">Vị trí trong workflow: ${chain}</p>` : ''}
      <h2>Tổng quan</h2><p>${linkify(esc(d.summary || s.description))}</p>
      <details class="orig"><summary>Mô tả gốc (frontmatter)</summary><p>${esc(s.description)}</p>${s.whenToUse ? `<p><i>when_to_use:</i> ${esc(s.whenToUse)}</p>` : ''}</details>
      ${d.howItWorks ? `<h2>Cách hoạt động</h2><ol class="how">${d.howItWorks.map((x) => `<li>${linkify(esc(x))}</li>`).join('')}</ol>` : ''}
      <h2>Tham số</h2>${params}
      ${ex ? `<h2>Ví dụ</h2><div class="examples">${ex}</div>` : ''}
      <div class="two-col">
        <div><h2>Nên dùng khi</h2>${list(d.useWhen, 'yes')}</div>
        <div><h2>Không nên dùng khi</h2>${list(d.avoidWhen, 'no')}</div>
      </div>
      ${d.tips ? `<h2>Mẹo</h2>${list(d.tips, 'tips')}` : ''}
      <div class="two-col">
        <div><h2>Subagent được spawn</h2>${list(d.agents)}</div>
        <div><h2>Artifact tạo ra</h2>${list(d.artifacts)}</div>
      </div>
      ${d.related && d.related.length ? `<h2>Skill liên quan</h2><p class="related">${d.related.map(skillLink).join(' · ')}</p>` : ''}
      ${s.references.length ? `<details><summary>File references (${s.references.length})</summary><p class="small">${s.references.map(code).join(' ')}</p></details>` : ''}
      ${s.sections.length ? `<details><summary>Các mục trong SKILL.md</summary><p class="small">${s.sections.map(esc).join(' · ')}</p></details>` : ''}`;
  };

  // ---------- Flag matrix ----------
  const flagCount = {};
  akSkills.forEach((s) => s.flags.forEach((f) => (flagCount[f] = (flagCount[f] || 0) + 1)));
  const topFlags = Object.entries(flagCount).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).map(([f]) => f);
  const withFlags = akSkills.filter((s) => s.flags.some((f) => topFlags.includes(f)));
  $('#flagMatrix').innerHTML = `<table class="matrix"><tr><th>Skill</th>${topFlags.map((f) => `<th><span>${esc(f)}</span></th>`).join('')}</tr>${withFlags
    .map((s) => `<tr><td>${skillLink(s.id)}</td>${topFlags.map((f) => `<td>${s.flags.includes(f) ? '●' : ''}</td>`).join('')}</tr>`).join('')}</table>
    <p class="muted small">Chỉ hiện flag có ở từ 2 skill trở lên. Flag riêng của từng skill xem ở trang chi tiết.</p>`;

  // ---------- Workflows ----------
  const renderWf = () => {
    const lv = $('#wfLevel').value;
    $('#workflowList').innerHTML = C.workflows.filter((w) => !lv || w.level === lv).map((w) => `
      <div class="wf" id="wf-${w.id}">
        <div class="row"><h2>${esc(w.title)}</h2><span class="lvl lvl-${esc(w.level)}">${esc(w.level)}</span><span class="muted">${esc(w.time)} · ${w.steps.length} bước</span></div>
        <p><b>Dùng khi:</b> ${esc(w.when)}</p>
        <ol class="wf-steps">${w.steps.map(([c, n]) => `<li><code>${linkify(esc(c))}</code>${n ? `<span>${linkify(esc(n))}</span>` : ''}</li>`).join('')}</ol>
        ${w.options.length ? `<p class="small"><b>Tùy chọn:</b> ${w.options.map((o) => linkify(esc(o))).join(' · ')}</p>` : ''}
      </div>`).join('');
  };
  $('#wfLevel').addEventListener('input', renderWf);
  renderWf();

  // ---------- Chooser ----------
  $('#chooserTable').innerHTML = `<table><tr><th>Tôi muốn…</th><th>Dùng</th><th>Phân biệt / thay thế</th></tr>${C.chooser
    .map(([w, id, n]) => `<tr><td>${esc(w)}</td><td>${skillLink(id)}</td><td>${linkify(esc(n))}</td></tr>`).join('')}</table>`;

  // ---------- CLI ----------
  $('#cliTables').innerHTML = C.cli.map((g) => `<h2>${esc(g.group)}</h2><table><tr><th>Lệnh</th><th>Làm gì</th><th>Subcommand / flag</th></tr>${g.rows
    .map(([c, w, f]) => `<tr><td>${code(c)}</td><td>${esc(w)}</td><td class="small">${esc(f)}</td></tr>`).join('')}</table>`).join('');

  $('#buildInfo').textContent = `Dữ liệu: ${akSkills.length} skills AgentKit (${Object.keys(D.detail).length} có diễn giải chi tiết), ${D.skills.length - akSkills.length} skill khác, ${D.agents.length} agents, ${uniqueHooks} hooks, ${D.rules.length} rules.`;

  // ---------- Global search ----------
  const index = [
    ...D.skills.map((s) => ({ t: cmd(s.id), s: detail(s.id).tagline || s.whenToUse || s.description, h: '#/skill/' + s.id, k: (s.id + ' ' + s.argumentHint + ' ' + s.description).toLowerCase() })),
    ...D.agents.map((a) => ({ t: 'agent: ' + a.id, s: a.description, h: '#/agents', k: (a.id + ' ' + a.description).toLowerCase() })),
    ...Object.keys(byScript).map((h) => ({ t: 'hook: ' + h, s: hookVi[h] || '', h: '#/hooks', k: h })),
    ...C.workflows.map((w) => ({ t: 'workflow: ' + w.title, s: w.when, h: '#/workflows', k: (w.title + w.when).toLowerCase() })),
  ];
  const sr = $('#searchResults'), gs = $('#globalSearch');
  gs.addEventListener('input', () => {
    const q = gs.value.toLowerCase().trim();
    if (!q) return (sr.hidden = true);
    const hits = index.filter((x) => x.k.includes(q) || x.t.toLowerCase().includes(q)).slice(0, 12);
    sr.innerHTML = hits.length ? hits.map((x) => `<a href="${x.h}"><b>${esc(x.t)}</b><span>${esc(String(x.s).slice(0, 110))}</span></a>`).join('') : '<div class="muted">Không có kết quả</div>';
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
  const route = () => {
    const [, page = 'home', arg] = location.hash.split('/');
    const target = page === 'skill' ? 'skill' : page;
    document.querySelectorAll('section[data-page]').forEach((s) => (s.hidden = s.dataset.page !== target));
    if (!document.querySelector(`section[data-page="${target}"]`)) $('section[data-page="home"]').hidden = false;
    if (page === 'skill') renderSkill(decodeURIComponent(arg || ''));
    document.querySelectorAll('.sidebar a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#/' + (page === 'skill' ? 'skills' : page)));
    toggleMenu(false);
    window.scrollTo(0, 0);
  };
  window.addEventListener('hashchange', route);
  route();
})();
