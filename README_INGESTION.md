# Real Estate Project Data Ingestion

**Simple. Interactive. Private.**

Ingest emails, WhatsApp chats, and documents for real estate projects without storing credentials.

## Quick Start

```bash
# Run the interactive CLI
node src/ingestion/cli.js

# You'll be prompted for:
# 1. Project selection (e.g., 44500 Parkmeadow Drive, Fremont)
# 2. Gmail/Drive/WhatsApp credentials (runtime only, not saved)
# 3. Which people's data to fetch (e.g., Sumit Verma, Amee)
```

## Example: 44500 Parkmeadow Drive, Fremont, California

### What happens when you run it:

```
📍 PROJECT SELECTION
✓ Project: 44500 Parkmeadow Drive, Fremont, California

🔐 CREDENTIAL COLLECTION
📧 Gmail Setup: [Enter Client ID & Secret]
💬 WhatsApp Setup: [Enter WAHA API Key & Phone]

👥 SELECT PEOPLE TO INGEST DATA FROM
📧 Gmail emails from: sumit.verma@example.com, amee@example.com
💬 WhatsApp chats from: Sumit Verma, Amee

📁 SCANNING LOCAL FILES
✓ Found 12 related files:
  • documents/property-details.pdf
  • permits/site-plan-2026.pdf
  • correspondence/email-thread-mar.pdf
  ... and 9 more

📧 FETCHING EMAILS
✓ Saved 24 emails to data/fremont-44500-parkmeadow/emails.json

💬 FETCHING WHATSAPP CHATS
✓ Saved 47 messages to data/fremont-44500-parkmeadow/whatsapp-chats.json

✅ INGESTION COMPLETE
📦 All data saved to: data/fremont-44500-parkmeadow/
✅ Credentials not saved anywhere
✅ data/ folder is in .gitignore (never committed)
```

### Output files:
```
data/fremont-44500-parkmeadow/
├── file-scan.json           # Local files matching project
├── emails.json              # Emails from Sumit & Amee
└── whatsapp-chats.json      # Chat transcripts
```

## How It Works

### 1. **No Credentials on Disk**
```
❌ BEFORE: Credentials in .env → Risk of exposure in git
✅ NOW: Credentials entered at CLI → Lost after session ends
```

### 2. **Interactive Selection**
```
Which project? → Pick from pre-configured or custom
Which people? → Sumit Verma, Amee (comma-separated)
Which services? → Gmail? Yes/No, WhatsApp? Yes/No
```

### 3. **Local Data Collection**
```
Your ~/Documents/44500:
  ✓ Scans for project-related files
  ✓ Lists matches for your review
  ✓ Fetches emails from specified people
  ✓ Fetches WhatsApp chats from specified people
  ✓ All data → data/ folder
```

### 4. **Privacy First**
```
data/fremont-44500-parkmeadow/
  ├── .gitignore (prevents accidental commit)
  ├── emails.json (local only)
  ├── whatsapp-chats.json (local only)
```

## Setup Instructions

### Gmail Credentials

1. Go to: https://console.cloud.google.com
2. Create new project or select existing
3. Enable APIs:
   - Gmail API
   - Google+ API
4. Create OAuth 2.0 Client ID (Desktop app type)
5. Download credentials JSON
6. Note the **Client ID** and **Client Secret**

When you run the CLI, it will ask for these values.

### Google Drive (Optional)

1. Same Google Cloud project
2. Enable Google Drive API
3. Create OAuth 2.0 Client ID (Desktop app type)
4. Note the **Client ID** and **Client Secret**

### WhatsApp (WAHA API)

1. Visit: https://waha.devlikeapro.com
2. Sign up / Log in
3. Create new connection
4. Note your **API Key** and **Phone Number**

When you run the CLI, it will ask for these values.

## Full Documentation

See **[docs/INGESTION_CLI.md](docs/INGESTION_CLI.md)** for:
- Detailed workflows
- Troubleshooting
- Adding custom projects
- Data format examples

## Security & Privacy

✅ **Credentials are NEVER saved**
- Entered at runtime
- Only used for this session
- Lost after CLI ends

✅ **Data is LOCAL ONLY**
- Stored in `data/` folder
- In `.gitignore` (never committed)
- Safe for local review

✅ **No Secrets in Code**
- No environment variables required
- No `.env` files needed
- No credentials in git history

## Examples

### Add More People
```bash
# Just run the CLI again with different people
node src/ingestion/cli.js

Select project: 1 (Fremont project)
📧 Gmail emails from: sumit.verma@example.com,amee@example.com,john.doe@example.com
💬 WhatsApp chats from: Sumit Verma,Amee,John Doe
```

### Custom Project
```bash
# Run the CLI and select option 2
node src/ingestion/cli.js

Select project: 2
Enter project name/address: 123 Oak Street, Palo Alto, California
```

### Review Data Locally
```bash
# Check what was ingested
cat data/fremont-44500-parkmeadow/emails.json | jq '.'
```

## What's Next?

Once you've ingested data:

1. **Review** the files in `data/{project}/`
2. **Process** and normalize the data (optional)
3. **Upload** to secure storage if needed
4. **Delete** from `data/` when done (or keep for reference)

---

**Ready to ingest?**

```bash
node src/ingestion/cli.js
```

No setup needed. Just run it.
