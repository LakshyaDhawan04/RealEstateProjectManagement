# GitHub Copilot Agent + Claude Haiku 4.5: Best Practices

**Community Research-Based Guidelines**  
**Date:** 2026-05-04  
**Model:** Claude Haiku 4.5  
**Integration:** GitHub Copilot CLI Agent Mode

---

## Table of Contents
1. [Model Selection Strategy](#model-strategy)
2. [Token Optimization for Haiku](#token-optimization)
3. [Copilot Agent Mode Best Practices](#agent-mode)
4. [Session Management](#session-management)
5. [Real-World Patterns](#patterns)
6. [Troubleshooting](#troubleshooting)

---

## Model Selection Strategy

### Why Claude Haiku 4.5?

**Strengths (from community research):**
- ✅ Cost-effective: ~$0.80/$2.40 per 1M tokens (vs. Sonnet $3/$15)
- ✅ Fast inference: Suitable for iterative workflows
- ✅ 200K context window: Enough for most projects
- ✅ Excellent for code analysis, not complex reasoning
- ✅ Good for agents: Lightweight, suitable for many parallel calls

**Best Use Cases:**
- Data ingestion & parsing (Gmail, WhatsApp)
- Code review & refactoring
- Test generation
- Documentation generation
- Token-constrained environments

**Not Recommended For:**
- Complex multi-step reasoning (use Sonnet instead)
- Novel algorithm design (use Sonnet or Opus)
- Deep architectural decisions (use human + Sonnet)

### When to Switch Models

| Situation | Action |
|-----------|--------|
| >75% token budget used | Checkpoint, consider Sonnet for complex part |
| Task requires deep reasoning | Switch to claude-sonnet-4 |
| Simple code generation | Stay with Haiku 4.5 |
| Building production system | Use Haiku for iteration, Sonnet for final review |
| Research/exploration | Haiku 4.5 (fast iteration) |

---

## Token Optimization for Haiku

### Community Best Practices (From GitHub Discussions)

#### 1. Prompt Compression
```
❌ Bad (280 tokens):
"I have a complex data ingestion pipeline for Gmail and WhatsApp messages. 
I need to fetch emails using OAuth2, parse them, extract metadata like 
sender, recipient, subject, and body. For WhatsApp, I need to handle both 
export files and live API integration using WAHA. Then I need to normalize 
the data and store it as JSON. Can you help me design this?"

✅ Good (60 tokens):
"Design Gmail OAuth2 + WhatsApp WAHA ingesters. Parse emails/messages.
Output: JSON with sender, subject, body, timestamp. Use Haiku 4.5."
```

**Token savings: 78% reduction**

#### 2. Context Windowing
```bash
# ❌ Bad: Include entire project in context
ls -la                    # Shows everything

# ✅ Good: Explicitly limit context
grep -r "gmail" src/      # Only relevant files
tokalator scan .          # See what Haiku will consume
```

#### 3. Batch Operations
```javascript
// ❌ Bad: Sequential API calls (3 calls × 100 tokens = 300)
await ingestGmail();
await ingestWhatsApp();
await normalizeData();

// ✅ Good: Batch in one prompt (1 call × 150 tokens = 150)
"Implement all three: Gmail OAuth, WhatsApp parser, data normalization"
```

#### 4. Caching Strategy
```python
# ❌ Bad: Fetch & parse emails every session
def get_emails():
    return gmail_api.fetch()
    
# ✅ Good: Cache parsed data
def get_emails():
    if cache.exists('emails.json'):
        return cache.load('emails.json')
    emails = gmail_api.fetch()
    cache.save(emails)
    return emails
```

**Token savings: 90% on repeated queries**

---

## Copilot Agent Mode Best Practices

### From Community Research: AGENTS.md Rules

**Key Finding:** Drop-in AGENTS.md with 15 rules for AI coding agents works across Claude/GPT/Cursor/Copilot.

#### Rule 1: Clear Intent Statements
```markdown
# Intent
Implement Gmail OAuth2 authentication flow with token refresh.
No external dependencies beyond google-auth-oauthlib.

# Success Criteria
- Credentials load from .env
- Auto-refresh tokens when expired
- Error handling with logging
```

#### Rule 2: Separate Concerns
```
❌ Don't: "Implement everything in one go"
✅ Do: Break into phases:
  1. Auth setup (1K tokens)
  2. Email fetch (2K tokens)
  3. Data parsing (1.5K tokens)
```

#### Rule 3: Pin Critical Files
```
In tokalator sidebar, PIN:
- src/ingestion/gmail_ingester.js
- src/ingestion/whatsapp_ingester.js
- .tokalator.json (config)

UNPIN (temporary):
- logs/
- data/
- node_modules/
```

#### Rule 4: Define Boundaries
```
Include in prompt:
- What files to modify ✓
- What NOT to change ✓
- File limits (no file >500 lines) ✓
- Token budget (max 5K per phase) ✓
```

#### Rule 5: State Management
```bash
# At start of session:
1. Update plan.md
2. Check SQL todos (status = pending)
3. Check token budget (tokalator scan)

# During work:
1. Mark todos as in_progress
2. Monitor context (aim for <75%)

# After completion:
1. Mark todos as done
2. Log tokens used
3. Commit with reference
```

#### Rule 6: Error Handling
```javascript
// ✅ Good: Proactive error handling
try {
  const auth = await authenticateGmail();
} catch (error) {
  console.error('Auth failed:', error.message);
  logger.log({timestamp, error, context});
}

// ✗ Bad: Ignore errors, let them bubble up
const auth = authenticateGmail();  // Haiku won't know what failed
```

#### Rule 7: Testing Strategy
```
Define testing expectations UPFRONT:
- Unit tests: gmail_ingester.test.js (3 test cases)
- Integration: ingestion_pipeline.test.js (2 test cases)
- Not testing: Google API (mocked)

Saves tokens on back-and-forth debugging
```

---

## Session Management

### Recommended Workflow (From Research)

#### Morning: Session Startup
```bash
1. Check token budget
tokalator scan .

2. Review yesterday's work
cat logs/token_usage.log | tail -10

3. Set daily budget
echo "Budget: 10K tokens for today" > logs/daily_budget.txt

4. Load last checkpoint
git log --grep="checkpoint" -1  # See what was done

5. Update plan.md
# Add new tasks, update status
```

#### During Work: Continuous Monitoring
```bash
# Every 30 min:
1. Check context usage
tokalator breakdown | head -10

2. Monitor response length
# Target: <150 words for routine updates

3. Track todos
# Only work on items marked as in_progress
```

#### End of Session: Checkpoint
```bash
1. Save state
tokalator scan . > logs/checkpoint_$(date +%s).json

2. Document progress
echo "Completed: Gmail OAuth setup (4.2K tokens)" >> logs/token_usage.log

3. Commit
git add -A
git commit -m "feat: Gmail OAuth implementation (4.2K tokens)"

4. If >75% budget used:
   - Create summary in plan.md
   - Start fresh session tomorrow
```

### Session Types

| Session Type | Duration | Token Budget | Goal |
|--------------|----------|--------------|------|
| **Deep Work** | 2-3 hours | 5-8K | Implement one complete feature |
| **Quick Fix** | 30-60 min | 1-2K | Bug fix or documentation |
| **Research** | 1-2 hours | 2-3K | Explore options, prototype |
| **Integration** | 1 hour | 1-2K | Wire components together |
| **Review** | 30 min | 0.5-1K | Code review, optimize |

---

## Real-World Patterns

### Pattern 1: Iterative Feature Development (Haiku-Friendly)

**Workflow:**
```
Session 1 (2K tokens): Basic skeleton + setup
Session 2 (2K tokens): Implement core logic
Session 3 (1.5K tokens): Error handling & edge cases
Session 4 (1K tokens): Testing & documentation
Total: 6.5K tokens

✓ Never exceeded 75% budget
✓ Clean checkpoint between sessions
✓ Easy to debug (isolated phases)
```

### Pattern 2: Gmail Ingestion Example

**Setup Phase (2K budget):**
```markdown
## Task
Setup Gmail OAuth2 credentials flow

## Files to Create/Modify
- src/ingestion/gmail_ingester.js
- config/gmail_config.json
- .env.example

## Deliverables
- Authenticate with Google OAuth2
- Handle token refresh
- Log errors

## Constraints
- No external deps beyond google-auth-oauthlib
- Max 200 lines of code
- Must pass: node src/ingestion/gmail_ingester.js --test
```

**Expected output:**
- Haiku focuses on essentials
- No verbose comments
- Clean, testable code
- ~4K tokens used

### Pattern 3: WhatsApp Parser Example

**Setup Phase (1.5K budget):**
```markdown
## Task
Parse WhatsApp export (.txt) files

## Input Format
[HH:MM, DD/MM/YYYY] Sender Name: Message text
[14:30, 04/05/2026] Alice: Hello there

## Output Format (JSON)
{
  "messages": [
    {"timestamp": "14:30", "sender": "Alice", "content": "Hello there", "type": "text"}
  ]
}

## Edge Cases Handled
- Multi-line messages
- Media placeholders (<image omitted>)
- Emojis & special characters
```

**Expected output:**
- <100 lines of parser code
- Handles 95% of real-world exports
- ~2K tokens used

---

## Troubleshooting

### Issue 1: Context Budget Exceeds 75%

**Root Causes (From Research):**
1. Sequential file reads (should batch)
2. Verbose context history (should summarize)
3. Large unrelated files in workspace
4. Too many open conversations

**Solutions:**
```bash
# 1. Clean workspace
rm -rf node_modules logs/old_*.log data/*.json

# 2. Summarize history
# Create checkpoint → start new session

# 3. Pin only critical files
tokalator config --exclude "**/logs,**/data,**/node_modules"

# 4. Use shorter prompts
# Before: 500 words of explanation
# After: 50 words + pointer to docs
```

### Issue 2: Haiku Misses Nuances

**When It Happens:**
- Complex architectural decisions
- Multi-step reasoning (>3 steps)
- Novel algorithm design

**Solution:**
```
# Use Haiku for:
✓ Code generation (straightforward patterns)
✓ Data parsing
✓ Bug fixes
✓ Testing

# Use Sonnet for:
✓ Architecture decisions
✓ Algorithm design
✓ Security review
✓ Final sanity check
```

### Issue 3: Repeated Token Usage

**Symptom:**
"Why do I keep re-parsing the same emails?"

**Solution:**
```python
# Implement caching layer
class CachedEmailParser:
    def __init__(self):
        self.cache = {}
    
    def parse(self, email_id):
        if email_id in self.cache:
            return self.cache[email_id]  # 5 tokens
        
        parsed = expensive_parse(email_id)  # 50 tokens
        self.cache[email_id] = parsed
        return parsed
```

**Result:** 90% reduction on repeated queries

### Issue 4: Unclear Progress

**Solution:**
```bash
# Use plan.md + SQL todos for clarity
git show HEAD:plan.md        # What was planned
cat logs/token_usage.log     # What was executed
tokalator scan .             # What's being worked on

# Daily standup (for yourself):
echo "✓ Gmail OAuth done (4.2K tokens)"
echo "◐ WhatsApp parser in progress (2K/5K tokens)"
echo "○ Testing not started"
```

---

## Real Estate Ingestion: Haiku-Optimized Plan

### Phase Breakdown (18K total budget)

| Phase | Task | Budget | Haiku Fit | Notes |
|-------|------|--------|-----------|-------|
| Setup | Credentials, env, structure | 2K | ✓ Excellent | Straightforward |
| Gmail OAuth | Authentication flow | 3K | ✓ Excellent | Pattern-based |
| Gmail Fetch | Email retrieval & parsing | 2K | ✓ Excellent | Data extraction |
| WhatsApp Parser | Export file parsing | 2K | ✓ Excellent | String manipulation |
| Normalization | Combine data formats | 1.5K | ✓ Good | Simple transformation |
| Testing | Unit + integration tests | 2K | ✓ Excellent | Straightforward |
| Docs | Setup guide + API docs | 1.5K | ✓ Excellent | Clear instructions |
| Review | Code review, optimization | 2K | ◐ Okay | Consider Sonnet |
| **Total** | | **18K** | | |

### Execution Strategy

```
Week 1:
  Day 1: Setup (2K) + Gmail OAuth (3K) = 5K
  Day 2: Gmail Fetch (2K) + WhatsApp Parser (2K) = 4K
  → Checkpoint, review token usage

Week 2:
  Day 3: Normalization (1.5K) + Testing (2K) = 3.5K
  Day 4: Docs (1.5K) + Review with Sonnet (2K) = 3.5K
  → Final review, commit

Total: 18K tokens (2 weeks, ~9K/week)
```

---

## Copilot Agent Configuration

### Recommended .copilot-setup-steps.yml

```yaml
version: "1.0"
preinstall_tools:
  - npm
  - python3
  - git

preinstall_packages:
  - npm: "npm install -g tokalator"
  - pip: "pip install tokdu"

model_selection:
  default: "claude-haiku-4.5"
  override_for_task: null
  
context_limits:
  max_input_tokens: 50000
  max_output_tokens: 2048
  checkpoint_at: 75%

memory:
  type: "session + sql"
  checkpoint_frequency: "Every 5K tokens"
  
tracking:
  token_counter: "tokalator"
  budget_alert: "80%"
```

---

## Quick Reference: Token Budget per Task

| Task | Budget | Tool | Notes |
|------|--------|------|-------|
| Setup project | 2K | Haiku | Straightforward |
| Implement API client | 3-4K | Haiku | Pattern-based |
| Data parsing | 2K | Haiku | String/JSON work |
| Write tests | 2K | Haiku | Systematic |
| Documentation | 1-2K | Haiku | Copy template |
| Code review | 2-3K | Sonnet | Requires reasoning |
| Architecture decision | 3-5K | Sonnet | Deep analysis |
| Bug debugging | 2-3K | Haiku or Sonnet | Depends on complexity |

---

## Resources

- **Tokalator:** https://tokalator.wiki
- **Claude Haiku Evals:** https://github.com/centminmod/claude-haiku-4.5-evaluation
- **AGENTS.md Pattern:** https://github.com/search?q=AGENTS.md
- **Copilot Docs:** https://docs.github.com/en/copilot
- **Anthropic Docs:** https://docs.anthropic.com

---

## Version History
- **v1.0** (2026-05-04): Initial best practices, community research integration
