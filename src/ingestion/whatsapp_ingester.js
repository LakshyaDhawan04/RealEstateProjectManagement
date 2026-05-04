/**
 * WhatsApp Data Ingester
 * Parses WhatsApp exports or fetches via WAHA API
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

class WhatsAppIngester {
  constructor() {
    this.wahaUrl = process.env.WAHA_API_URL || 'http://localhost:3000';
    this.wahaKey = process.env.WAHA_API_KEY;
    this.outputDir = path.join(__dirname, '../../data/whatsapp');
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Parse WhatsApp export file (.txt)
   */
  parseExportFile(filePath) {
    console.log(`Parsing WhatsApp export: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const messages = [];

    lines.forEach((line, index) => {
      // WhatsApp format: [HH:MM, DD/MM/YYYY] Name: Message
      const match = line.match(/\[(.*?)\]\s(.*?):\s(.*)/);
      if (match) {
        messages.push({
          id: `msg_${index}`,
          timestamp: match[1],
          sender: match[2],
          content: match[3],
          type: 'text',
        });
      }
    });

    return messages;
  }

  /**
   * Fetch chats from WAHA API
   */
  async fetchChatsFromWAHA() {
    console.log(`Fetching chats from WAHA: ${this.wahaUrl}`);
    // Will implement WAHA API call here
    return [];
  }

  /**
   * Export messages to JSON
   */
  async exportToJSON(messages) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `messages_${timestamp}.json`;
    const filepath = path.join(this.outputDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(messages, null, 2));
    console.log(`✓ Exported ${messages.length} messages to ${filepath}`);
    return filepath;
  }

  /**
   * Run ingestion pipeline
   */
  async run(exportFilePath = null) {
    try {
      console.log('Starting WhatsApp ingestion...');
      let messages = [];

      if (exportFilePath && fs.existsSync(exportFilePath)) {
        messages = this.parseExportFile(exportFilePath);
      } else {
        messages = await this.fetchChatsFromWAHA();
      }

      await this.exportToJSON(messages);
      console.log('WhatsApp ingestion complete.');
    } catch (error) {
      console.error('WhatsApp ingestion error:', error);
      throw error;
    }
  }
}

// Main execution
if (require.main === module) {
  const exportPath = process.argv[2];
  const ingester = new WhatsAppIngester();
  ingester.run(exportPath);
}

module.exports = WhatsAppIngester;
