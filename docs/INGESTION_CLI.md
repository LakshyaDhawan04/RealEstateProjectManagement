# Project Data Ingestion CLI

Interactive terminal app to collect emails, WhatsApp chats, and documents for a real estate project.

## Features

✅ **Project Selection**
- Pre-configured projects (e.g., 44500 Parkmeadow Drive, Fremont)
- Or enter custom project name/address

✅ **Interactive Credential Input**
- Gmail OAuth2 (prompts at runtime, not saved)
- Google Drive API (prompts at runtime, not saved)
- WhatsApp WAHA API (prompts at runtime, not saved)

✅ **Select People**
- Specify which people's emails to fetch
- Specify which contacts' WhatsApp chats to fetch
- Example: Sumit Verma, Amee

✅ **Local File Scanning**
- Automatically scans `/Documents/44500` for project-related files
- Matches on project keywords (address, neighborhood, etc)
- No file movement, just cataloging

✅ **Data Ingestion**
- Fetches emails from specified people
- Fetches WhatsApp chats from specified contacts
- Saves all data to `data/{project-id}/` (local only, not committed)

✅ **Privacy First**
- Credentials entered at runtime, never stored
- No `.env` files needed
- All data stored locally in `data/` (in `.gitignore`)

## Installation

```bash
npm install
```

## Usage

```bash
# Run the interactive CLI
node src/ingestion/cli.js
```

## Workflow

### 1. Start the CLI
```bash
node src/ingestion/cli.js
```

### 2. Select Project
```
📍 PROJECT SELECTION

Available projects:
  1. 44500 Parkmeadow Drive, Fremont, California
  2. Custom project name/address

Select project (1-2): 1
✓ Project: 44500 Parkmeadow Drive, Fremont, California
```

### 3. Provide Credentials (Runtime Only)
```
🔐 CREDENTIAL COLLECTION

📧 Gmail Setup:
  1. Go to: https://console.cloud.google.com
  2. Create OAuth credentials (Desktop app)
  3. Enable Gmail API

Enter Gmail Client ID: [your-id]
Enter Gmail Client Secret: [your-secret]
✓ Gmail configured
```

Note: You'll only need to do this once per session. Credentials are never saved to disk.

### 4. Select People to Ingest
```
👥 SELECT PEOPLE TO INGEST DATA FROM

📧 Gmail - Enter email addresses to fetch from:
  Example: sumit.verma@example.com, amee@example.com

Email addresses (comma-separated): sumit.verma@example.com,amee@example.com
✓ Will fetch from: sumit.verma@example.com, amee@example.com
```

### 5. View Results
```
✅ Project: 44500 Parkmeadow Drive, Fremont, California
📁 Location: data/fremont-44500-parkmeadow

Files created:
  • file-scan.json (2.3 KB)      ← Found local files
  • emails.json (5.1 KB)          ← Fetched emails
  • whatsapp-chats.json (3.2 KB)  ← Fetched chats
```

## Data Storage

All ingested data is stored in `data/{project-id}/`:

```
data/
├── fremont-44500-parkmeadow/
│   ├── file-scan.json              # Local files related to project
│   ├── emails.json                 # Emails from specified people
│   ├── whatsapp-chats.json         # WhatsApp chats
│   └── gdrive-files.json           # (Optional) Files from Drive
├── another-project/
│   ├── file-scan.json
│   ├── emails.json
│   └── ...
```

## Security & Privacy

🔒 **Credentials**
- Entered at CLI prompt, never saved to disk
- Only used for this session
- Each run requires re-entry

🔒 **Data**
- Stored in `data/` (in `.gitignore`)
- Never committed to Git
- Safe to review locally before processing

🔒 **No API Keys in Code**
- No `.env` files required
- No credentials in environment
- No secrets in git history

## Examples

### Example 1: Fremont Property
```bash
$ node src/ingestion/cli.js

Select project: 1
Enter Gmail credentials: [prompted]
Gmail emails from: sumit.verma@example.com, amee@example.com
WhatsApp contacts: Sumit Verma, Amee

✅ Data saved to data/fremont-44500-parkmeadow/
```

### Example 2: Custom Project
```bash
$ node src/ingestion/cli.js

Select project: 2
Project name: 123 Oak Street, Palo Alto, CA

✅ Data saved to data/palo-alto-123-oak-street/
```

## Troubleshooting

### "Gmail credentials failed"
- Verify Client ID and Secret from Google Cloud Console
- Make sure Gmail API is enabled
- Check credentials are for Desktop app type

### "No emails found"
- Check email addresses are spelled correctly
- Make sure Gmail credentials have permission to access those accounts
- Try fetching from different people

### "WhatsApp connection failed"
- Verify WAHA API key is valid
- Check phone number format includes country code (e.g., +1)
- Make sure you can access https://waha.devlikeapro.com

## Next Steps

1. **Data Review**: Check `data/{project-id}/` files locally
2. **Data Processing**: Parse and normalize the ingested data
3. **Storage**: Upload to Google Drive or other secure storage
4. **Deletion**: Remove from `data/` after processing (optional)

## Contributing

To add new projects to the pre-configured list, edit `selectProject()` in `cli.js`.

---

**Privacy Notice**: This CLI respects your data. Credentials are never stored, and all data is ingested only for your local review.
