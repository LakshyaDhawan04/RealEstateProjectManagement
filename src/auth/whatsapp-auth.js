/**
 * WhatsApp WAHA API Authentication Handler
 */

const axios = require('axios');
const readline = require('readline');
const oauthConfig = require('./oauth-config');

class WhatsAppAuth {
  constructor() {
    this.config = oauthConfig.getWhatsAppConfig();
    this.client = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async signIn() {
    return new Promise((resolve, reject) => {
      console.log('\n💬 WhatsApp Setup Required (WAHA API)');
      console.log('=====================================');
      console.log('Visit: https://waha.devlikeapro.com');
      console.log('1. Get your API key from dashboard');
      console.log('2. Scan QR code to connect WhatsApp');

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('\nEnter your WAHA API key: ', async (apiKey) => {
        rl.question('Enter your WhatsApp phone number: ', async (phoneNumber) => {
          rl.close();
          try {
            const response = await axios.get(`${this.config.apiUrl}/api/status`, {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
              },
            });

            if (response.status === 200) {
              const token = { apiKey, phoneNumber, connectedAt: new Date() };
              oauthConfig.saveToken('whatsapp', token);
              console.log('✓ WhatsApp authenticated successfully!\n');
              resolve(token);
            }
          } catch (error) {
            console.error('✗ Authentication failed:', error.message);
            reject(error);
          }
        });
      });
    });
  }

  async getAuthClient() {
    let token = oauthConfig.loadToken('whatsapp');

    if (!token) {
      console.log('🔑 No WhatsApp token found, setting up...');
      token = await this.signIn();
    }

    this.config.apiKey = token.apiKey;
    this.client = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'Authorization': `Bearer ${token.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return this.client;
  }

  async verify() {
    try {
      const client = await this.getAuthClient();
      const response = await client.get('/api/sessions');
      console.log(`✓ WhatsApp API verified: ${response.data.sessions.length} session(s) active`);
      return true;
    } catch (error) {
      console.error('✗ WhatsApp verification failed:', error.message);
      return false;
    }
  }

  signOut() {
    oauthConfig.clearToken('whatsapp');
    console.log('✓ WhatsApp signed out');
  }
}

module.exports = new WhatsAppAuth();
