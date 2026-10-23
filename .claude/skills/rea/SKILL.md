---
name: rea
description: Reverse Engineer Anything (REA). Use to reverse engineer native, managed, Electron/JavaScript, Android, packaged, firmware, and browser targets from shipped artifacts or requested runtime evidence — explain features, compare versions, decompile code, inspect binaries/APKs/firmware/captures, or guide a reconstruction. Also bundles REA's own development skills (tool design, analysis/CI/test optimization, changelog/release notes) for contributing to the REA project itself. Skip REA for ordinary source-repository architecture analysis.
metadata:
  source: https://github.com/morluto/rea
  version: "45"
---

# REA — Reverse Engineer Anything

This single skill bundles the complete set of REA skills from
<https://github.com/morluto/rea>. Pick the section that matches the task and
follow the referenced skill file exactly. Every referenced file (`.agents/`,
`docs/`, `AGENTS.md`, `CONTRIBUTING.md`, `src/`) is bundled under this skill
directory, so the relative links inside each skill resolve as-is.

Installing this skill only supplies instructions. It does **not** register the
REA MCP server, install analysis engines, or add tools to a running agent. To
make the REA tools available, register the MCP server separately (review the
read-only plan first):

```bash
npx -y rea-agents@latest setup --client claude_code --dry-run --json   # plan
npx -y rea-agents@latest setup --client claude_code --yes              # apply
```

A no-MCP CLI fallback for a JavaScript tree or ASAR:

```bash
npx -y rea-agents@latest analyze-javascript-application /absolute/path/to/app --json
```

## Choose the right section

### 1. Reverse engineer a target (primary, user-facing)

Use this for any investigation of a shipped binary, package, APK, Electron/JS
bundle, firmware, capture (HAR/SAZ/PCAP/qlog), model/GGUF, WASM, or browser/
Electron runtime — anything that depends on decompilation, artifact evidence,
or passive runtime observation rather than available source.

→ Follow [`.agents/skills/reverse-engineer-anything/SKILL.md`](.agents/skills/reverse-engineer-anything/SKILL.md)
and its guides in `.agents/skills/reverse-engineer-anything/references/`
(native-and-artifacts, javascript-applications, android-applications,
runtime-observation, evidence-workflows, connection-and-recovery).

### 2. Design or change REA investigation tools

For work on REA's own CLI/MCP contracts, provider capabilities, and Evidence
semantics.

→ Follow [`.agents/skills/rea-tool-design/SKILL.md`](.agents/skills/rea-tool-design/SKILL.md)
(uses [`docs/tool-design.md`](docs/tool-design.md)).

### 3. Optimize REA analysis providers and workflows

For analysis bottlenecks, cache/query design, and shared analysis performance,
preserving correctness and Evidence.

→ Follow [`.agents/skills/rea-analysis-optimization/SKILL.md`](.agents/skills/rea-analysis-optimization/SKILL.md)
(uses [`AGENTS.md`](AGENTS.md) and the Kuna case study in
`.agents/skills/rea-analysis-optimization/references/`).

### 4. Audit REA CI and test suites

For suite/workflow correctness, fixture drift, false passes, and measured test
performance.

→ Follow [`.agents/skills/rea-ci-tests-audit/SKILL.md`](.agents/skills/rea-ci-tests-audit/SKILL.md)
(uses [`AGENTS.md`](AGENTS.md), [`docs/testing.md`](docs/testing.md), and the
measurement guide in `.agents/skills/rea-ci-tests-audit/references/`).

### 5. Prepare REA changelogs and release notes

For release-note preparation and verified contributor attribution.

→ Follow [`.agents/skills/rea-changelog-update/SKILL.md`](.agents/skills/rea-changelog-update/SKILL.md)
(uses [`docs/releasing.md`](docs/releasing.md)).

---

Sections 2–5 are for developing the REA project itself (they assume a REA
checkout); for reverse engineering a target, use section 1.
