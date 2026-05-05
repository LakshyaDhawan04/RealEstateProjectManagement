/**
 * Google Drive OAuth2 Authentication Handler
 */

const { google } = require('googleapis');
const readline = require('readline');
const oauthConfig = require('./oauth-config');

class GoogleDriveAuth {
  constructor() {
    const config = oauthConfig.getGoogleDriveConfig();
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
      console.log('\n☁️  Google Drive Authentication Required');
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
          oauthConfig.saveToken('drive', tokens);
          console.log('✓ Google Drive authenticated successfully!\n');
          resolve(tokens);
        } catch (error) {
          console.error('✗ Authentication failed:', error.message);
          reject(error);
        }
      });
    });
  }

  async getAuthClient() {
    let token = oauthConfig.loadToken('drive');

    if (!token) {
      console.log('🔑 No Google Drive token found, signing in...');
      token = await this.signIn();
    }

    this.oauth2Client.setCredentials(token);

    if (token.expiry_date && token.expiry_date < Date.now()) {
      console.log('🔄 Refreshing Google Drive token...');
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      oauthConfig.saveToken('drive', credentials);
      this.oauth2Client.setCredentials(credentials);
    }

    return this.oauth2Client;
  }

  async verify() {
    try {
      const auth = await this.getAuthClient();
      const drive = google.drive({ version: 'v3', auth });
      const about = await drive.about.get({ fields: 'user' });
      console.log(`✓ Google Drive verified: ${about.data.user.emailAddress}`);
      return true;
    } catch (error) {
      console.error('✗ Google Drive verification failed:', error.message);
      return false;
    }
  }

  signOut() {
    oauthConfig.clearToken('drive');
    console.log('✓ Google Drive signed out');
  }
}

module.exports = new GoogleDriveAuth();
