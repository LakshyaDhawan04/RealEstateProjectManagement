# Token Management Rules & Guidelines

**Branch:** `tokenManagement`  
**Model:** Claude Haiku 4.5  
**Tracking Tool:** Tokalator  
**Date Created:** 2026-05-04

---

## Table of Contents
1. [Core Token Management Principles](#core-principles)
2. [Baseline Token Utilization Rules](#baseline-rules)
3. [Communication & Context Rules](#communication-rules)
4. [Tool Usage Optimization](#tool-usage)
5. [Session Memory & State Management](#session-memory)
6. [Monitoring & Enforcement](#monitoring)
7. [Project-Specific Rules](#project-rules)
8. [Tokalator Integration](#tokalator)
9. [Incident Response](#incident-response)

---

## Core Principles

### Mission
Minimize token consumption while maintaining code quality, clarity, and completeness. **Working solutions > verbose explanations.**

### Philosophy
- **Batch over Sequential:** Parallel tool calls (view, grep, bash with &&) = 1 call, not N
- **Compress Context:** Only pass relevant history; summarize long conversations
- **Reuse Over Rebuild:** Cache results; reference prior findings
- **Complete Over Partial:** Fully address requests; avoid back-and-forth validation
- **Local Over Remote:** Use local tools/analysis before API calls
- **Monitor Continuously:** Track usage in real-time with tokalator

---

## Baseline Token Utilization Rules

### 1. RESPONSE LENGTH
| Task Type | Max Tokens | Notes |
|-----------|-----------|-------|
| Status updates | 50-100 | Bullet points, no prose |
| Code reviews | 100-200 | Issues only, not style |
| Implementation summaries | 100-150 | What, why, next steps |
| Error explanation | 150-200 | Root cause + solution |
| Complex analysis | 200-300 | When unavoidable, but compress after |

**Rule:** Always assume context is retained. Don't repeat prior explanations.

### 2. CONTEXT COMPRESSION
- **Keep:** File paths, function names, error messages, prior decisions
- **Trim:** Verbose explanations, redundant context, "nice-to-have" details
- **Reference:** "As discussed earlier" instead of re-explaining
- **Summarize:** If history > 10KB, create summary checkpoint

### 3. PROMPT EFFICIENCY
```
❌ Bad: "I'm thinking about creating a user auth module with JWT tokens, should I use bcrypt or Argon2, what about sessions, should I cache tokens, etc?"

✅ Good: "Implement JWT auth with bcrypt password hashing, no sessions. Cache tokens for 1 hour."
```

**Rule:** One decision per question. Bundle all clarifications into single ask_user call.

---

## Communication Rules

### 4. RESPONSE STRUCTURE
```
[Intent update if applicable]
[Parallel tool calls for independent operations]
[Brief summary: 1-2 sentences what was done]
[Next steps: If not complete]
```

**Examples:**

✅ Good (80 tokens):
```
✓ Created branch. Set up ingestion structure with tokalator config.
Gmail/WhatsApp ingesters stubbed (OAuth/WAHA to implement).
Ready for credentials setup.
```

❌ Bad (300+ tokens):
```
I've created a new branch called source-ingestion. This branch will contain
all the data ingestion logic for Gmail and WhatsApp. I've set up the 
directory structure including src/ingestion, data folders for outputs, 
and documentation. I've also created stub implementations of the Gmail 
OAuth ingester and WhatsApp export parser...
```

### 5. CONTEXT RETENTION
- **Assume prior knowledge:** Don't re-explain decisions from earlier turns
- **Reference explicitly:** "Per earlier discussion, we use tokalator for tracking..."
- **Link to memory:** "See TOKEN_MANAGEMENT_RULES.md section 3 for context compression rules"

### 6. BATCHING QUESTIONS
```
❌ Sequential (wastes tokens):
Turn 1: "Should we use Gmail API?"
Turn 2: "Should we use WAHA for WhatsApp?"
Turn 3: "What about token tracking?"

✅ Parallel (efficient):
Turn 1: ask_user with 3 choices:
- "Which API for Gmail? (OAuth/IMAP/Google Takeout)"
- "Which API for WhatsApp? (WAHA/WhatsApp Business/Manual Export)"
- "Token tracking preference? (Tokalator/Tokentap/LiteLLM)"
```

---

## Tool Usage Optimization

### 7. BASH COMMAND CHAINING
```bash
# ❌ Bad: 3 calls
mkdir -p src/ingestion
touch src/ingestion/gmail.js
touch src/ingestion/whatsapp.js

# ✅ Good: 1 call
mkdir -p src/ingestion && touch src/ingestion/{gmail,whatsapp}.js
```

### 8. FILE OPERATIONS
| Operation | Best Practice |
|-----------|---|
| Reading multiple files | Call `view` 3+ times in ONE response (parallel) |
| Large files (>20KB) | Use `view_range` to read sections |
| Multiple edits, same file | Call `edit` N times in ONE response (sequential) |
| Creating templates | Batch create related files in one response |

### 9. SEARCH OPERATIONS
```
Priority order:
1. Code intelligence (LSP, if available)
2. Glob patterns (for file discovery)
3. Grep with patterns (for content search)
4. Bash find (last resort)

❌ Bad: grep in bash loop
for file in $(find . -name "*.js"); do grep "pattern" $file; done

✅ Good: Single grep call
grep -r "pattern" --include="*.js" .
```

### 10. EXTERNAL API CALLS (web_fetch, GitHub)
- **Batch independent requests:** Fetch 3–5 URLs in parallel
- **Set max_length appropriately:** 2000–3000 chars, not 20000
- **Combine related queries:** One GitHub search > multiple endpoint calls
- **Cache responses:** Reference earlier fetches, don't re-fetch same URL

---

## Session Memory & State Management

### 11. PLAN.MD USAGE
**When to create plan.md:**
- Multi-phase projects (3+ distinct phases)
- Unclear scope or dependencies
- Work spanning multiple days/sessions

**When NOT to create:**
- Simple one-off tasks
- Single-file edits
- Exploratory work

**Format:**
```markdown
## Problem
[What are we solving?]

## Approach
[High-level strategy]

## Todos
[Use SQL todos table, not markdown checkboxes]

## Notes
[Assumptions, risks, decisions]
```

### 12. SQL TODO TRACKING
```sql
INSERT INTO todos (id, title, description) VALUES
  ('gmail-oauth', 'Implement Gmail OAuth2', 'Set up credentials, authenticate, fetch emails'),
  ('whatsapp-parser', 'Parse WhatsApp exports', 'Handle .txt format, extract metadata');

INSERT INTO todo_deps (todo_id, depends_on) VALUES
  ('gmail-oauth', 'setup-credentials');

-- Before starting work:
UPDATE todos SET status = 'in_progress' WHERE id = 'gmail-oauth';

-- After completion:
UPDATE todos SET status = 'done' WHERE id = 'gmail-oauth';
```

### 13. CONTEXT CHECKPOINTS
When conversation history exceeds 50KB:
1. Create checkpoint summary (problem → solution, key files)
2. Reference checkpoint in next session: "Checkpoint #1: Gmail OAuth setup"
3. Trim session history, keep only recent turns

---

## Monitoring & Enforcement

### 14. TOKALATOR MONITORING
**Daily workflow:**
```bash
# Check context budget before starting
tokalator config --show
tokalator scan .

# In VS Code: Sidebar shows LOW/MEDIUM/HIGH
# Pin critical files (ingestion modules, config)
```

**Token budget thresholds:**
- 🟢 **LOW:** 0–25% of context window
- 🟡 **MEDIUM:** 25–50%
- 🔴 **HIGH:** 50–75%
- 🛑 **CRITICAL:** >75% (summarize & reset)

### 15. METRICS TO TRACK
| Metric | Target | Action if Exceeded |
|--------|--------|---|
| Avg response tokens | <150 | Compress prompts |
| Avg request tokens | <500 | Trim context history |
| Context budget | <75% | Summarize & checkpoint |
| Token per file | <5K | Refactor modules |

### 16. COST EFFICIENCY
**Claude Haiku 4.5 pricing:** ~$0.80/$2.40 per 1M input/output tokens

**Budget tracking:**
```
Expected monthly: 5M tokens @ ~$5 = acceptable
Monthly limit: 10M tokens @ ~$10 = revert to GPT-5 mini
```

---

## Project-Specific Rules

### 17. REAL ESTATE INGESTION PROJECT

**Scope:**
- Gmail ingestion (OAuth2, parse emails)
- WhatsApp ingestion (export parser or WAHA API)
- Token tracking (tokalator integration)
- Data output (JSON format, cacheable)

**Token budget per phase:**
| Phase | Budget | Tool |
|-------|--------|------|
| Setup & config | 2K | tokalator |
| Gmail OAuth | 5K | tokalator |
| WhatsApp parser | 5K | tokalator |
| Integration | 3K | tokalator |
| Testing | 2K | tokalator |

**Files to pin in tokalator:**
- `src/ingestion/gmail_ingester.js`
- `src/ingestion/whatsapp_ingester.js`
- `.tokalator.json` (config)
- `.env.example` (credentials template)

### 18. BRANCH STRATEGY
- **main:** Production-ready code only
- **source-ingestion:** Gmail + WhatsApp implementation
- **tokenManagement:** Token rules, monitoring, memory (THIS BRANCH)
- Feature branches off `source-ingestion`: Individual components

### 19. COMMIT MESSAGE STANDARDS
```
[lowercase verb] [what]: [why/context]

✅ Examples:
- "implement: Gmail OAuth authentication with error handling"
- "docs: Add tokalator setup guide for token tracking"
- "refactor: Compress WhatsApp parser into utility module"
- "test: Add ingestion pipeline integration tests"

Always include:
Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Tokalator Integration

### 20. SETUP
```bash
# Install
pip install tokalator

# Configuration (~/.config/tokdu/config.ini on macOS)
tokalator config --tokenizer anthropic
tokalator config --model claude-haiku-4.5

# VS Code Extension
Install: vfaraji89.tokalator from Marketplace
```

### 21. USAGE
```bash
# Scan codebase, show token distribution
tokalator scan .

# Show token breakdown by file
tokalator                    # Interactive TUI

# Estimate context for current session
tokalator context estimate

# Get caching savings estimate
tokalator cache estimate
```

### 22. VS CODE SIDEBAR
- **Show:** Token count per open file
- **Rank:** By relevance (imports, recency, diagnostics)
- **Pin:** Critical files to always count them
- **Commands:** `@tokalator count`, `@tokalator optimize`, `@tokalator breakdown`

---

## Incident Response

### 23. CONTEXT OVERLOAD
**If tokalator shows >75% budget:**

1. **Immediate:** Checkpoint current work (summary → SQL todos)
2. **Compress:** Remove unrelated files from workspace
3. **Cache:** Save parsed data as JSON (Gmail emails, WhatsApp messages)
4. **Reset:** Start new session, reference checkpoint
5. **Monitor:** Track tokens in new session

**Checkpoint format:**
```markdown
## Checkpoint #1: Gmail OAuth Implementation
- What: Implemented Google OAuth2 credentials flow
- Files: src/ingestion/gmail_ingester.js
- Status: Tokens used: 8K / 10K budget
- Next: Implement email fetch logic
- Reference: TOKEN_MANAGEMENT_RULES.md#12
```

### 24. RUNAWAY TOKENS
**If usage exceeds budget by 20%:**

1. Stop all new work (pause ongoing tasks)
2. Review last 10 turns for inefficiencies (sequential calls, verbose output)
3. Document root cause in logs/incident.md
4. Revert to GPT-5 mini for remainder of month
5. Post-mortem: Adjust rules to prevent recurrence

**Incident log:**
```
Date: 2026-05-04
Issue: Exceeded budget by 2K tokens
Root cause: Sequential web_fetch calls instead of parallel
Action: Batch 4 GitHub searches into 1 call
Result: 40% token reduction
```

### 25. RECOVERY PROCEDURES
```bash
# If tokens exceed threshold:
1. Save session state: cp -r .copilot/session-state ~/backup/
2. Create checkpoint.md summarizing work
3. Push checkpoint + todos to git
4. Start new session (fresh context)
5. Reference checkpoint in first message
```

---

## Enforcement Checklist

Before starting work:
- [ ] Read relevant section of TOKEN_MANAGEMENT_RULES.md
- [ ] Check tokalator budget: `tokalator scan .`
- [ ] Batch independent operations (view, grep, bash with &&)
- [ ] Prepare ask_user question (all clarifications at once)

Before completing task:
- [ ] Response ≤150 words (for routine work)
- [ ] All independent tool calls batched
- [ ] Context history trimmed (no repetition)
- [ ] Next steps documented

Before committing:
- [ ] Add Co-authored-by trailer
- [ ] Reference token budget spent in commit message (if >2K tokens)
- [ ] Update plan.md or SQL todos

---

## Quick Reference: Token-Saving Shortcuts

| Situation | Bad (Expensive) | Good (Efficient) |
|-----------|---|---|
| 3 files to read | View them separately | Call view 3x in 1 response |
| Multiple searches | grep in loop | Batch 4 grep calls |
| Bash commands | 5 separate calls | Chain with && in 1 call |
| Multiple edits | 1 edit per turn | Batch edits in 1 turn |
| Clarifications | Ask one-by-one | ask_user with all choices |
| Web research | Fetch 1 URL, wait | Fetch 4 URLs in parallel |
| Explanations | Verbose prose | Bullet points, short |
| Context | Repeat everything | Reference prior turns |

---

## Version History
- **v1.0** (2026-05-04): Initial token management rules, tokalator integration, project-specific guidelines
- **Last Updated:** 2026-05-04
- **Maintained By:** Copilot + Rahul Verma
- **Review Frequency:** Quarterly or after major incidents

---

## Related Documents
- [SETUP.md](./docs/SETUP.md) — Project setup & dependencies
- [TOKEN_UTILIZATION_RULES.md](./TOKEN_UTILIZATION_RULES.md) — Earlier version (reference only)
- plan.md — Project planning & task tracking
- logs/incidents.md — Token runaway incidents & resolutions
