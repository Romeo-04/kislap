# Kislap — Claude Code entry point

Kislap is a Filipino-first reading game for Grade 1 to 3. A Whisper model runs in the browser and
listens while the child reads aloud. Hackathon: AppBuildersPH 2026 (Local AI). **Submit by 08:30,
2026-10-10 (Asia/Manila). Hard deadline 10:00.**

## Load order (read these before you work)

1. `kislap-spec.md` — the full spec. It is the source of truth for scope and rules.
2. `CONTEXT.md` — the glossary. Use these words in code, issues, and UI copy.
3. `PROGRESS.md` — what is done, what is in flight, who owns what, the checkpoints.
4. `docs/architecture.md` — the module map and the contracts. UML is in `docs/uml/`.
5. `docs/adr/` — why the architecture is the way it is. Do not "fix" a decision recorded there
   without writing a new ADR that supersedes it.
6. `docs/validation.md` — which spec claims are verified, which are not, and the grill log.

@kislap-spec.md
@CONTEXT.md
@PROGRESS.md

## Non-negotiables (from spec §20, short form)

1. All AI runs on the device. No cloud inference, no audio upload, no account, no server.
2. Kind tone. Never say "wrong". No timers, lives, or leaderboards. A model error never costs the
   child.
3. Must loop before anything else. Feature freeze at 01:00.
4. Honest claims only (spec §19). No "first", no accuracy claims on child voices.
5. Own or free-licensed assets only. List every one in `README.md`.
6. Zero third-party requests at runtime after first load (ADR-0007). Self-host fonts and sounds.

## How we work

- Git: follow `.claude/skills/git-operations/SKILL.md`. One branch and one PR per task. The branch
  name is written on each task in its GitHub issue.
- Review: run `/review-pr` (pr-review-toolkit, vendored in `.claude/agents/` and
  `.claude/commands/`) on your branch before you open a PR. Use the same toolkit to review a
  teammate's PR, in a separate worktree.
- Every task lives in a GitHub issue. Each person has one epic issue (`epic` label) with a task
  list. Tick the box, or close the linked atomic issue, when the task is done.
- After you finish a task, update `PROGRESS.md` in the same PR.
- A new architecture decision that is hard to reverse gets an ADR in `docs/adr/`.
- Write in short, plain sentences (Simplified Technical English).
