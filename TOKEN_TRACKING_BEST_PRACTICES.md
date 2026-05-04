# Token Tracking Best Practices

**Companion to:** TOKEN_MANAGEMENT_RULES.md  
**Updated:** 2026-05-04

---

## Tools Comparison

### Tokalator (Chosen Tool)
**Strengths:**
- ✅ Real-time context budget tracking
- ✅ VS Code integration (sidebar widget)
- ✅ File relevance scoring (imports, recency, diagnostics)
- ✅ Model comparison (switch models, see token delta)
- ✅ Prompt caching savings calculator
- ✅ Interactive course on context engineering

**Limitations:**
- TypeScript-based (not Python)
- Requires VS Code for full features
- Limited to code analysis (not API usage tracking)

### Alternatives (Reference Only)
| Tool | Use Case | Notes |
|------|----------|-------|
| **tokdu** | File-level token counting | Great for understanding token distribution |
| **tokentap** | Real-time API traffic monitoring | Better for tracking API calls |
| **LiteLLM** | Multi-provider gateway | Best for unified cost tracking across OpenAI/Anthropic/Gemini |

---

## Daily Workflow: Token-Aware Development

### Morning Check
```bash
# 1. Scan codebase for token distribution
tokalator scan .

# 2. Review yesterday's token usage (if available in logs)
cat logs/token_usage.log | tail -20

# 3. Set personal token budget for today
# Expected: 2K tokens per phase, max 10K/day
```

### Before Starting a Task
```bash
# 1. Clear irrelevant files from workspace
# (If in VS Code: Close unused tabs)

# 2. Check if tokalator sidebar shows LOW/MEDIUM budget
# GREEN = safe to proceed
# YELLOW = be cautious, compress context
# RED = pause, summarize & checkpoint

# 3. Estimate tokens for task (use tokalator cache calculator)
tokalator cache estimate
```

### During Implementation
```javascript
// Example: Minimize tokens in comments
// ✗ Bad: Long explanatory comments (100+ tokens)
// Initialize the Gmail OAuth2 client with credentials loaded from
// environment variables, handle error cases, and set up token refresh
// mechanism to automatically request new tokens when they expire...

// ✓ Good: Minimal comments (20 tokens)
// Setup Gmail OAuth2 client with auto-token refresh
```

### After Task Completion
```bash
# 1. Check token usage for this turn
tokalator breakdown  # Shows token breakdown by file

# 2. Log token usage
echo "$(date): Task 'gmail-oauth' - Used 4.2K tokens" >> logs/token_usage.log

# 3. Update plan.md with actual vs. budgeted tokens
# Plan said: 5K, Actual: 4.2K ✓ Under budget

# 4. Commit with token reference
git commit -m "feat: Gmail OAuth2 implementation (4.2K tokens used)"
```

---

## Context Management Strategies

### Strategy 1: Temporal Isolation
**Problem:** Long conversation history → high input tokens

**Solution:**
```
Turn 1-20 (6KB):   Initial setup & exploration
Checkpoint 1:     Save state, summarize work
Turn 21+ (fresh):  Start new session, reference checkpoint

Savings: ~5KB per session
```

### Strategy 2: File Pinning
**In VS Code tokalator sidebar:**
```
PIN these files:
- src/ingestion/gmail_ingester.js      (always count)
- src/ingestion/whatsapp_ingester.js   (always count)
- .tokalator.json                       (config is small, still count)

UNPIN (reduce noise):
- node_modules/  (never count)
- data/          (outputs, can be regenerated)
- logs/          (archive to separate dir)

Result: ~30% context reduction
```

### Strategy 3: Prompt Caching
**For repeated queries:**
```
Example: Weekly token report

❌ Without caching (100+ tokens each time):
"Generate token usage report for files:
src/ingestion/gmail_ingester.js, src/ingestion/whatsapp_ingester.js, ..."

✅ With caching (first: 50 tokens, repeat: 5 tokens):
Use tokalator cache calculator to estimate savings
= 90% reduction on repeated prompts
```

---

## Real Estate Ingestion: Token Budget Allocation

### Phase-by-Phase Budget

| Phase | Task | Budget | Actual | Status |
|-------|------|--------|--------|--------|
| Setup | Project structure, tokalator config, env setup | 2K | - | Pending |
| Gmail OAuth | Credentials setup, authentication flow, email fetch | 5K | - | Pending |
| WhatsApp Parser | Export parsing, WAHA integration, message extraction | 5K | - | Pending |
| Integration | Combine ingesters, error handling, data normalization | 3K | - | Pending |
| Testing | Unit tests, integration tests, edge cases | 2K | - | Pending |
| Deployment | Docs, CI/CD setup, monitoring | 1K | - | Pending |
| **TOTAL** | | **18K** | - | - |

### How to Use This Budget
```
Each phase gets a "token allowance"
When you start a phase:
  tokalator scan . > logs/phase_baseline.txt

While working:
  tokalator breakdown   # Check current usage
  
When phase completes:
  tokalator scan . > logs/phase_final.txt
  diff logs/phase_baseline.txt logs/phase_final.txt
  
Log the result:
  echo "Gmail OAuth phase: 4.8K tokens (budgeted 5K) ✓" >> logs/budget.log
```

---

## Monitoring Dashboard (Proposed)

### Create logs/token_dashboard.sh
```bash
#!/bin/bash
# Token usage dashboard

echo "=== TOKEN TRACKING DASHBOARD ==="
echo "Date: $(date)"
echo ""

# 1. Codebase token distribution
echo "📊 Codebase Token Distribution:"
tokalator scan . | tail -10

echo ""
echo "💾 File-level breakdown:"
tokalator breakdown | head -15

echo ""
echo "📈 Historical usage:"
tail -10 logs/token_usage.log

echo ""
echo "🎯 Budget status:"
TOTAL_BUDGETED=18000
TOTAL_USED=$(grep -oP 'Used \K[0-9.]+K' logs/token_usage.log | \
  sed 's/K/000/' | awk '{sum += $1} END {print int(sum)}')
REMAINING=$((TOTAL_BUDGETED - TOTAL_USED))
PERCENTAGE=$((TOTAL_USED * 100 / TOTAL_BUDGETED))

echo "Budgeted:  $TOTAL_BUDGETED tokens"
echo "Used:      $TOTAL_USED tokens ($PERCENTAGE%)"
echo "Remaining: $REMAINING tokens"

if [ $PERCENTAGE -gt 75 ]; then
  echo "⚠️  WARNING: Context approaching limit!"
elif [ $PERCENTAGE -gt 50 ]; then
  echo "🟡 MEDIUM: Halfway through budget"
else
  echo "🟢 GOOD: Well within budget"
fi
```

**Run daily:**
```bash
chmod +x logs/token_dashboard.sh
./logs/token_dashboard.sh
```

---

## Red Flags: When to Pause & Checkpoint

### Checklist: Pause Work If...
- [ ] tokalator sidebar shows **RED** (>75% budget)
- [ ] Conversation history > 50KB
- [ ] Last 5 turns used >500 tokens each (response + context)
- [ ] Working on 3+ simultaneous features
- [ ] Debugging deep issue with many file edits
- [ ] Token usage exceeds monthly budget

### Immediate Actions
```bash
# 1. Create checkpoint
echo "## Checkpoint: $(date +%s)" > logs/checkpoint_$(date +%s).md
tokalator scan . >> logs/checkpoint_$(date +%s).md

# 2. Commit work-in-progress
git add -A
git commit -m "checkpoint: Save token state before reset"

# 3. Document status
cat > logs/checkpoint_status.txt <<EOF
Date: $(date)
Tokens Used: [FROM TOKALATOR]
Context Budget: [FROM TOKALATOR]
Current Phase: [gmail-oauth / whatsapp-parser / etc]
Next Steps: [What needs doing]
Key Files:
  - [file1]
  - [file2]
EOF

# 4. Switch to new session (context will refresh)
echo "✓ Checkpoint saved. Ready for new session."
```

---

## Token Efficiency Tips by Context

### Code Review Scenario
❌ **Inefficient:**
```
[Paste entire file]
[Paste entire diff]
[Long explanation of what to look for]
= 1000+ tokens
```

✅ **Efficient:**
```
[Point to specific lines with grep]
[Show diff of 3-5 key functions]
[Ask specific question: "Check for SQL injection in this query"]
= 100-200 tokens
```

### Debugging Scenario
❌ **Inefficient:**
```
Turn 1: "I have an error"
Turn 2: [Paste error log]
Turn 3: [Describe what I tried]
Turn 4: "Is it X or Y?"
= 4 turns, 500+ tokens
```

✅ **Efficient:**
```
Turn 1: [Error message] + [stack trace] + [Ask: "Root cause?"]
= 1 turn, 200 tokens
```

### Learning/Documentation Scenario
❌ **Inefficient:**
```
"Explain how tokalator works"
[Gets 500-word explanation]
[Then asks follow-ups]
= 800+ tokens
```

✅ **Efficient:**
```
Read tokalator docs: https://tokalator.wiki
[Use VS Code extension]
Ask specific: "How do I pin files?"
= 100 tokens
```

---

## Git Integration: Token-Aware Commits

### Commit Message Template
```
[verb]: [what] [why] ([tokens used])

example: implement: Gmail OAuth2 with error handling (4.2K tokens)

Full message:
- Implements Google OAuth2 authentication flow
- Handles credential refresh automatically
- Errors logged to logs/gmail_errors.log
- Phase budget: 5K, Used: 4.2K ✓

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

### Pre-commit Hook (Optional)
```bash
#!/bin/bash
# hooks/pre-commit

# Warn if token usage exceeds threshold
TOKENS=$(tokalator scan . | grep -oP 'Total: \K[0-9]+')
if [ $TOKENS -gt 15000 ]; then
  echo "⚠️  Warning: Codebase token usage > 15K"
  echo "Consider committing a checkpoint"
fi
```

---

## FAQ: Token Management

**Q: How do I reset the context if I've used too many tokens?**  
A: Create a checkpoint (summary + todos in SQL), commit it, start a new session. Reference the checkpoint in your first message.

**Q: Should I compress all my comments?**  
A: Only inline comments (code explanations). Keep docstrings & README well-written for maintainability.

**Q: Can I cache the Gmail/WhatsApp data?**  
A: Yes! Save parsed emails/messages as JSON. Reuse JSON for analysis = massive token savings (no re-parsing).

**Q: What if I discover a bug mid-project?**  
A: If it's directly related to current work, fix it. If not, log it & continue (avoid scope creep).

**Q: How often should I update token budgets?**  
A: Monthly. Adjust based on actual usage vs. estimate.

---

## Resources & Tools

- **Tokalator Website:** https://tokalator.wiki
- **VS Code Extension:** `vfaraji89.tokalator`
- **Docs:** https://github.com/vfaraji89/tokalator
- **Token Calculators:** https://tokalator.wiki/calculators

---

## Maintenance

**This document should be reviewed:**
- After each major phase completion
- Monthly (1st of month)
- When token usage exceeds budget
- When new tools added to project

**Maintainers:** Copilot + Rahul Verma
