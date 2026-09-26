# AgentKit Guide (Engineer Kit)

A concise guide to the AgentKit Engineer Kit: layers, the life of a prompt, hooks, rules, agents, a relationship map, 102 skills with parameters, workflows by task, and tips. English by default, Vietnamese via the **VI** toggle.

**Site:** https://camping89.github.io/agentkit-guide/ (`?lang=vi` opens Vietnamese)

## Layout

- `site/`: static site (plain HTML/CSS/JS). Opening `site/index.html` directly also works.
- `data/skills.json`, `data/agents.json`, `data/groups.json`, `data/meta.json`: metadata extracted from an AgentKit install.
- `data/relations.json`: skill/agent/hook links found in the kit source (drawn by `site/relations.js` on each skill page and on the relationship map).
- `data/detail-en/*.json`, `data/detail/*.json`: per-skill explanations (English, Vietnamese).
- `site/content-en.js`, `site/content-vi.js`: workflows, skill chooser, CLI tables.
- `scripts/extract.py`: extract metadata from `~/.claude` on a machine with AgentKit.
- `scripts/build.py`: bundle data into `site/data.js`, Engineer scope only.
- `scripts/smoke-test.mjs`: open every route with Playwright and fail on JS errors (`BASE=<url>` tests a live site).

## Update after `ak update`

```bash
npm run extract   # re-extract metadata from ~/.claude
npm run build     # regenerate site/data.js
npm test          # smoke test (run `npm i` once for playwright)
```

Pushing to `main` deploys GitHub Pages.

Sources: a real AgentKit install and [vividkit.dev/guides/agentkit](https://www.vividkit.dev/guides/agentkit/workflows). The site publishes summaries only, never the kit's verbatim rules or hook source.
