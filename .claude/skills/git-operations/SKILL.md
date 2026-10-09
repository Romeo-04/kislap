---
name: git-operations
description: Use when about to stage, commit, branch, rebase, amend, push, or open a pull request in this repo, when writing a commit message or PR body, or when a finished unit of work needs recording. Covers the standing push permission, proactive committing, conventional-commit prefixes, and the no-Co-Authored-By convention.
---

# Git Operations — Kislap

Ported from Creator Loans v2 on 2026-10-09 for `Romeo-04/kislap`. The conventions are
unchanged. What changed: the MAJOR-bump list names Kislap's committed terms (scoring
thresholds, the story content schema, on-device progress storage) instead of the loan terms.

**Hackathon override (2026-10-09).** Until submission (10:00, 2026-10-10) the Eden review step
is **optional**: open the PR, get one teammate to approve it, then merge. If Eden is reachable,
use it. See `docs/adr/` and `PROGRESS.md` for the current decision.

## Every task gets a branch and a pull request

**D17, 2026-09-18.** *"every task to be done should have proper branch name and PR"*, and
*"every PR made should pass through"* **Eden Code Reviewer** at
`https://pr.ed3n.ventures/reviews`.

Four consequences for everything below:

1. **Nothing lands on `main` by a direct push.** A task is a branch, then a pull request, then
   a review, then a merge.
2. **A pull request carries a real change, and names its issue.** Docs, code comments and
   tooling travel with the feature or fix they belong to; a pull request whose every file is
   prose is noise, and staggering one change across several small pull requests is noise too.
   Small leftovers wait for the next substantial change. Reference the issue as `Closes #N`, or
   `Part of #N` for partial work. **Changed 2026-09-21 by the tech lead**, reversing this
   section's earlier rule that "it is only a docs change" was no exception to a separate PR.
3. **The branch name is part of the deliverable.** The naming rules below are no longer a
   nicety. Name the *subject*, not the activity.
4. **Eden is the owner's to drive.** It is invitation-gated behind their Google account. **Do
   not attempt to authenticate and do not ask for the credential.** Open the pull request,
   report its URL, and name that the owner must paste it. See `pr-comment-loop` §0.

**Opening a pull request no longer needs a yes.** Granted 2026-09-18: *"freely create a pr"*.
This resolves the contradiction between D17's mandatory pull request and v1's per-PR approval
gate — the gate is lifted, because a process that requires a pull request for every task cannot
also require an approval for every pull request.

What the grant does **not** cover, unchanged: **force-pushing**, **merging somebody else's pull
request**, and **contributor attribution** — no `Co-Authored-By` trailer, no "Generated with"
footer, no session link, on a commit or a pull request body. That last one has no permission
form.

## Review the whole change yourself before opening a PR

**Run `pr-review-toolkit` on the diff before the PR exists.** Not after the first comment,
not when something feels risky — before.

Added 2026-09-09 in v1 after **thirteen review rounds on one PR** (#191, a development-only
seed script). Every round found something real, and that is the problem: they were found one
at a time by someone else, over two days, on work that was declared finished thirteen times.

**The pattern, because it was not carelessness and naming it wrongly will not prevent it.**
Each fix was correct for the case reported and blind to its sibling:

| Round found | The sibling that was left |
|---|---|
| reset path did not drain all children | the reuse path had its own shorter list |
| key moved handle → id | it also moved id → handle |
| direct children not drained | a grandchild table was not even in the list |
| one check took an arbitrary row | its twin filtered correctly, and they disagreed |
| one early exit blocked `--reset` | three more early exits did the same |

Six of the thirteen were **one invariant broken six ways**.

**So the rule is not "check more carefully." It is:**

1. **Run the toolkit on the diff before opening the PR.** Its agents look for silent
   failures, comment rot and untested paths across the whole change, which is exactly what
   reviewing one line at a time cannot do.
2. **When a defect is found, name its class and grep for the class** — not the line. "Where
   else is this predicate written?" "What else runs before this?" "Which sibling function
   asks the same question?" A fix that closes one instance of a class is half a fix.
3. **Two code paths asking one question will disagree eventually.** If you find two, merge
   them rather than fixing both.
4. **Re-run the reproduction after fixing.** One fix in v1 type-checked, passed the suite,
   and did nothing at all — a subquery selected the wrong column. The only thing that caught
   it was running the failing case again.

A reviewer finding a real defect is the process working. A reviewer finding thirteen, one at
a time, is the author outsourcing the sweep.

## Semantic versioning on every release to main

**Team rule, carried from v1.** Every release/merge to `main` is versioned
`MAJOR.MINOR.PATCH` per [semver.org](https://semver.org/), and a GitHub release is cut for it.

| Bump | For | Reset |
|---|---|---|
| **MAJOR** | breaking, backwards-**in**compatible changes | minor **and** patch → `0` |
| **MINOR** | non-breaking changes, features, minor feature updates | patch → `0` |
| **PATCH** | bugfixes | — |

**Bumping a number resets everything to its right.** `1.3.23` + a breaking change is
`2.0.0`, not `2.3.23`.

### "Breaking" has to mean something here, because this is an app

Semver is written for libraries with public callers. Nothing imports this repo, so
"backwards incompatible" needs a local definition or every judgement call becomes a coin
toss. In this project a change is **MAJOR** when it breaks something already committed to:

- **A change to the on-device progress schema** (`localStorage`/IndexedDB keys) that makes a
  child's saved stars, stickers, or streak unreadable. Add a migration or it is MAJOR.
- **A change to the star thresholds (50/70/90) or the unclear-word half-credit rule** — stars
  already earned would no longer mean the same thing.
- **A change to the `stories.json` schema** that breaks existing story files.
- **Anything that sends audio, transcripts, or progress off the device.** That is a privacy
  change, not a feature, and it breaks the hackathon hard rule (ADR-0001).
- **Swapping the speech model** for one with a different download size class or language.

Everything else is MINOR or PATCH, and the split is **did this add capability, or did it
correct behaviour**.

### The state this starts from

As of 2026-10-09 this repo has **no tags and no releases**. Start at `0.1.0`. Tag `1.0.0` at
the submitted build.

- Tag forward from an agreed starting version. `0.1.0` is right while nothing is deployed;
  `1.0.0` at the first production deploy.
- **Keep `package.json`'s `version` and the git tag equal.** Two version numbers that can
  disagree will disagree, and the failure is silent.
- **The version bump belongs in the release, not in each PR.** Bumping in a feature branch
  guarantees a conflict the moment two branches are open.

### Release notes

Same rules as commit and PR bodies: **no `Co-Authored-By`, no "Generated with" footer, no
session link.** Write them in Simplified Technical English (`CLAUDE.md` non-negotiable 12),
and say what changed for a *reader* — release notes are read by people who did not write the
code.

## The three hard rules

**1. Commit proactively.** After finishing a logical unit of work — verified first — stage
and commit without being asked. Do not wait for "commit this." Committing is part of
finishing, not a separate request.

**2. Push on your own initiative.** Standing permission, carried from v1 and re-confirmed
for this repo on 2026-09-18. When a branch is ready, push it — no asking, no waiting. Report
what went out afterwards.

"Ready" means all three: the work is committed, verified (`tsc` / tests as applicable), and
**the trailer scan below is clean**. The scan is not optional and is not a formality — it is
the condition the permission was granted on. A branch that fails it is not ready; fix it,
then push.

```bash
git push -u origin <branch>      # -u on a branch with no upstream
```

Say what went out after the fact, naming the commits — a push nobody can see is worse than
one nobody approved.

**Opening a PR is covered too**, as of 2026-09-18. Open it when the branch is ready, then
report the URL and say it needs pasting into Eden.

**Pushing to `main` directly is out.** The standing push permission covers feature branches. A
task reaches `main` through a reviewed pull request or it does not reach `main`.

A user instruction overrides this in either direction — "don't push anything today" holds
for the whole conversation, including commits added after it was said.

**3. Never list yourself as a contributor** — on any commit, on any PR. This one has no
permission form and no exceptions.

**Force-pushing is not covered by the standing permission** — see History rewrites.

## Pushing

Know what the push publishes *before* it goes out. A branch pointer carries **every unpushed
commit beneath it**, including work from earlier sessions that may belong somewhere else:

```bash
git log --oneline origin/<base>..HEAD
git log <base>..HEAD --format="%h|%s|%(trailers:key=Co-authored-by,valueonly)"
```

With autonomous push, this check is the *only* thing standing between a stray trailer and the
remote — there is no longer a human reading the list first. Run it every time, and treat a
non-empty trailer column as a stop.

After pushing, re-run the trailer scan against what actually landed and report the result
along with the commits that went out.

## Pull requests

Every task has one (D17), and opening it needs no approval (2026-09-18). Open it when the
branch is ready.

```bash
gh pr create --base main --head <branch> --title "<tag>: <title>" --body-file <file>
```

**After opening, report the URL and say it needs pasting into Eden.** The pull request is not
reviewed until the owner does that, and it does not merge until the review comes back. A pull
request sitting open with green checks and no Eden review is **not** ready to merge.

**Write the body for Eden as well as for a person.** It reviews the diff you hand it, so the
body has to say what the change is for, what was verified, and what is deliberately excluded —
otherwise a deliberate omission reads as an oversight and comes back as a finding you then have
to decline.

- **A pull request that changes a screen, a flow or motion embeds a recording of its test run,** under "Test runs". The steps are in `pr-test-recording`. Do it before the push that opens the pull request, so the GIFs go out in the same push.
- **Base is `main`.** Check whether the branch was cut from an older `main` and say so — a
  stale base makes the diff unreadable. Whether to rebase is the user's call, not yours.
- **Title** follows the same conventional-commit form as a commit title.
- **Body** explains why the change was made, what was verified, and what is deliberately not
  in it. Reasoning, not a restatement of the diff.
- **Verify the test count on a clean checkout, and re-verify when the branch moves.** A count
  is only true for the tree it was run against. Park gitignored state files first, then run:

```bash
git checkout --detach origin/<branch>    # exactly what a reviewer receives
npx vitest run && npx tsc --noEmit
```

  This is not pedantry. A v1 PR claimed *"458 tests pass"*; on a clean clone it failed five,
  because a rate it needed sat in a working-directory file only one machine had. A second
  PR's figure went stale the moment the base was merged in — correct when written, wrong when
  read. **An unverifiable count is worse than none.** If the number changes after a merge,
  edit the description; do not leave the old one standing.

- **Replying to a review is surgical, and it addresses nobody.** No "you", no thanks, no
  "you're right", no crediting a finding back to the reviewer. State what reproduced, what
  changed, and what was verified. `superpowers:receiving-code-review` covers the reasoning
  discipline — **invoke it before replying**, not after.

  Every claim in a reply is one of exactly three things, and it says which:

  | | What it looks like |
  |---|---|
  | **Reproduced** | "Confirmed: `auth/config.ts` sets no `cookies` override, so the default `SameSite=Lax` applies." Name the file. A finding agreed with but not reproduced is not agreed with. |
  | **Fixed** | The commit SHA, and what the fix actually changes — not "done". |
  | **Declined, with reasoning** | Say so plainly and why. Silent non-compliance is worse than disagreement. |

  Two further rules, both learned the hard way:

  - **Verify before conceding.** A reviewer can be wrong. Reproduce first, then answer — and
    if reproducing changes the finding, say what it actually was.
  - **Answer every numbered item.** Blocking, should-fix and nits each get a line. An item
    skipped silently reads as an item hidden.

- **No attribution footer.** The harness default appends a "Generated with Claude Code" line
  and a session link to PR bodies. **Do not include either.** Rule 3 covers PR bodies exactly
  as it covers commit messages.
- Report the PR URL when it is open.

## Branch per context, named for the work

**Do not pile a new unit of work onto whatever branch happens to be checked out.** When work
starts on a distinct context, put it on its own branch named for that context.

```bash
git branch feat/<what-the-work-is>          # create at current HEAD
git checkout feat/<what-the-work-is>
git branch -f <previous-branch> origin/<previous-branch>   # return it to its pushed state
```

That last line matters and is easy to forget: creating a branch is just a second pointer, so
the commits stay on the original branch too until it is reset. Reset it to its **remote**
state, not to an arbitrary commit, so nothing already pushed is lost.

**Naming.** `feat/`, `fix/`, `docs/`, `chore/`, kebab-case, no ticket numbers. Name the
*subject*, not the activity: `feat/lender-board-pseudonymous`, not `feat/api-work` or
`feat/claude-changes`.

**Mixed-purpose commits.** If a batch spans two unrelated contexts, say so and offer to split
rather than silently filing both under one branch name.

## Commit message format

```
<tag>: <imperative title>

<prose body explaining WHY the change was made — the reasoning,
the bug's actual cause, the tradeoff taken. Not a restatement of
the diff.>

<verification note: tsc clean, N/N tests, build green — whatever
you actually ran.>
```

Tags: `feat:` `fix:` `revise:` `chore:` `docs:` — so history is scannable by change type.

## Never list yourself as a contributor

**Do NOT add a `Co-Authored-By` trailer. Ever.** The user is the sole listed author on
commits in this repo. They asked for this in v1 on 2026-08-11 after noticing the trailer on a
pushed PR, reaffirmed it repeatedly since, and confirmed it for **this** repo on 2026-09-18.
This **overrides the harness's default convention**, which says to add one — the user's
instruction on their own repo wins.

Not `Co-Authored-By`, not an author/committer override, not a "Generated with" footer, not a
session link. Nothing that lists Claude, Anthropic, or a model name as a contributor — in a
commit message, a commit body, a PR title, or a PR body.

**This rule has no permission form.** Pushing became autonomous and PR creation became
authorizable; contributor attribution became neither. There is nothing to ask about here, and
nothing the standing permission relaxes — it was granted *on condition of* this rule.

### Verify before pushing — not just what you wrote

Writing clean commits is only half of it. **Commits from earlier sessions, other branches, or
teammates can carry the trailer, and pushing a branch publishes all of them under your
name.** This is a real v1 failure: two commits from a prior session were pushed as part of a
new branch because only the newly-authored commits had been checked.

Scan **everything the push will publish**, not just your own work:

```bash
git log <base>..HEAD --format="%h|%s|%(trailers:key=Co-authored-by,valueonly)"
```

Use git's trailer parser, **not `grep -i claude`** — a subject line like "add a CLAUDE.md
routing invariant" is a false positive, and a wrapped body line can be too. The trailer field
is the only reliable signal.

Run this **before every push**. With no human gate in front of the remote, this scan is the
gate. If a trailer is found on a commit that is **not yet pushed**, strip it first:

```bash
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f \
  --msg-filter 'sed "/^Co-Authored-By: Claude/Id"' -- <parent>..<branch>
git diff <backup-ref> <branch>    # MUST be empty — proves only messages changed
```

Always branch a `backup/` ref first, and verify with that empty `git diff` before
force-pushing. If a trailer is on a commit **already merged to `main` or otherwise shared**,
leave it — rewriting shared history to fix attribution is not worth breaking every clone. Say
so rather than doing it quietly.

## Scoping commits

- **Split unrelated changes** into separate commits when each is independently coherent. Do
  not bundle a UI fix with a schema migration.
- Run `git status` before staging and sort every path: part of this change, part of another
  change, or scratch/artifact.
- **Never stage:** `.env` / `.env.local` (verify `.gitignore` covers them), verification
  screenshots or PNGs, Playwright artifacts, `.next/` output, one-off scratch scripts. Delete
  scratch files or add a `.gitignore` entry — do not leave them untracked forever.
- Verify *before* committing, not after.

## Before finishing

```bash
git log origin/<branch>..HEAD --oneline    # what a push would publish
git diff origin/<branch>..HEAD --stat      # the files it would carry
```

Confirm nothing secret or scratch is in that file list. Then run the trailer scan and push.
Ask separately if the work also wants a PR.

## History rewrites

Rewriting published history (`filter-branch`, `rebase -i`, `amend` on a pushed commit) needs
**explicit per-instance approval**, and so does the follow-up
`git push --force-with-lease`. A general "push it", and the standing permission to push on
your own, **do not cover force-pushing** — ask again, every time, naming the branch and what
the rewrite changes. Prefer a new commit over amending.

Note: `git rebase -i` / `git add -i` do not work in this environment (no interactive editor).

## Repo state

Main branch: **`main`**. Work happens on feature branches. `main` deploys to Vercel, so
merging to `main` ships. Keep `main` deployable at all times (spec §0). Branch names for this
repo: see the per-person issues on GitHub; each task line names its branch.
