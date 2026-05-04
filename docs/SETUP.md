# Real Estate Data Ingestion Setup

## Overview
This project ingests data from Gmail and WhatsApp with **tokalator** for token tracking.

## Prerequisites
- Node.js 16+
- Python 3.10+
- Gmail API credentials (OAuth2)
- WhatsApp access (export file or WAHA instance)

## Installation

### 1. Environment Setup
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 2. Install Dependencies
```bash
npm install
pip install tokalator
```

### 3. Token Tracking (Tokalator)

**Start tokalator dashboard:**
```bash
npm run dev
```

**View token usage per file:**
```bash
npm run token-usage
```

**VS Code Extension:**
- Install: `vfaraji89.tokalator` from VS Code Marketplace
- Sidebar shows context budget in real-time

## Gmail Setup

### Get OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → Enable Gmail API
3. Create OAuth 2.0 credentials (Desktop app)
4. Download JSON → Add `client_id`, `client_secret` to `.env`

### Run Gmail Ingester
```bash
npm run ingestion:gmail
```

Outputs: `data/gmail/emails_*.json`

## WhatsApp Setup

### Option A: Export File
1. WhatsApp → Settings → Chats → Export chat (without media)
2. Save file locally
3. Run:
```bash
npm run ingestion:whatsapp <path/to/export.txt>
```

### Option B: WAHA API
1. Deploy WAHA: https://github.com/devlikeapro/waha
2. Configure `WAHA_API_URL` and `WAHA_API_KEY` in `.env`
3. Run:
```bash
npm run ingestion:whatsapp
```

Outputs: `data/whatsapp/messages_*.json`

## Token Management

### Tokalator Features
- **Real-time context budget** — See how many tokens you're using
- **File relevance ranking** — Only count what matters
- **Model comparison** — Switch models to see token delta
- **Caching calculator** — Estimate prompt caching savings

### Best Practices
1. Pin critical files (ingestion modules, config)
2. Monitor context budget before each run
3. Use `@tokalator optimize` to suggest cleanup
4. Cache parsed data (JSON outputs)

## Project Structure
```
.
├── src/ingestion/
│   ├── gmail_ingester.js
│   └── whatsapp_ingester.js
├── data/
│   ├── gmail/
│   └── whatsapp/
├── config/
├── logs/
├── .tokalator.json
└── package.json
```

## Next Steps
- [ ] Implement Gmail OAuth authentication
- [ ] Implement WhatsApp WAHA integration
- [ ] Add data parsing/normalization
- [ ] Set up ingestion schedule
- [ ] Create analysis pipeline
