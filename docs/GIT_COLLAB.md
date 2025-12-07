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
		 - How to test (setup steps, commands, sample inputs).
		 - Screenshots or gif for UI changes (if applicable).
		 - Any known limitations or follow-up tasks.
	 - Add reviewers from the team and assign appropriate labels (e.g., `story-point`, `frontend`, `backend`).

5. Keep branch up-to-date and address review comments

	 - If `main` advanced while you were working, rebase to keep history clean:

		 ```powershell
		 git fetch origin
		 git rebase origin/main
		 # resolve conflicts if any, then
		 git push --force-with-lease
		 ```

	 - Alternatively, merge `main` into your branch if the team prefers merges over rebases:

		 ```powershell
		 git fetch origin
		 git merge origin/main
		 git push
		 ```

6. Merge strategy

	 - Use **Squash and merge** for story point branches to keep the `main` history concise, unless the team decides otherwise.
	 - Ensure CI checks (if any) pass and that reviewers have approved before merging.

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

