# OAuth Setup Guide

Complete sign-in setup for Gmail, Google Drive, and WhatsApp.

## Quick Start

```bash
# 1. Copy .env.example to .env
cp .env.example .env

# 2. Fill in credentials (see sections below)
nano .env

# 3. Run OAuth setup
npm run auth:signin

# 4. Verify all services
npm run auth:verify
```

## Gmail OAuth2 Setup

### 1. Create OAuth Credentials
- Go to: https://console.cloud.google.com
- Create new project (or select existing)
- Enable APIs:
  - Gmail API
  - Google+ API
- Create OAuth 2.0 Client ID (Desktop app)
- Download credentials JSON

### 2. Add to .env
```
GMAIL_CLIENT_ID=your_client_id_here
GMAIL_CLIENT_SECRET=your_client_secret_here
GMAIL_REDIRECT_URL=http://localhost:3000/auth/gmail/callback
```

### 3. First Sign-In
```bash
node -e "require('./src/auth').gmail.signIn()"
```
- Browser opens → Authorize access
- Copy authorization code → Paste in terminal
- Token saved to `.auth-credentials/tokens/gmail-token.json`

## Google Drive OAuth2 Setup

### 1. Create OAuth Credentials
- Same as Gmail setup (use same project)
- Enable Google Drive API
- Create OAuth 2.0 Client ID

### 2. Add to .env
```
GOOGLE_DRIVE_CLIENT_ID=your_client_id_here
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret_here
GOOGLE_DRIVE_REDIRECT_URL=http://localhost:3000/auth/drive/callback
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here  # Optional: specific folder for uploads
```

### 3. First Sign-In
```bash
node -e "require('./src/auth').drive.signIn()"
```
- Browser opens → Authorize access
- Copy authorization code → Paste in terminal
- Token saved to `.auth-credentials/tokens/gdrive-token.json`

## WhatsApp (WAHA API) Setup

### 1. Get WAHA API Key
- Visit: https://waha.devlikeapro.com
- Sign up / Log in
- Create new connection
- Copy API key

### 2. Add to .env
```
WAHA_API_URL=https://waha.devlikeapro.com
WAHA_API_KEY=your_api_key_here
WHATSAPP_PHONE_NUMBER=+1234567890  # Your WhatsApp number
```

### 3. First Setup
```bash
node -e "require('./src/auth').whatsapp.signIn()"
```
- Enter API key when prompted
- Enter phone number
- Scan QR code in browser
- Token saved to `.auth-credentials/tokens/whatsapp-token.json`

## Sign-In All Services

```bash
# Sign in to all 3 services in sequence
node -e "require('./src/auth').signInAll(['gmail', 'drive', 'whatsapp'])"
```

## Verify Connections

```bash
# Check all services are authenticated
node -e "require('./src/auth').verifyAll()"
```

## Token Management

Tokens are stored in `.auth-credentials/tokens/` (not committed to Git):

```
.auth-credentials/
├── tokens/
│   ├── gmail-token.json
│   ├── gdrive-token.json
│   └── whatsapp-token.json
```

Add to `.gitignore`:
```
.auth-credentials/
```

## Troubleshooting

### "Missing Credentials" Error
- Check all required env vars are set
- Run: `npm run auth:check`

### Token Expired
- Tokens auto-refresh automatically
- Manually refresh: `node -e "require('./src/auth').gmail.getAuthClient()"`

### Still Signed In
- Tokens persist in `.auth-credentials/tokens/`
- To sign in again, tokens auto-refresh on use
- To clear token: Delete file from `.auth-credentials/tokens/`

## Security Notes

✅ Tokens stored locally only (never committed)  
✅ API keys in .env (never committed)  
✅ Tokens auto-refresh without user intervention  
✅ Each service isolated with separate auth handler  
✅ .gitignore prevents accidental exposure  

⚠️ If credentials leaked:
1. Revoke in Google/WAHA console
2. Generate new credentials
3. Update .env
4. Delete `.auth-credentials/tokens/`
5. Re-run setup

## Next Steps

- [Email Fetching](docs/GMAIL.md) - Import emails from Gmail
- [Google Drive Sync](docs/GDRIVE.md) - Upload/sync files to Drive
- [WhatsApp Messages](docs/WHATSAPP.md) - Import chat history
