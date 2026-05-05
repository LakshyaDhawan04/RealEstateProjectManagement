/**
 * OAuth Authentication Hub
 * Unified sign-in interface for all services
 */

const gmailAuth = require('./gmail-auth');
const gdriveAuth = require('./gdrive-auth');
const whatsappAuth = require('./whatsapp-auth');
const oauthConfig = require('./oauth-config');

class AuthHub {
  async signInAll(services = ['gmail', 'drive', 'whatsapp']) {
    console.log('\n🔐 Multi-Service Authentication\n');

    const results = {};

    for (const service of services) {
      try {
        switch (service) {
          case 'gmail':
            console.log('1️⃣  Gmail...');
            await gmailAuth.signIn();
            results.gmail = true;
            break;

          case 'drive':
            console.log('2️⃣  Google Drive...');
            await gdriveAuth.signIn();
            results.drive = true;
            break;

          case 'whatsapp':
            console.log('3️⃣  WhatsApp...');
            await whatsappAuth.signIn();
            results.whatsapp = true;
            break;
        }
      } catch (error) {
        console.error(`✗ ${service} failed: ${error.message}`);
        results[service] = false;
      }
    }

    return results;
  }

  async verifyAll() {
    console.log('\n✅ Verifying All Services\n');

    const results = {
      gmail: await gmailAuth.verify().catch(() => false),
      drive: await gdriveAuth.verify().catch(() => false),
      whatsapp: await whatsappAuth.verify().catch(() => false),
    };

    return results;
  }

  checkRequirements() {
    const validation = oauthConfig.validateCredentials();
    if (!validation.isValid) {
      console.log('\n❌ Missing Credentials:\n');
      validation.missing.forEach(m => console.log(`  - ${m}`));
      console.log('\n📋 See .env.example for setup instructions\n');
    }
    return validation;
  }

  getAuthModules() {
    return {
      gmail: gmailAuth,
      drive: gdriveAuth,
      whatsapp: whatsappAuth,
    };
  }
}

module.exports = new AuthHub();
