# pr-review-toolkit (vendored)

Copied on 2026-10-09 from Anthropic's `pr-review-toolkit` Claude Code plugin
(`claude-plugins-official`), Apache License 2.0 (see `LICENSE`). Vendored so every teammate's
Claude Code session has the same reviewers without installing the plugin.

| File | Agent / command | Reviews |
|---|---|---|
| `.claude/agents/code-reviewer.md` | `code-reviewer` | Project rules (CLAUDE.md), bugs, quality |
| `.claude/agents/silent-failure-hunter.md` | `silent-failure-hunter` | Swallowed errors, bad fallbacks |
| `.claude/agents/pr-test-analyzer.md` | `pr-test-analyzer` | Test coverage gaps |
| `.claude/agents/comment-analyzer.md` | `comment-analyzer` | Comment accuracy and rot |
| `.claude/agents/type-design-analyzer.md` | `type-design-analyzer` | Type invariants and encapsulation |
| `.claude/agents/code-simplifier.md` | `code-simplifier` | Simplification after review passes |
| `.claude/commands/review-pr.md` | `/review-pr [aspects]` | Runs the agents above on the current change |

**How we use it:** see `.claude/skills/git-operations/SKILL.md`, section "Review the whole
change yourself before opening a PR". Run `/review-pr` on your branch before you open the PR.

Upstream files are unchanged. To update, copy them again from the plugin and keep this README.
