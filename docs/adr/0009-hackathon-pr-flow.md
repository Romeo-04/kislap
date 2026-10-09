---
status: proposed
date: 2026-10-09
---

# One branch and one PR per task; one teammate approves; Eden is optional tonight

Every task is a branch named in its GitHub issue, and a PR that says `Closes #N` or `Part of #N`.
One teammate approves, then the author merges. The Eden Code Reviewer step in the git-operations
skill is optional until submission: a single owner gates Eden, and four people will merge many
small PRs tonight. `main` must stay deployable, because Vercel deploys it.

## Considered options

- **Eden on every PR**: the skill's default. Too slow with one gatekeeper at 3 a.m.
- **Direct pushes to main**: fastest, but one broken push breaks the live demo link.
