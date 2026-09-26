# AgentKit Guide (Engineer Kit)

Tài liệu tiếng Việt chi tiết về AgentKit Engineer Kit: các layer, vòng đời một prompt, hooks, rules, agents, 102 skill kèm tham số, workflow theo feature và mẹo sử dụng.

**Xem site:** https://camping89.github.io/agentkit-guide/

## Cấu trúc

- `site/`: website tĩnh (HTML/CSS/JS thuần), mở trực tiếp `site/index.html` cũng chạy.
- `data/skills.json`, `data/agents.json`, `data/groups.json`: metadata trích từ bản cài AgentKit.
- `data/detail/*.json`: diễn giải chi tiết từng skill.
- `scripts/extract.py`: trích metadata từ `~/.claude` (máy đã cài AgentKit).
- `scripts/build.py`: gộp dữ liệu thành `site/data.js`, chỉ giữ phạm vi Engineer.
- `scripts/smoke-test.mjs`: mở mọi route bằng Playwright và báo lỗi JS.

## Cập nhật sau khi `ak update`

```bash
npm run extract   # trích lại metadata từ ~/.claude
npm run build     # sinh site/data.js
npm test          # smoke test (cần `npm i` để có playwright)
```

Push lên `main` sẽ tự deploy GitHub Pages.

Nguồn tham khảo: bản cài AgentKit và [vividkit.dev/guides/agentkit](https://www.vividkit.dev/guides/agentkit/workflows). Site không đăng nguyên văn rules/hook của kit, chỉ đăng tóm tắt.
