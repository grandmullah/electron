/*
 * bGateWebPrintAPI_WS.js - bGate Web Print API for thermal printers
 * Provides direct communication with Bixolon and other thermal printers
 */

class bGateWebPrintAPI {
    constructor() {
        this.parser = new WS_Parser();
        this.connected = false;
        this.printerConfig = {
            width: 80,
            fontSize: 11,
            fontFamily: 'monospace',
            lineSpacing: 1.2,
            margin: 0
        };
    }

    // Connect to thermal printer
    async connect(printerUrl = 'ws://localhost:9100') {
        try {
            await this.parser.connect(printerUrl);
            this.connected = true;
            console.log('Connected to thermal printer via WebSocket');
            return true;
        } catch (error) {
            console.error('Failed to connect to thermal printer:', error);
            return false;
        }
    }

    // Create a new print job
    createPrintJob(config = {}) {
        if (!this.connected) {
            throw new Error('Not connected to thermal printer');
        }

        const printConfig = { ...this.printerConfig, ...config };
        
        return new PrintJob(this.parser, printConfig);
    }

    // Get printer status
    getStatus() {
        if (!this.connected) {
            return { connected: false, error: 'Not connected' };
        }

        this.parser.sendMessage({
            type: 'get_status',
            timestamp: Date.now()
        });

        return { connected: true, status: 'Connected' };
    }

    // Disconnect from printer
    disconnect() {
        this.parser.disconnect();
        this.connected = false;
        console.log('Disconnected from thermal printer');
    }
}

// PrintJob class for managing individual print jobs
class PrintJob {
    constructor(parser, config) {
        this.parser = parser;
        this.config = config;
        this.content = [];
        this.jobId = 'job_' + Date.now();
    }

    // Add text to the print job
    addText(text) {
        this.content.push({
            type: 'text',
            content: text,
            config: this.config
        });
        return this;
    }

    // Add line break
    addLineBreak() {
        this.content.push({
            type: 'linebreak'
        });
        return this;
    }

    // Add separator line
    addSeparator(char = '-') {
        const separator = char.repeat(this.config.width);
        this.content.push({
            type: 'text',
            content: separator,
            config: this.config
        });
        return this;
    }

    // Execute the print job
    async execute() {
        if (this.content.length === 0) {
            throw new Error('No content to print');
        }

        const printData = {
            type: 'print_job',
            jobId: this.jobId,
            config: this.config,
            content: this.content,
            timestamp: Date.now()
        };

        console.log('Executing print job:', this.jobId);
        console.log('Print content:', this.content);

        // Send print job to printer
        this.parser.sendMessage(printData);

        // For now, simulate successful printing
        // In a real implementation, you'd wait for printer confirmation
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Print job completed:', this.jobId);
                resolve({ success: true, jobId: this.jobId });
            }, 1000);
        });
    }
}

// Make bGateWebPrintAPI available globally
window.bGateWebPrintAPI = bGateWebPrintAPI;

// Auto-connect to local printer (for development)
document.addEventListener('DOMContentLoaded', () => {
    console.log('bGate Web Print API loaded');
    
    // Try to auto-connect to local printer
    const api = new bGateWebPrintAPI();
    api.connect().then(connected => {
        if (connected) {
            console.log('Auto-connected to thermal printer');
            window.bGateWebPrintAPI = api;
        } else {
            console.log('Failed to auto-connect, manual connection required');
            window.bGateWebPrintAPI = api;
        }
    });
});
