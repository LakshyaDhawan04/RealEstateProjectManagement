# Skill: Resume Work on Token Limit

Auto-resumable token management for GitHub Copilot.

## Trigger
When token budget exceeds 75% threshold.

## Auto-Recovery
1. Create checkpoint: `logs/checkpoint_*.md`
2. Commit work: "checkpoint: Token limit, resuming next"
3. Generate: `RESUME.md` with next steps

## Resume Next Session
```bash
source .copilot-token-rules.sh
cat RESUME.md
# Continue work
```

## Status
✅ Available | Auto-trigger at 75% budget
