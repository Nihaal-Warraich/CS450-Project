# Git Collaboration Guide

This document explains how team members should create a branch for their story point, work on it, and open a Pull Request (PR). Follow these steps to keep the repo consistent and reviews efficient.

**Branch Naming**: Use a clear, consistent branch name. Examples:

- `feature/sp1-short-description`

Replace `sp1` with the story point number and use a short kebab-case description.

**Workflow (step-by-step)**

1. Create a branch for your story point

	 - Update your local `main` first:

		 ```powershell
		 git checkout main
		 git pull origin main
		 ```

	 - Create and switch to a new branch:

		 ```powershell
		 git checkout -b feature/sp<NUMBER>-short-desc
		 ```

	 Example:

		 ```powershell
		 git checkout -b feature/sp1-login-form
		 ```

2. Work on the story point

	 - Make small, focused commits with clear messages. Prefix messages with the story point ID:
        ```powershell
		 git add .
		 git commit -m "SP1: Added Age Bar Graph"
		 ```
        or
		 ```powershell
		 git add <files>
		 git commit -m "SP1: Added Age Bar Graph"
		 ```

3. Push branch to remote

	 ```powershell
	 git push -u origin feature/sp1-login-form
	 ```

4. Open a Pull Request (PR)

	 - Base branch: `main` (unless otherwise agreed).
	 - Title format: `SP<N>: Brief title` (e.g. `SP1: Add login form`).
	 - PR description should include:
		 - Story Point number and short summary.
		 - What changed (high-level).
		 - Screenshots or gif for UI changes (if applicable).


5. Keep branch up-to-date (PSA: only need to do this if main was updated and shared files were updated that can result in merge conflict otherwise no need)

- Why rebase: rebasing applies your branch's commits on top of the latest `main` so the history is linear and easier to review. Rebasing is preferred for small feature/story branches that haven't been shared widely.
- When to rebase: do this when `origin/main` has new commits that you want to include before opening/updating a PR or when reviewers ask you to bring your branch up-to-date.

Detailed rebase steps (safe, step-by-step)

1. Fetch the latest remote refs:

	 ```powershell
	 git fetch origin
	 ```

2. Make sure you're on your feature branch (not `main`):

	 ```powershell
	 git checkout feature/sp<#>-short-desc
	 ```

3. Rebase your branch onto the updated `origin/main`:

	 ```powershell
	 git rebase origin/main
	 ```

	 - Git will replay your commits onto the tip of `origin/main`.

Handling conflicts during rebase

- If there is a conflict, Git will pause and mark files with conflicts. Use `git status` to see conflicted files.
- Open the conflicted files, resolve the conflicts, then:

	```powershell
	git add <resolved-file>
	git rebase --continue
	```

- If you make a mistake and want to stop the rebase and return to the pre-rebase state:

	```powershell
	git rebase --abort
	```

Pushing after a rebase (force safely)

- Because rebase rewrites history, you must update the remote branch with a force push. Use `--force-with-lease` (safer than `--force`):

	```powershell
	git push --force-with-lease
	```

- `--force-with-lease` fails if someone else pushed to the same remote branch since your last fetch, preventing accidental overwrites.


Warnings and best practices

- Avoid rebasing public/shared branches that others are using. If your branch has already been merged or shared widely, prefer merging `main` into your branch or using a revert instead of rewriting history.
- Always run your test/lint steps locally after a rebase to ensure nothing regressed.
- Commit or stash local work before rebasing. If you have uncommitted changes you want to keep, use `git stash` before rebasing and `git stash pop` afterwards.


6. Merge strategy

	 - Use **Squash and merge** for story point branches to keep the `main` history concise.

7. Cleanup after merge

	 - Delete the remote branch on GitHub using the PR UI or:

		 ```powershell
		 git push origin --delete feature/sp1-login-form
		 ```

	 - Delete the local branch:

		 ```powershell
		 git branch -d feature/sp1-login-form
		 ```

**Commit message guidance**

- Keep messages concise and descriptive.
- Start with the story point tag: `SP<N>:` (e.g., `SP3:`).
- Example: `SP2: Implement logout flow and session cleanup`.

**PR size & scope guidance**

- Keep PRs limited to a single story point whenever possible.
- Aim for small, reviewable PRs — ideally under a few hundred lines of change.

**Review checklist (for author & reviewers)**

- **Author**: Add testing steps, include screenshots, ensure lint/tests pass locally.
- **Reviewer**: Verify code correctness, test the changes locally, check for clarity and maintainability.

If you have any questions or want to change the workflow, open an issue or start a short discussion in the team channel.

**Fixes & follow-ups**

- If a fix is required after a branch has been merged or a PR was closed, **do not reuse the old story point branch**. Create a new branch for the fix so history and reviews remain clear.
- Suggested branch names: `fix/sp1-short-desc`

Example (PowerShell):

```powershell
git checkout main
git pull origin main
git checkout -b fix/sp1-fix-login-validation
git add .
git commit -m "SP1: Fix edge case"
git push -u origin fix/sp1-fix-login-validation
```

This keeps each story point branch focused and prevents accidental reuse of stale branches.

---

Files referenced in this guide: `docs/GIT_COLLAB.md` (this file).

