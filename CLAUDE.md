## Agent skills

### Issue tracker

Issues live in GitHub Issues (`javips02/dotfiles_javips02`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo — one `CONTEXT.md` + `docs/adr/` at root. See `docs/agents/domain.md`.

### Issue capture

After any session that involves planning (`/grill-me`, `/to-prd`), drilling (`/grill-with-docs`), or design decisions, offer to convert actionable outcomes into GitHub issues via `to-issues`. Phrase it as a single closing prompt: "Want me to break this into issues?" Don't ask mid-session — wait until a natural stopping point.
