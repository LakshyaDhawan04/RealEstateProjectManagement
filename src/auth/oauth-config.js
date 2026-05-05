/**
 * OAuth2 Configuration for Gmail, Google Drive, and WhatsApp
 * Centralizes all authentication setup
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

class OAuthConfig {
  constructor() {
    this.credentialsDir = path.join(process.cwd(), '.auth-credentials');
    this.tokenDir = path.join(this.credentialsDir, 'tokens');
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.credentialsDir, this.tokenDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  getGmailConfig() {
    return {
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      redirectUrl: process.env.GMAIL_REDIRECT_URL || 'http://localhost:3000/auth/gmail/callback',
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      tokenPath: path.join(this.tokenDir, 'gmail-token.json'),
    };
  }

  getGoogleDriveConfig() {
    return {
      clientId: process.env.GOOGLE_DRIVE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
      redirectUrl: process.env.GOOGLE_DRIVE_REDIRECT_URL || 'http://localhost:3000/auth/drive/callback',
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      tokenPath: path.join(this.tokenDir, 'gdrive-token.json'),
      folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
    };
  }

  getWhatsAppConfig() {
    return {
      apiUrl: process.env.WAHA_API_URL || 'https://waha.devlikeapro.com',
      apiKey: process.env.WAHA_API_KEY,
      phoneNumber: process.env.WHATSAPP_PHONE_NUMBER,
      tokenPath: path.join(this.tokenDir, 'whatsapp-token.json'),
    };
  }

  validateCredentials() {
    const required = {
      gmail: this.getGmailConfig(),
      googleDrive: this.getGoogleDriveConfig(),
      whatsApp: this.getWhatsAppConfig(),
    };

    const missing = [];

    if (!required.gmail.clientId || !required.gmail.clientSecret) {
      missing.push('GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET');
    }
    if (!required.googleDrive.clientId || !required.googleDrive.clientSecret) {
      missing.push('GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET');
    }
    if (!required.whatsApp.apiKey) {
      missing.push('WAHA_API_KEY');
    }

    return { isValid: missing.length === 0, missing };
  }

  getTokenPath(service) {
    const paths = {
      gmail: this.getGmailConfig().tokenPath,
      drive: this.getGoogleDriveConfig().tokenPath,
      whatsapp: this.getWhatsAppConfig().tokenPath,
    };
    return paths[service];
  }

  saveToken(service, token) {
    const tokenPath = this.getTokenPath(service);
    fs.writeFileSync(tokenPath, JSON.stringify(token, null, 2));
    console.log(`✓ ${service} token saved to ${tokenPath}`);
  }

  loadToken(service) {
    const tokenPath = this.getTokenPath(service);
    if (fs.existsSync(tokenPath)) {
      return JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
    }
    return null;
  }

  clearToken(service) {
    const tokenPath = this.getTokenPath(service);
    if (fs.existsSync(tokenPath)) {
      fs.unlinkSync(tokenPath);
      console.log(`✓ ${service} token cleared`);
    }
  }
}

module.exports = new OAuthConfig();
