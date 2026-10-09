---
status: accepted
date: 2026-10-09
---

# One branch and one PR per task; one teammate approves

Every task is a branch named in its GitHub issue, and a PR that says `Closes #N` or `Part of #N`.
One teammate approves, then the author merges. There is no external review service: the Eden
Code Reviewer step in the original git-operations skill belongs to another project and does not
apply here (decided 2026-10-09). `main` must stay deployable, because Vercel deploys it.

## Considered options

- **Direct pushes to main**: fastest, but one broken push breaks the live demo link.
- **Two approvals**: too slow for four people merging many small PRs overnight.
