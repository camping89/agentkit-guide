# So sánh CoKit và AgentKit (Engineer Kit): báo cáo có dẫn chứng

- Ngày: 2026-09-26 (Asia/Saigon)
- Nguồn CoKit: `gh repo clone camping89/cokit /tmp/cokit-src`, HEAD `ae167eb chore(release): v1.5.1`. Site https://camping89.github.io/cokit/ chỉ trỏ về đúng repo này, không có upstream nào khác được liên kết công khai.
- Nguồn AgentKit: bản cài local `ak 2.18.1`, Engineer Kit `0.2.0`, runtime `claude-code`. Chỉ xét Engineer Kit, bỏ qua marketing.
- Quy ước: `CK:` là đường dẫn tương đối trong `/tmp/cokit-src`. `AK:` là đường dẫn tuyệt đối trên máy. `$CACHE` = `~/.agentkit/cache/kits/engineer/claude-code/2.18.1`.

## 1. Tóm tắt

- **Nhắm tới runtime khác nhau.** CoKit là gói nội dung cho **GitHub Copilot**: VS Code Copilot Chat và Copilot CLI, cài vào `.github/` hoặc `~/.copilot/`. AgentKit Engineer là kit trả phí (`tier: "paid"`) cho **Claude Code**, cài vào `~/.claude/`. CLI `ak` còn có emitter cho `codex`, `grok` và `portable`.
- **Chung một gốc ClaudeKit.** CoKit tự mô tả là port từ "ClaudeKit upstream": `CK:README.md:94-96`, `CK:docs/upstream-porting-rules.md`. AgentKit có lệnh `ak migrate` để "Migrate an existing ClaudeKit install" và tên file vẫn giữ tiền tố `ck-`, ví dụ `ck-config-utils.cjs`. Agent planner của hai bên mở đầu bằng cùng một câu "You are a **Tech Lead** locking architecture before code is written".
- **CoKit chỉ có nội dung tĩnh.** Không có hook, không có tầng trạng thái, và việc fan-out agent song song không được Copilot hỗ trợ (`CK:docs/upstream-porting-rules.md:30-33`). AgentKit có 8 loại sự kiện hook với khoảng 16 script chính: bơm context, chặn truy cập nhạy cảm, lưu checkpoint phiên. Ngoài ra có kho plan cục bộ (`ak plan`), cập nhật binary có chữ ký, backup/recover và audit drift.
- **Số lượng** (đếm bằng lệnh):
  - CoKit: 31 prompt, 13 agent, 31 skill (32 thư mục skill; `ck-common` không có `SKILL.md`), 5 instruction, 5 collection.
  - AgentKit Engineer: 102 skill và 16 agent (theo `install-manifest.json` và `kit.yaml`), 8 rule, 60 mục hook trong `kit.yaml` (kể cả file thư viện).
- **CoKit có nhiều chỗ không khớp nội bộ** (mục 4):
  - Có prompt gọi script không tồn tại.
  - Skill dựa vào "Plan Context injected by hooks" trong khi CoKit không có hook.
  - Thông báo cập nhật gợi ý cờ `-g` mà lệnh `init` không có.
  - `npx cokit` trỏ nhầm sang một gói npm khác.
  - `doctor` đòi file mà `init` không tạo.
  - Số liệu trên site tự mâu thuẫn.
- **Giấy phép.**
  - CoKit dùng CC BY-NC 4.0, cấm dùng thương mại và dùng nội bộ công ty.
  - AgentKit là kit trả phí, cần đăng nhập và license. Từng skill mang license riêng (49 MIT, 4 Apache-2.0, …; 87 skill không khai báo). Không xác minh được license tổng của AgentKit.

## 2. Bảng so sánh

| # | Tiêu chí | CoKit | Dẫn chứng CoKit | AgentKit Engineer | Dẫn chứng AgentKit |
|---|---|---|---|---|---|
| 1 | Runtime đích | GitHub Copilot: VS Code Copilot Chat và Copilot CLI ("CLI-first"). Cần Node ≥18. | `CK:package.json` (`"engines": {"node": ">=18.0.0"}`); `CK:docs/upstream-porting-rules.md:86` "CoKit ships **CLI-first** (`npx cokit-cli init` → GitHub Copilot)"; `CK:src/commands/init.js:91-92` "Open VS Code and start using Copilot… /ck-fix in Copilot Chat" | Claude Code (adapter `claude-code`). CLI có thể emit sang target khác. | `$CACHE/.agentkit-cache/manifest.json`: `'runtime': 'claude-code'`; `ak kit install --help`: `--target string  Emitter target ID … (e.g. claude-code,codex,grok) (default "claude-code")`; `ls ~/.agentkit/adapters/claude-code` → `engineer marketing` |
| 2 | Các tầng kiến trúc | 5 loại tài nguyên: Prompts (slash command), Agents, Skills, Instructions (áp theo glob `applyTo`), Collections. Kèm CLI `cokit` (Node/commander). Không có hook, không có rules được cài. | `CK:AGENTS.md:7-11` (liệt kê 5 loại); `CK:docs/copilot-processing-flow.md:11-17` (bảng Trigger); `CK:instructions/ck-frontend.instructions.md:3` `applyTo: '**/*.tsx,…'`; `git ls-files \| grep -i hook` → rỗng | Skills (`~/.claude/skills/ak-*`), Agents (`~/.claude/agents`), Hooks (`~/.claude/hooks/*.cjs` + `hooks.json`, đăng ký trong `settings.json`), Rules (`~/.claude/rules/*.md`), output-styles, statusline, scripts. Kèm CLI `ak` (binary). | `$CACHE/engineer/kit.yaml:6,39,161,178,181,192,397` (các mục `agents/hooks/rules/schemas/scripts/skills/statusline`); `AK:~/.claude/settings.json:414-416` (statusLine → `ak-engineer-statusline.cjs`); `ls ~/.claude/output-styles` → 6 file `coding-level-0..5` |
| 3 | Cài đặt | `npx cokit-cli init`, hỏi tương tác: Project (`.github/` + `.vscode/`) / Global (`~/.copilot/{agents,prompts,instructions,skills}`) / Both. Cờ `-y`, `--overwrite`. `cokit add <skill> [--local]` để cài từng skill. Chỉ là copy thư mục. | `CK:README.md:8-10`; `CK:src/commands/init.js:27-29` (options), `:39-48` (3 lựa chọn), `:131-172` (copy agents/prompts/instructions/skills; **không copy collections** khi cài global); `CK:src/utils/paths.js` (`~/.copilot/...`); `CK:src/commands/add.js:17-22` | `ak kit install engineer [-g] [--skills] [--exclude-skills] [--select-skills] [--channel] [--target]`. Tải từ registry có xác thực (artifact trên R2, có `sha256` + `signature`), ghi manifest và hash để phát hiện drift, backup trước khi cài. | `ak kit install --help` (các cờ `--global`, `--remote … authenticated remote registry`, `--no-backup … skip pre-install recovery snapshots`); `$CACHE/.agentkit-cache/manifest.json` (`artifact` gồm `sha256`, `signature`; `resolvedFrom: core 0.1.0 + engineer 0.2.0`); `AK:~/.agentkit/adapters/claude-code/engineer/.agentkit/install-manifest.json:2-4,5-33` |
| 4 | Cập nhật | `cokit update` chỉ in hướng dẫn "npx always fetches latest" và bảo chạy lại `init --overwrite`. Có update-checker gọi npm registry, cache 24h ở `~/.cokit/update-check.json`. | `CK:src/commands/update.js` (toàn file, dòng `info('CoKit is distributed via npx - it always uses the latest version.')`); `CK:src/utils/update-checker.js` (`CACHE_DIR = ~/.cokit`, `CHECK_INTERVAL_MS = 24h`, `NPM_REGISTRY_URL`) | `ak update` (wizard: self-update binary có chữ ký → kit global → kit project; bỏ qua file người dùng đã sửa; snapshot trước khi thay đổi), `ak self-update` (kênh dev/beta/stable), `ak audit`, `ak backups`, `ak recover`. | `ak update --help` ("Clean files are overwritten; user-modified files are skipped… A pre-update project snapshot is taken"); `ak self-update --help` ("Check or apply signed AgentKit binary updates"); `ak --help` (mục Inspect & diagnose: `audit`, `backups`, `recover`) |
| 5 | Số skill | 31 `SKILL.md` / 32 thư mục (`ck-common` là thư mục dùng chung, không có `SKILL.md`). README ghi 31; `docs/copilot-processing-flow.md` ghi 30. | Lệnh `ls skills/*/SKILL.md \| wc -l` → `31`; `ls -d skills/*/ \| wc -l` → `32`; `CK:README.md:81`; `CK:docs/copilot-processing-flow.md:25` | **102** skill trong Engineer Kit (trên đĩa có 144 `ak-*`; 42 skill còn lại thuộc kit marketing). | `install-manifest.json:141-142` `"selected_count": 102, "total_count": 102`; `kit.yaml` đếm mục `skills` = 102; script so sánh: `manifest 102 disk 144`, `on disk, not in engineer manifest: 42` |
| 6 | Số agent | 13 (`ck-*.agent.md`). Site ghi 12 ở hero, 13 ở chỗ khác. | `ls agents/*.agent.md \| wc -l` → `13`; `CK:index.html:1220` (`stat-num` 12) vs `:1321` (13 agents) | **16**: advisor, brainstormer, code-reviewer, code-simplifier, debugger, docs-manager, Explore, fullstack-developer, git-manager, journal-writer, kongming, planner, project-manager, researcher, tester, ui-ux-designer. (`~/.claude/agents` có 35 file, gồm cả agent marketing.) | `$CACHE/engineer/kit.yaml:6-38`; `native-skill-paths.json` → `engineer … agents 16`; `ls ~/.claude/agents \| wc -l` → `35` |
| 7 | Số prompt/lệnh | 31 prompt `ck-*.prompt.md`; site hero ghi 27. | `ls prompts/*.prompt.md \| wc -l` → `31`; `CK:index.html:1216` (27) vs `:1307` (31) | Không có tầng prompt riêng: skill `user-invocable: true` đóng vai slash command `/ak:<name>`. | `AK:~/.claude/skills/ak-cook/SKILL.md:2` `name: ak:cook`; các file `ak-*/SKILL.md` đều có `user-invocable: true` ở dòng 4 (xem `ak-agentkit`, `ak-cook`, `ak-plan`, …) |
| 8 | Xử lý một yêu cầu | Người dùng gõ `/ck-xxx` → prompt (`${input}`) → prompt tự định tuyến bằng cây quyết định từ khóa sang prompt con, rồi nhờ agent bằng ngôn ngữ tự nhiên. Instruction tự áp theo glob. Skill tự nạp theo ngữ cảnh. Không có vòng đời hook. | `CK:docs/copilot-processing-flow.md:11-17`; `CK:prompts/ck-fix.prompt.md:7-36` (cây quyết định A–G); `CK:prompts/ck-plan.prompt.md:18-30`; `CK:docs/upstream-porting-rules.md` §3 "`Task(subagent_type="X")` → Natural language delegation" | Vòng đời hook của Claude Code: **SessionStart** (`session-init`) → **UserPromptSubmit** (`secret-output-guardrail`, `simplify-gate`, `dev-rules-reminder`, `usage-quota-cache-refresh`) → **PreToolUse** (`descriptive-name`, `privacy-block`, `scout-block`, `context-firewall`) → **PostToolUse** (`dev-rules-reminder`, `plan-format-kanban`, `session-state`, `agent-behavior-linter`) → **SubagentStart** (`subagent-init`, `team-context-inject`) / **SubagentStop** → **Stop** (`cook-after-plan-reminder`, `session-state`) → **PreCompact** (`precompact-capture`). Việc định tuyến do skill `ak:agentkit` và rule `skill-domain-routing.md` đảm nhận. | `AK:~/.agentkit/adapters/claude-code/engineer/.agentkit/native-hook-expectations.json` (bảng event→script in ở mục 5, lệnh 13); `AK:~/.claude/skills/ak-agentkit/SKILL.md:14-39` ("Return one concrete route to an installed owner…"); `AK:~/.claude/rules/skill-domain-routing.md:7,16` |
| 9 | Skill quy trình: plan | `/ck-plan` định tuyến sang `/ck-plan-fast`, `/ck-plan-hard`, `/ck-plan-validate`, `/ck-plan-red-team`. Cờ upstream `--hard/--fast` bị tách thành prompt riêng. | `CK:prompts/ck-plan.prompt.md:18-30`; `CK:docs/upstream-porting-rules.md:65-66` "Flag → separate command" | `/ak:plan [task] [--fast\|--hard\|--deep\|--parallel\|--two\|--debate\|--ultra] [--tdd\|--no-tasks] [--html] [--github] [--wiki] [--advice] [--yagni] … OR [archive\|red-team\|validate]`, cộng CLI `ak plan` (parse/validate/kanban/store). | `AK:~/.claude/skills/ak-plan/SKILL.md:8`; `ak plan --help` |
| 10 | Skill quy trình: cook | `/ck-cook` phát hiện ý định từ **từ khóa** ("fast", "trust me", "no test"…); skill `ck-cook` có `argument-hint` kèm cờ. Có cổng review, auto-approve khi score ≥9.5. | `CK:prompts/ck-cook.prompt.md:13-22,33-40,56-59`; `CK:skills/ck-cook/SKILL.md:4` `[--interactive\|--fast\|--parallel\|--auto\|--no-test] [--tdd]` | `/ak:cook [task\|plan-path] [--interactive\|--fast\|--parallel\|--auto\|--no-test] [--tdd] [--advice] [--yagni] [--skip-journal]`; `--yagni` là opt-in; có bước journal (opt-out). | `AK:~/.claude/skills/ak-cook/SKILL.md:8,27-45,64` |
| 11 | Skill quy trình: fix | `/ck-fix` định tuyến sang 7 prompt con: `ck-fix-types/-ui/-ci/-test/-logs/-hard/-fast`. | `CK:prompts/ck-fix.prompt.md:17-36`; `ls prompts` | `/ak:fix [issue] --auto\|--review\|--quick\|--parallel [--ultra] [--advice] [--skip-journal]` (một skill dùng cờ). | `AK:~/.claude/skills/ak-fix/SKILL.md:8` |
| 12 | Skill quy trình: review | `/ck-review`: 2 researcher song song + nhiều `ck-code-reviewer` song song + planner. Mô tả này trái với giới hạn "Parallel agent fan-out NOT supported" do chính dự án ghi. | `CK:prompts/ck-review.prompt.md:24,30,36`; `CK:docs/upstream-porting-rules.md:30` | `/ak:code-review [#PR \| COMMIT \| --pending \| codebase [parallel]] [--ultra] [--advice] [--yagni]`; thêm `ak:review-pr`, agent `code-reviewer`. | `AK:~/.claude/skills/ak-code-review/SKILL.md:8`; `kit.yaml:33-34` |
| 13 | Skill quy trình: git/ship | `/ck-git cm\|cp\|pr\|merge`; quét secret bằng `grep`; prompt `ck-ship`. | `CK:prompts/ck-git.prompt.md:4,14-19,32-37`; `ls prompts` → `ck-ship.prompt.md` | `/ak:git cm\|cp\|pr\|merge\|merge-pr\|stack`; `/ak:ship [official\|beta…] [--merge] [--skip-tests] … [--dry-run]`. | `AK:~/.claude/skills/ak-git/SKILL.md:8`; `AK:~/.claude/skills/ak-ship/SKILL.md:8` |
| 14 | Kiểu tham số | Prompt nhận văn bản tự do qua `${input}`, đổi từ `$ARGUMENTS`. Biến thể là **prompt riêng** nối bằng gạch ngang (`/fix:types` → `/ck-fix-types`). Chế độ đoán từ từ khóa. | `CK:docs/upstream-porting-rules.md:51,63-66`; `CK:prompts/ck-cook.prompt.md:9,15-22` | Cờ kiểu POSIX `--flag` trong `argument-hint`. Tên có namespace `ak:`. Có cờ chung giữa các skill: `--advice`, `--yagni`, `--ultra`, `--skip-journal`. | `ak-cook/SKILL.md:8`, `ak-plan/SKILL.md:8`, `ak-fix/SKILL.md:8`, `ak-code-review/SKILL.md:8` |
| 15 | Phiên/trạng thái | **Không có** cơ chế trạng thái. Copilot không có persistent memory, plan mode hay task API; trường `memory:` bị gỡ khi port. Chỉ có cache update-check ở `~/.cokit`. | `CK:docs/upstream-porting-rules.md:32-33,89`; `CK:src/utils/update-checker.js` (`~/.cokit/update-check.json`) | Hook `session-state.cjs` làm mới snapshot statusline ở PostToolUse/SubagentStop và gọi `persistProjectCheckpoint` khi Stop. Trạng thái nằm ở `~/.agentkit/session-states/v2/<runtime>/<projectKey>/{checkpoints,revisions}`. Có `precompact-capture`, `ak sessions`, kho plan `~/.agentkit/plans/plans.db`. Agent khai báo `memory: project`. | `AK:~/.claude/hooks/session-state.cjs:17,30-36`; `AK:~/.claude/hooks/lib/project-handoff-store.cjs:53-58`; `ls ~/.agentkit/plans` → `plans.db`; `AK:~/.claude/agents/planner.md:5` `memory: project` |
| 16 | Quy ước docs/plans | Plan ở `./plans/<YYMMDD-HHmm>-<slug>/` với `plan.md` + `phase-XX-*.md` + `reports/`. Docs chuẩn: `codebase-summary.md`, `code-standards.md`, `system-architecture.md`, `project-overview-pdr.md`. | `CK:skills/ck-planning/references/plan-organization.md:9` (`plans/251101-1505-authentication/`), `:17-21`; `CK:skills/ck-planning/SKILL.md:12,276-278`; `CK:prompts/ck-plan-hard.prompt.md:49`; `CK:prompts/ck-review.prompt.md:38-39` | Mặc định `namingFormat: '{date}-{issue}-{slug}'`, `dateFormat: 'YYMMDD-HHmm'`, `reportsDir: 'reports'`, `paths.docs: 'docs'`. Hook bơm các mục `## Plan Context` / `## Naming` vào phiên và subagent. Rule `documentation-management.md` **không** áp layout docs cố định. | `AK:~/.claude/hooks/lib/ck-config-utils.cjs:20-40`; `AK:~/.claude/hooks/lib/context-builder.cjs:563,585-587`; `AK:~/.claude/hooks/subagent-init.cjs:197-202,218-222`; `AK:~/.claude/rules/documentation-management.md` ("Do not assume a fixed filename list or docs tree") |
| 17 | License/phân phối | CC BY-NC 4.0 (cấm thương mại và dùng nội bộ công ty). Phân phối miễn phí qua npm `cokit-cli` (maintainer `camping89`) và repo public. GitHub API báo license là "Other". | `CK:LICENSE:1,15-16,26-29`; `CK:package.json` `"license": "CC-BY-NC-4.0"`; `npm view cokit-cli` → `"license": "CC-BY-NC-4.0"`, `latest 1.5.1`; `gh repo view` → `"licenseInfo":{"key":"other"}` | Kit **trả phí**, cần login/license, tải từ registry có xác thực. License của từng skill khác nhau. Repo `bestagentkits/agentkit` (ghi trong `ak --help`) **không truy cập được** từ tài khoản hiện tại; license tổng: **unverified**. | `$CACHE/engineer/kit.yaml:4` `tier: "paid"`; `ak licenses` → `engineer (active)`; `ak --help` (mục Account: `licenses`, `login`, `whoami`); `grep -h '^license:' ak-*/SKILL.md \| uniq -c` → 49 MIT, 4 Apache-2.0, 3 "Complete terms in LICENSE.txt", 1 Apache+MIT; 87 không có trường này; `gh repo view bestagentkits/agentkit` → "Could not resolve to a Repository" |
| 18 | Tính năng riêng | (a) Cài 2 phạm vi project `.github/` và global `~/.copilot/`, chia sẻ qua git. (b) Instruction theo glob file. (c) Collections YAML. (d) Template `.vscode/settings.json`. (e) Pipeline đồng bộ upstream ClaudeKit (`eng/sync.mjs`, `resource-origins.yml`). (f) Slide đào tạo PDF EN/VI. (g) `cokit add` cài từng skill. | `CK:src/commands/init.js:44-46`; `CK:instructions/*.instructions.md` (`applyTo`); `CK:collections/ck-core.collection.yml`; `CK:templates/repo/.vscode/settings.json`; `CK:eng/resource-origins.yml:1-12`; `CK:docs/Skills  Orchestration Layer - Training Slides - {en,vi}.pdf`; `CK:src/commands/add.js:17-22` | (a) Hook bảo vệ: `privacy-block`, `scout-block` (chặn truy cập `node_modules`/`dist`…), `context-firewall` (giới hạn lượng context mỗi lần gọi tool), `secret-output-guardrail`, `simplify-gate` (chặn ship khi diff lớn chưa simplify). (b) Agent `kongming`/`advisor` để hỏi ý kiến model mạnh. (c) 6 output-style "coding level". (d) Statusline. (e) Thông báo Telegram/Discord/Slack. (f) Kho plan + kanban. (g) `ak orchestrate`, `eval`, `insights`, `audit`, `recover`. (h) Emitter đa target. | `AK:~/.claude/hooks/scout-block.cjs:3-12`; `AK:~/.claude/hooks/context-firewall.cjs:3-13`; `AK:~/.claude/hooks/simplify-gate.cjs:3-9`; `AK:~/.claude/hooks/secret-output-guardrail.cjs:3-4`; `kit.yaml:17-18,27-28`; `ls ~/.claude/output-styles`; danh sách `hooks/notifications/providers/{telegram,discord,slack}.cjs` trong `native-skill-paths.json`; `ak --help` |
| 19 | Rules | Thư mục `rules/` chỉ là hướng dẫn viết file cho người đóng góp (tiếng Việt). Không có trong `files` của `package.json`, nên không được cài. Tầng tương đương rule là 5 file `instructions` theo glob. | `CK:rules/README.md:1-3` ("Rules để tạo và verify các file types cho GitHub Copilot"); `CK:package.json` (`files` không có `rules/`) | 8 rule toàn cục trong `~/.claude/rules/`: development-rules, documentation-management, orchestration-protocol, primary-workflow, process-management, review-audit-self-decision, skill-domain-routing, skill-workflow-routing. | `ls ~/.claude/rules \| wc -l` → `8`; `kit.yaml` mục `rules` = 8 |
| 20 | Gốc chung ClaudeKit | Tự nhận là port từ ClaudeKit: gỡ phần chỉ dành cho Claude (artifact-gate hook, chrome-profile…); đổi `subagent` → `agent`, `.claude/` → `$HOME/.copilot/`. | `CK:README.md:94-96`; `CK:docs/upstream-porting-rules.md:51-56`; mô tả repo "inspired by Speckit, Superpower and Claude Kit" (`gh repo view`) | Có lệnh migrate từ ClaudeKit, cơ chế "ClaudeKit takeover", tên file giữ tiền tố `ck-`. Agent planner có cùng câu mở đầu với `ck-planner` của CoKit. | `ak --help` ("migrate  Migrate an existing ClaudeKit install to AgentKit"); `ak kit install --help` (`--no-backup … also skip ClaudeKit takeover`); `install-manifest.json:11` (`ck-config.schema.json`); `AK:~/.claude/agents/planner.md:9` vs `CK:agents/ck-planner.agent.md:6` (cùng câu "You are a **Tech Lead** locking architecture before code is written") |

## 3. Nhận định

- CoKit hợp với nhóm dùng Copilot cần bộ prompt/agent kiểu ClaudeKit miễn phí, cho mục đích phi thương mại. Nó phụ thuộc hoàn toàn vào việc Copilot tự tuân theo văn bản, không có tầng thực thi như hook hay trạng thái.
- AgentKit Engineer là nền tảng vận hành đầy đủ hơn cho Claude Code: hook cưỡng chế, trạng thái phiên, kho plan, cập nhật có chữ ký. Đổi lại, nó trả phí và độ phức tạp cao hơn nhiều: 102 skill, 60 mục hook.

## 4. Các khẳng định sai hoặc chưa chắc chắn

### Sai (có bằng chứng)

1. **Số liệu trên site CoKit tự mâu thuẫn.** Hero ghi 27 prompt / 12 agent / 23 skill (`CK:index.html:1216,1220,1224`), phần dưới ghi 31/13/31 (`:1307,1321,1335`). Thực đếm được 31/13/31.
2. **`docs/copilot-processing-flow.md` lỗi thời.**
   - Ghi "Skills (30 total)" (`:25`), thực tế 31.
   - Ví dụ frontmatter dùng `mode: agent` (`:42`), trong khi prompt thật dùng `agent: 'agent'` (`CK:prompts/ck-fix.prompt.md:2`).
   - Nhắc lệnh `/ck-review-codebase` (`:60`), lệnh này không tồn tại: `ls prompts | grep -c review-codebase` → `0`.
3. **Thông báo cập nhật của CoKit gợi ý `npx cokit-cli@latest init -g`** (`CK:src/utils/update-checker.js`, hàm `showUpdateNotification`). Lệnh `init` không có cờ `-g`, chỉ có `-y` và `--overwrite` (`CK:src/commands/init.js:27-29`).
4. **`cokit update` và `cokit add` bảo chạy `npx cokit …`** (`CK:src/commands/update.js`, `CK:src/commands/add.js`, dòng `hint('Run: npx cokit add <skill-name>')`). Trên npm, gói `cokit` là một gói khác: `npm view cokit` → `version 0.5.4`, maintainer `imcoka`, mô tả "打包程序！". Gói đúng là `cokit-cli`, maintainer `camping89`.
5. **Prompt CoKit gọi script không được phân phối.** `node $HOME/.copilot/scripts/set-active-plan.cjs` (`CK:prompts/ck-plan-hard.prompt.md:43`, `ck-plan-fast.prompt.md:43`) và `python $HOME/.copilot/scripts/ck-help.py` (`CK:prompts/ck-help.prompt.md:38`). `git ls-files | grep -E 'ck-help|\.cjs$'` chỉ ra file prompt, không có script nào. `init` cũng không tạo `~/.copilot/scripts`. Ngược lại, AgentKit có ship `set-active-plan.cjs` (`install-manifest.json:19`).
6. **CoKit dựa vào "`## Plan Context` injected by hooks"** (`CK:skills/ck-planning/SKILL.md:269`, và 5 prompt `ck-plan*`), nhưng repo không có hook nào (`git ls-files | grep -i hook` → rỗng). Bên AgentKit, context này do `lib/context-builder.cjs:563` tạo ra.
7. **`cokit doctor` báo lỗi nếu thiếu `.github/copilot-instructions.md`** (`CK:src/commands/doctor.js:23-29`), nhưng template `init` không chứa file này (`git ls-files | grep copilot-instructions` chỉ có `rules/README.copilot-instructions.md`). `doctor` cũng đòi `github.copilot.chat.useAgentSkills` (`:94-98`), mà template `.vscode/settings.json` không có key này.
8. **Collections tham chiếu tên agent cũ** chưa có tiền tố `ck-`: `agents/planner.agent.md` (`CK:collections/ck-core.collection.yml:8`, `ck-orchestration.collection.yml:6`), trong khi file thật là `agents/ck-planner.agent.md`. Cài global cũng không copy collections (`init.js:131-172`).
9. **`package.json` scripts `convert:*`, `rewrite`, `clean` trỏ tới `eng/convert-agents.mjs`, `convert-commands.mjs`, `convert-skills.mjs`, `rewrite-single-agent.mjs`, `clean-references.mjs`.** Cả 5 file đều MISSING. `AGENTS.md` vẫn hướng dẫn `npm run convert:all`.
10. **`/ck-review` yêu cầu chạy agent song song** (`CK:prompts/ck-review.prompt.md:24,30`), trái với chính bảng khả năng "Parallel agent fan-out | NOT supported" (`CK:docs/upstream-porting-rules.md:30`).
11. **`ak agents list` (và `--json`) trả về danh sách rỗng** (`"agents": []`), dù `kit.yaml` khai báo 16 agent và file có trên đĩa. Vì vậy phải đếm agent qua `kit.yaml` và `native-skill-paths.json`, không đếm được qua lệnh này. `ak kit list-kits` thì trả về "Error: Command failed."

### Chưa chắc chắn / unverified

- License tổng của sản phẩm AgentKit: unverified. Repo `bestagentkits/agentkit` không truy cập được; chỉ có `tier: "paid"` và license cấp skill.
- Engineer Kit có 102 skill nhưng một số có vẻ nghiêng marketing/sáng tạo (`ak-copywriting`, `ak-design`, `ak-ai-artist`). Chúng vẫn được tính vì nằm trong manifest Engineer. Việc phân loại "marketing" ở đây dựa trên manifest, không dựa trên nội dung.
- Cơ chế Claude Code tự nạp `~/.claude/rules/*.md`: không chứng minh được từ file của kit. Chỉ quan sát thấy các rule này được nạp vào ngữ cảnh phiên hiện tại.
- Copilot có thực sự tự nạp skill trong `~/.copilot/skills` "Auto by context" hay không (`CK:docs/copilot-processing-flow.md:16`): unverified, không kiểm thử trên Copilot.
- Gói npm `cokit-cli@1.5.1` có khớp 100% với repo HEAD không: unverified. Đã khớp version và license, nhưng chưa tải tarball để so.
- `~/.claude/settings.json` còn có hook không thuộc Engineer Kit: `gh-account-hook.cjs`, `post-edit-simplify-reminder.cjs`, sự kiện `SessionEnd`. Các hook này không được tính vào AgentKit (không có trong `native-hook-expectations.json`).
- Version: kit Engineer là `0.2.0` (`kit.yaml:2`), trong khi thư mục cache/registry là `2.18.1` (trùng version CLI). Hai con số được đánh độc lập; ý nghĩa chính xác: unverified.

## 5. Lệnh đã dùng (chính xác)

```bash
# CoKit: tìm và clone repo
gh repo view camping89/cokit --json name,description,url,licenseInfo,homepageUrl,defaultBranchRef,isFork,parent
gh search repos cokit --owner camping89
gh repo clone camping89/cokit /tmp/cokit-src -- --depth 50
cd /tmp/cokit-src && git log --oneline | head -5        # ae167eb chore(release): v1.5.1
# (WebFetch https://camping89.github.io/cokit/: footer chỉ link github.com/camping89/cokit, CC BY-NC 4.0)

# CoKit: đếm tài nguyên
cd /tmp/cokit-src && echo "prompts: $(ls prompts/*.prompt.md | wc -l)"     # 31
echo "agents: $(ls agents/*.agent.md | wc -l)"                             # 13
echo "skill dirs: $(ls -d skills/*/ | wc -l)"                               # 32
echo "SKILL.md: $(ls skills/*/SKILL.md | wc -l)"                            # 31 (thiếu: skills/ck-common/)
echo "instructions: $(ls instructions/*.md | wc -l)"                        # 5
echo "collections: $(ls collections/*.yml | wc -l)"                         # 5

# CoKit: kiểm chứng các điểm không khớp
git ls-files | grep -i -E 'set-active-plan|hook'                           # (rỗng)
git ls-files | grep -E 'ck-help|\.cjs$'                                     # chỉ có prompts/ck-help.prompt.md
git ls-files | grep copilot-instructions                                    # rules/README.copilot-instructions.md
ls prompts | grep -c review-codebase                                        # 0
for f in convert-agents convert-commands convert-skills rewrite-single-agent clean-references; do [ -f eng/$f.mjs ] && echo "$f present" || echo "$f MISSING"; done   # tất cả MISSING
grep -n -E 'Command\(|option\(|description\(' src/commands/*.js
sed -n 1214,1226p index.html                                                # hero 27/12/23
npm view cokit-cli version license dist-tags --json                         # 1.5.1, CC-BY-NC-4.0
npm view cokit-cli maintainers                                              # camping89
npm view cokit name version; npm view cokit repository.url maintainers description   # 0.5.4, imcoka, 打包程序！

# AgentKit: CLI và manifest
ak --version                                                                 # ak 2.18.1
ak --help
ak kit install --help ; ak update --help ; ak self-update --help ; ak plan --help ; ak sessions --help ; ak licenses --help
ak licenses                                                                  # engineer (active), marketing (active)
ak agents list --json                                                        # {"data":{"agents":[]}}
ak kit list-kits                                                             # Error: Command failed.
cat -n ~/.agentkit/adapters/claude-code/engineer/.agentkit/install-manifest.json   # kit_version 0.2.0, selected_count 102
cat -n ~/.agentkit/cache/kits/engineer/claude-code/2.18.1/engineer/kit.yaml        # tier: "paid"
gh repo view bestagentkits/agentkit --json visibility,licenseInfo,description      # Could not resolve to a Repository

# AgentKit: đếm skill (manifest so với đĩa)
cd ~/.claude/skills; ls -d ak-*/ | wc -l                                     # 144
python3 - <<'EOF'
import json,os
d=json.load(open(os.path.expanduser('~/.agentkit/adapters/claude-code/engineer/.agentkit/install-manifest.json')))
m=set(d['skill_selection']['skills'])
disk=set(x for x in os.listdir('.') if x.startswith('ak-') and os.path.isfile(os.path.join(x,'SKILL.md')))
print('manifest',len(m),'disk',len(disk)); print(sorted(m-disk)); print(len(disk-m))
EOF
# -> manifest 102 disk 144 ; missing [] ; 42 skill ngoài Engineer (marketing)

# AgentKit: đếm các mục export trong kit.yaml
python3 - <<'EOF'
import re
t=open('engineer/kit.yaml').read(); sec=None; c={}
for l in t.splitlines():
  m=re.match(r'^  ([a-z_]+):',l)
  if m: sec=m.group(1); continue
  if re.match(r'^    - name:',l) and sec: c[sec]=c.get(sec,0)+1
print(c)
EOF
# (chạy trong ~/.agentkit/cache/kits/engineer/claude-code/2.18.1)
# -> {'agents': 16, 'hooks': 60, 'rules': 8, 'schemas': 1, 'scripts': 5, 'skills': 102, 'statusline': 1}

# AgentKit: agent theo kit (từ native-skill-paths.json)
# engineer total 1721 agents 16 ; marketing agents 29
ls ~/.claude/agents | wc -l                                                  # 35
ls ~/.claude/rules | wc -l                                                   # 8

# AgentKit: bảng hook event -> script
python3 - <<'EOF'
import json,os
d=json.load(open(os.path.expanduser('~/.agentkit/adapters/claude-code/engineer/.agentkit/native-hook-expectations.json')))
for ev,groups in d['manifest']['hooks'].items():
  for g in groups:
    for h in g['hooks']:
      print(f"{ev:18} matcher={g.get('matcher','-'):32} {os.path.basename(h['args'][-1])}")
EOF

# AgentKit: license theo skill
grep -rh -m1 '^license:' ak-*/SKILL.md | sort | uniq -c                      # 49 MIT, 4 Apache-2.0, 3 LICENSE.txt, 1 Apache+MIT
for f in ak-*/SKILL.md; do grep -q '^license:' $f || echo $f; done | wc -l   # 87
grep -n -m3 -E '^(name|argument-hint|license):' ak-{agentkit,cook,plan,fix,code-review,git,ship}/SKILL.md
```

## Câu hỏi còn mở

- AgentKit có kênh phân phối hoặc license công khai nào khác repo `bestagentkits/agentkit` không? Cần người có quyền truy cập xác nhận.
- Có nên đưa "core kit 0.1.0" (mà Engineer mở rộng theo `resolvedFrom`) vào phạm vi so sánh không? Báo cáo này chỉ tính những gì `kit.yaml` của Engineer export.
