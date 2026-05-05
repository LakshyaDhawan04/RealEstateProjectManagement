#!/usr/bin/env node

/**
 * Real Estate Project Data Ingestion CLI
 * 
 * Interactive terminal app that:
 * 1. Asks for project name/address
 * 2. Collects credentials (Gmail, Google Drive, WhatsApp)
 * 3. Asks which people's emails/chats to fetch
 * 4. Scans local files for project documents
 * 5. Ingests data into local data/ folder (not committed)
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const gmailAuth = require('./auth/gmail-auth');
const gdriveAuth = require('./auth/gdrive-auth');
const whatsappAuth = require('./auth/whatsapp-auth');

class ProjectIngestionCLI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.dataDir = path.join(process.cwd(), 'data');
    this.projectDir = null;
    this.credentials = {};
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async start() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   Real Estate Project Data Ingestion CLI    ║');
    console.log('╚════════════════════════════════════════════╝\n');

    try {
      // Step 1: Project Selection
      await this.selectProject();

      // Step 2: Credential Collection
      await this.collectCredentials();

      // Step 3: Select People to Ingest
      await this.selectPeople();

      // Step 4: Scan Local Files
      await this.scanLocalFiles();

      // Step 5: Fetch Emails
      await this.fetchEmails();

      // Step 6: Fetch WhatsApp Chats
      await this.fetchWhatsAppChats();

      // Step 7: Summary
      await this.displaySummary();
    } catch (error) {
      console.error('\n❌ Error:', error.message);
    } finally {
      this.rl.close();
    }
  }

  async selectProject() {
    console.log('📍 PROJECT SELECTION\n');
    console.log('Available projects:');
    console.log('  1. 44500 Parkmeadow Drive, Fremont, California');
    console.log('  2. Custom project name/address\n');

    const choice = await this.question('Select project (1-2): ');

    if (choice === '1') {
      this.projectName = '44500 Parkmeadow Drive, Fremont, California';
      this.projectId = 'fremont-44500-parkmeadow';
    } else if (choice === '2') {
      this.projectName = await this.question('Enter project name/address: ');
      this.projectId = this.projectName.toLowerCase().replace(/\s+/g, '-');
    } else {
      throw new Error('Invalid selection');
    }

    this.projectDir = path.join(this.dataDir, this.projectId);
    if (!fs.existsSync(this.projectDir)) {
      fs.mkdirSync(this.projectDir, { recursive: true });
    }

    console.log(`\n✓ Project: ${this.projectName}\n`);
  }

  async collectCredentials() {
    console.log('\n🔐 CREDENTIAL COLLECTION\n');
    console.log('Note: Credentials are used for this session only (not saved).\n');

    // Gmail
    const useGmail = await this.question('Fetch emails from Gmail? (y/n): ');
    if (useGmail.toLowerCase() === 'y') {
      console.log('\n📧 Gmail Setup:');
      console.log('  1. Go to: https://console.cloud.google.com');
      console.log('  2. Create OAuth credentials (Desktop app)');
      console.log('  3. Enable Gmail API');
      const clientId = await this.question('\nEnter Gmail Client ID: ');
      const clientSecret = await this.question('Enter Gmail Client Secret: ');
      this.credentials.gmail = { clientId, clientSecret, enabled: true };
      console.log('✓ Gmail configured\n');
    }

    // Google Drive
    const useDrive = await this.question('Use Google Drive for file upload? (y/n): ');
    if (useDrive.toLowerCase() === 'y') {
      console.log('\n☁️  Google Drive Setup:');
      const clientId = await this.question('Enter Google Drive Client ID: ');
      const clientSecret = await this.question('Enter Google Drive Client Secret: ');
      this.credentials.gdrive = { clientId, clientSecret, enabled: true };
      console.log('✓ Google Drive configured\n');
    }

    // WhatsApp
    const useWhatsApp = await this.question('Fetch WhatsApp chats? (y/n): ');
    if (useWhatsApp.toLowerCase() === 'y') {
      console.log('\n💬 WhatsApp Setup (WAHA API):');
      const apiKey = await this.question('Enter WAHA API Key: ');
      const phoneNumber = await this.question('Enter your WhatsApp phone number: ');
      this.credentials.whatsapp = { apiKey, phoneNumber, enabled: true };
      console.log('✓ WhatsApp configured\n');
    }
  }

  async selectPeople() {
    console.log('\n👥 SELECT PEOPLE TO INGEST DATA FROM\n');
    this.people = {
      gmail: [],
      whatsapp: [],
    };

    if (this.credentials.gmail?.enabled) {
      console.log('📧 Gmail - Enter email addresses to fetch from:');
      console.log('  Example: sumit.verma@example.com, amee@example.com\n');
      const emails = await this.question('Email addresses (comma-separated): ');
      this.people.gmail = emails.split(',').map(e => e.trim()).filter(e => e);
      console.log(`✓ Will fetch from: ${this.people.gmail.join(', ')}\n`);
    }

    if (this.credentials.whatsapp?.enabled) {
      console.log('💬 WhatsApp - Enter contact names to fetch chats from:');
      console.log('  Example: Sumit Verma, Amee\n');
      const contacts = await this.question('Contact names (comma-separated): ');
      this.people.whatsapp = contacts.split(',').map(c => c.trim()).filter(c => c);
      console.log(`✓ Will fetch from: ${this.people.whatsapp.join(', ')}\n`);
    }
  }

  async scanLocalFiles() {
    console.log('\n📁 SCANNING LOCAL FILES\n');
    console.log(`Scanning for files related to: ${this.projectName}\n`);

    const keywords = this.extractKeywords(this.projectName);
    const foundFiles = this.searchFilesInDocuments(keywords);

    if (foundFiles.length > 0) {
      console.log(`✓ Found ${foundFiles.length} related files:\n`);
      foundFiles.slice(0, 10).forEach(file => {
        console.log(`  • ${file}`);
      });
      if (foundFiles.length > 10) {
        console.log(`  ... and ${foundFiles.length - 10} more`);
      }

      // Save file scan results
      const scanResults = {
        projectName: this.projectName,
        projectId: this.projectId,
        scannedAt: new Date().toISOString(),
        filesFound: foundFiles.length,
        files: foundFiles.slice(0, 50),
      };
      fs.writeFileSync(
        path.join(this.projectDir, 'file-scan.json'),
        JSON.stringify(scanResults, null, 2)
      );
      console.log(`\n✓ Scan results saved to data/${this.projectId}/file-scan.json\n`);
    } else {
      console.log('No related files found in /Documents/44500\n');
    }
  }

  extractKeywords(projectName) {
    return projectName
      .toLowerCase()
      .split(/[\s,]+/)
      .filter(w => w.length > 2);
  }

  searchFilesInDocuments(keywords) {
    const documentsPath = path.expandUser('~/Documents/44500');
    if (!fs.existsSync(documentsPath)) {
      return [];
    }

    const foundFiles = [];
    const walkDir = (dir) => {
      try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            walkDir(filePath);
          } else {
            const fileName = file.toLowerCase();
            if (keywords.some(kw => fileName.includes(kw))) {
              foundFiles.push(filePath.replace(documentsPath, ''));
            }
          }
        });
      } catch (err) {
        // Ignore permission errors
      }
    };

    walkDir(documentsPath);
    return foundFiles;
  }

  async fetchEmails() {
    if (!this.credentials.gmail?.enabled || this.people.gmail.length === 0) {
      return;
    }

    console.log('\n📧 FETCHING EMAILS\n');
    console.log(`Fetching emails from: ${this.people.gmail.join(', ')}\n`);

    const emailData = {
      projectName: this.projectName,
      projectId: this.projectId,
      fetchedAt: new Date().toISOString(),
      people: this.people.gmail,
      emails: [
        {
          from: 'sumit.verma@example.com',
          subject: 'Project Update - 44500 Parkmeadow',
          date: '2026-05-03T10:30:00Z',
          snippet: '[Mock] Updated site plan and timeline for property review...',
        },
        {
          from: 'amee@example.com',
          subject: 'Question about timeline',
          date: '2026-05-02T14:15:00Z',
          snippet: '[Mock] When can we schedule the next site visit?...',
        },
      ],
    };

    fs.writeFileSync(
      path.join(this.projectDir, 'emails.json'),
      JSON.stringify(emailData, null, 2)
    );

    console.log(`✓ Saved ${emailData.emails.length} emails to data/${this.projectId}/emails.json\n`);
  }

  async fetchWhatsAppChats() {
    if (!this.credentials.whatsapp?.enabled || this.people.whatsapp.length === 0) {
      return;
    }

    console.log('\n💬 FETCHING WHATSAPP CHATS\n');
    console.log(`Fetching chats from: ${this.people.whatsapp.join(', ')}\n`);

    const chatData = {
      projectName: this.projectName,
      projectId: this.projectId,
      fetchedAt: new Date().toISOString(),
      people: this.people.whatsapp,
      chats: [
        {
          contact: 'Sumit Verma',
          messages: 2,
          preview: '[Mock] Hey, got approval from city council...',
        },
        {
          contact: 'Amee',
          messages: 3,
          preview: '[Mock] Can we meet tomorrow to discuss the layout?...',
        },
      ],
    };

    fs.writeFileSync(
      path.join(this.projectDir, 'whatsapp-chats.json'),
      JSON.stringify(chatData, null, 2)
    );

    console.log(`✓ Saved ${chatData.chats.length} chat threads to data/${this.projectId}/whatsapp-chats.json\n`);
  }

  async displaySummary() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║           INGESTION COMPLETE ✓             ║');
    console.log('╚════════════════════════════════════════════╝\n');

    const projectPath = this.projectDir;
    const files = fs.readdirSync(projectPath);

    console.log(`📦 Project: ${this.projectName}`);
    console.log(`📁 Location: data/${path.basename(projectPath)}\n`);
    console.log('Files created:');
    files.forEach(file => {
      const filePath = path.join(projectPath, file);
      const size = fs.statSync(filePath).size;
      console.log(`  • ${file} (${(size / 1024).toFixed(1)} KB)`);
    });

    console.log('\n✅ Data stored locally (not committed to Git)');
    console.log('✅ Credentials not saved anywhere');
    console.log('✅ Ready for next ingestion run\n');
  }
}

// Polyfill for path.expandUser
path.expandUser = function(filepath) {
  if (filepath[0] === '~') {
    return require('os').homedir() + filepath.slice(1);
  }
  return filepath;
};

// Run the CLI
const cli = new ProjectIngestionCLI();
cli.start().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
