# claude-freud

> *Your projects have been talking. Claude Freud listened.*

`claude-freud` is a CLI tool that reads Claude Code's auto memory files across your projects, surfaces human-readable analyses, compares projects, and promotes patterns upward to your global `~/.claude/CLAUDE.md`.

It pairs with Claude Code's **Auto Memory** and **Auto Dream** features — treating your accumulated project memories as a portfolio to be analysed, not isolated silos to be forgotten.

---

## Why

Claude Code's auto memory captures project-specific knowledge per session. Over time, each project accumulates a notebook of patterns, preferences, and insights. But:

- You never see across projects — you don't notice when Project A has rich CLAUDE.md instructions and Project B has none, explaining why Claude feels inexplicably better in one than the other
- Useful patterns stay buried per-project rather than being promoted to your global config
- There's no easy way to audit what Claude actually knows about your work

Claude Freud surfaces all of this.

---

## Requirements

- [Claude Code](https://claude.ai/code) installed and configured (v2.1.59+ for auto memory)
- Node.js 18+
- Auto memory enabled in your Claude Code sessions (`/memory` to check)
- [Anthropic API key](https://console.anthropic.com/settings/keys) (separate from Claude subscription)

---

## Installation

### Option 1: Install from npm (recommended)

```bash
npm install -g claude-freud
```

### Option 2: Install from GitHub

```bash
npm install -g https://github.com/xbg-solutions/claude-freud.git
```

### Option 3: Install from local build

```bash
# Clone the repository
git clone https://github.com/xbg-solutions/claude-freud.git
cd claude-freud

# Install dependencies and build
npm install
npm run build

# Link globally
npm link
```

To uninstall:
```bash
npm uninstall -g claude-freud
```

---

## Setup

After installation, configure your API key:

```bash
# Get your API key from https://console.anthropic.com/settings/keys
cfreud config set-key <your-api-key>

# Verify it works
cfreud config check

# View current configuration
cfreud config show
```

**Configuration priority:**
1. `ANTHROPIC_API_KEY` environment variable (if set)
2. `~/.claude-freud/config.json` (set via `config set-key`)
3. `~/.claude/settings.json` (Claude Code config, if available)

**Note:** API usage has separate pricing from Claude subscriptions. See [anthropic.com/pricing](https://anthropic.com/pricing)

---

## Usage

### Analyse all projects (default)

```bash
cfreud
```

For each project with auto memory, outputs a 2–3 paragraph synthesis and recent memory highlights.

### Analyse a specific project

```bash
cfreud navmaps
cfreud _home_ben_code_navmaps   # by full ID
```

### List all projects on record

```bash
cfreud list
```

Shows all projects Claude Code knows about, with resolved paths and last session dates.

### Compare two projects

```bash
cfreud compare navmaps xbg-boilerplate
```

Surfaces similarities, differences, and a clinical note on instruction quality between two projects. Useful for diagnosing why Claude behaves differently across projects.

### Identify patterns for promotion

```bash
cfreud homogenize              # dry run — shows what would be promoted
cfreud homogenize --apply      # prompts for confirmation, then writes to ~/.claude/CLAUDE.md
cfreud homogenize navmaps      # scoped to one project
```

Identifies architectural patterns, preferences, and approaches that appear across projects and are worth promoting to your global `~/.claude/CLAUDE.md`. If no global CLAUDE.md exists, `--apply` creates one from scratch.

### Manage configuration

```bash
cfreud config set-key <api-key>   # Store your Anthropic API key
cfreud config show                # Show current configuration sources
cfreud config check               # Validate API key is working
```

---

## Options

| Option | Description |
|--------|-------------|
| `--md` | Output as markdown (composable with any command) |
| `--no-ai` | Skip AI analysis, dump raw memory content |
| `--apply` | (homogenize only) Write promotions after confirmation |

---

## Output examples

**`cfreud`**
```
Claude Freud
Your projects have been talking. Claude Freud listened.

▸ navmaps
──────────────────────────────────────────────────────────
This project presents as a bluewater sailing race
visualisation platform with an unusually strong fixation
on spatial data pipelines...

Recent memories:
  • IDW interpolation via @turf/interpolate → isobands for pressure overlays
  • Google Maps 3D tile layer integrated, awaiting texture optimisation
  • GFS and BOM feeds classified and normalised
```

**`cfreud compare navmaps input.xbg.solutions`**
```
▸ Comparative Analysis: navmaps × input.xbg.solutions
──────────────────────────────────────────────────────────
Both patients share a SvelteKit 5 foundation and a Firebase
backend, though their presenting concerns differ markedly...
```

---

## How it works

Claude Freud reads:
- `~/.claude/projects/<project>/memory/MEMORY.md` — the auto memory index
- `~/.claude/projects/<project>/memory/*.md` — topic files
- `<repo-root>/CLAUDE.md` — your project instructions
- `~/.claude/CLAUDE.md` — your global instructions

It never modifies per-project files. The only write operation is to `~/.claude/CLAUDE.md` via `--homogenize --apply`, always with explicit confirmation.

---

## The name

Claude Code has **Auto Memory** (notes Claude takes during sessions) and **Auto Dream** (consolidation of those notes between sessions). Claude Freud sits above both — analysing the accumulated unconscious of your development practice and surfacing what it finds.

> *"The mind is like an iceberg. Auto Memory is the surface. Claude Freud goes below."*

---

## Contributing

PRs welcome. Fork, build, open issues. The project is intentionally small — the goal is a sharp tool, not a framework.

---

## License

MIT
