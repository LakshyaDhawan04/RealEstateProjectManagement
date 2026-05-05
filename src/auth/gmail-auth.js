/**
 * Gmail OAuth2 Authentication Handler
 */

const { google } = require('googleapis');
const readline = require('readline');
const oauthConfig = require('./oauth-config');

class GmailAuth {
  constructor() {
    const config = oauthConfig.getGmailConfig();
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUrl
    );
    this.config = config;
  }

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.config.scopes,
      prompt: 'consent',
    });
  }

  async signIn() {
    return new Promise((resolve, reject) => {
      console.log('\n📧 Gmail Authentication Required');
      console.log('=====================================');
      const authUrl = this.getAuthUrl();
      console.log('Visit this URL to authorize:\n', authUrl);

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('\nEnter the authorization code: ', async (code) => {
        rl.close();
        try {
          const { tokens } = await this.oauth2Client.getToken(code);
          this.oauth2Client.setCredentials(tokens);
          oauthConfig.saveToken('gmail', tokens);
          console.log('✓ Gmail authenticated successfully!\n');
          resolve(tokens);
        } catch (error) {
          console.error('✗ Authentication failed:', error.message);
          reject(error);
        }
      });
    });
  }

  async getAuthClient() {
    let token = oauthConfig.loadToken('gmail');

    if (!token) {
      console.log('🔑 No Gmail token found, signing in...');
      token = await this.signIn();
    }

    this.oauth2Client.setCredentials(token);

    if (token.expiry_date && token.expiry_date < Date.now()) {
      console.log('🔄 Refreshing Gmail token...');
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      oauthConfig.saveToken('gmail', credentials);
      this.oauth2Client.setCredentials(credentials);
    }

    return this.oauth2Client;
  }

  async verify() {
    try {
      const auth = await this.getAuthClient();
      const gmail = google.gmail({ version: 'v1', auth });
      const profile = await gmail.users.getProfile({ userId: 'me' });
      console.log(`✓ Gmail verified: ${profile.data.emailAddress}`);
      return true;
    } catch (error) {
      console.error('✗ Gmail verification failed:', error.message);
      return false;
    }
  }

  signOut() {
    oauthConfig.clearToken('gmail');
    console.log('✓ Gmail signed out');
  }
}

module.exports = new GmailAuth();
