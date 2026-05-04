# Global Copilot Token Management Settings

This directory contains global configuration for token management across all projects in this repository.

## Files

### `.copilot-token-config.json`
Global configuration in JSON format. Contains:
- Token budget allocation (18,000 tokens total)
- Phase breakdowns (Setup, Gmail OAuth, WhatsApp Parser, etc.)
- Response length constraints (100-300 words depending on task)
- Model strategy (when to use Haiku vs. Sonnet)
- Checkpoint procedures & incident response
- Monitoring configuration

**Used by:** All sessions, agents, and projects in this repo

### `.copilot-token-rules.sh`
Bash script with global token management functions. Contains:
- Environment variables (budget, thresholds, model)
- `copilot_show_rules()` — Display rules reminder
- `copilot_check_budget()` — Show current token usage
- `copilot_load_session()` — Initialize token tracking for session

**Usage:**
```bash
# Load rules (optional, can auto-load on shell startup)
source .copilot-token-rules.sh
copilot_load_session

# Check budget anytime
copilot_check_budget

# Show rules
copilot_show_rules
```

## How to Apply Globally

### Option 1: Auto-Load on Shell Startup
Add to your `~/.zshrc` or `~/.bashrc`:
```bash
if [ -f "$HOME/RealEstateProjectManagement/.copilot-token-rules.sh" ]; then
  source "$HOME/RealEstateProjectManagement/.copilot-token-rules.sh"
  copilot_load_session
fi
```

### Option 2: Manual Load Per Session
```bash
cd /Users/rahulverma/RealEstateProjectManagement
source .copilot-token-rules.sh
copilot_load_session
```

### Option 3: Copilot Agent Auto-Load
The GitHub Copilot agent reads `.copilot-token-config.json` automatically when:
- Starting a new session
- Opening the repo in Copilot mode
- Running Copilot CLI agent

No manual action required—rules apply automatically.

## Configuration Override

To override settings for a specific session:
```bash
# Example: Increase budget for this session
export COPILOT_TOKEN_BUDGET=25000

# Example: Use Sonnet instead of Haiku
export COPILOT_MODEL="claude-sonnet-4"

# Show updated settings
copilot_show_rules
```

## Reference

- **TOKEN_MANAGEMENT_RULES.md** — Detailed baseline rules (25 sections)
- **TOKEN_TRACKING_BEST_PRACTICES.md** — Daily workflow & strategies
- **CLAUDE_HAIKU_BEST_PRACTICES.md** — Community research best practices
- **logs/token_dashboard.sh** — Real-time monitoring dashboard

## Integration with CI/CD

To enforce token rules in automation:
```yaml
# Example: GitHub Actions workflow
- name: Check Token Budget
  run: |
    source .copilot-token-rules.sh
    copilot_check_budget
    
- name: Enforce Rules
  env:
    COPILOT_TOKEN_BUDGET: ${{ secrets.COPILOT_TOKEN_BUDGET }}
  run: |
    # Your validation logic here
```

## Support

For token management issues:
1. Check `logs/token_usage.log` — View activity
2. Run `./logs/token_dashboard.sh` — Check status
3. Review `logs/incidents.md` — See previous issues
4. Reference `TOKEN_MANAGEMENT_RULES.md` — Rule details

---

**Last Updated:** 2026-05-04  
**Status:** ✅ Global settings active  
**Applied to:** All sessions in this repository
