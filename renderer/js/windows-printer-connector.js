/*
 * Windows Printer Connector for Bixolon Thermal Printers
 * Provides multiple connection methods for Windows USB-connected printers
 * Compatible with Windows 10/11 and various printer libraries
 */

class WindowsPrinterConnector {
    constructor() {
        this.connected = false;
        this.printerName = null;
        this.connectionType = null;
        this.printerConfig = {
            width: 80,
            fontSize: 11,
            fontFamily: 'monospace',
            lineSpacing: 1.2,
            margin: 0
        };
        
        // Connection instances
        this.thermalPrinter = null;
        this.escposPrinter = null;
        this.nodePrinter = null;
        this.usbConnection = null;
        
        // Bixolon-specific configuration
        this.bixolonConfig = {
            // Common Bixolon vendor IDs (hex)
            vendorIds: [
                0x1504,  // Bixolon
                0x04b8,  // Epson (Bixolon uses Epson ESC/POS)
                0x0483,  // STMicroelectronics
                0x0419,  // NEC
                0x0bda,  // Realtek
                0x1a86,  // QinHeng Electronics
                0x067b,  // Prolific Technology
                0x0405,  // Powercom
                0x0b38,  // Citizen
                0x048d   // Integrated Technology Express
            ],
            // Common Bixolon product names
            productNames: [
                'BIXOLON',
                'SRP-350',
                'SRP-350II',
                'SRP-350III',
                'SRP-275',
                'SRP-275II',
                'SRP-275III',
                'SRP-200',
                'SRP-200II',
                'SRP-200III',
                'SRP-100',
                'SRP-100II',
                'SRP-100III',
                'SRP-80',
                'SRP-80II',
                'SRP-80III',
                'SRP-70',
                'SRP-70II',
                'SRP-70III',
                'SRP-60',
                'SRP-60II',
                'SRP-60III',
                'SRP-50',
                'SRP-50II',
                'SRP-50III',
                'SRP-40',
                'SRP-40II',
                'SRP-40III',
                'SRP-30',
                'SRP-30II',
                'SRP-30III',
                'SRP-20',
                'SRP-20II',
                'SRP-20III',
                'SRP-10',
                'SRP-10II',
                'SRP-10III'
            ],
            // Common Bixolon USB interface configurations
            interfaceConfig: {
                class: 0x07,        // Printer class
                subclass: 0x01,     // Printer subclass
                protocol: 0x02      // Bidirectional protocol
            }
        };
        
        // Auto-detect available libraries
        this.detectAvailableLibraries();
    }

    // Detect available printer libraries
    async detectAvailableLibraries() {
        console.log('🔍 Detecting available printer libraries...');
        
        const availableLibraries = [];
        
        // Check for node-thermal-printer (already in your deps)
        try {
            if (typeof require !== 'undefined') {
                const { ThermalPrinter } = require('node-thermal-printer');
                availableLibraries.push('node-thermal-printer');
                console.log('✅ node-thermal-printer available');
            }
        } catch (error) {
            console.log('❌ node-thermal-printer not available:', error.message);
        }
        
        // Check for escpos
        try {
            if (typeof require !== 'undefined') {
                const escpos = require('escpos');
                availableLibraries.push('escpos');
                console.log('✅ escpos available');
            }
        } catch (error) {
            console.log('❌ escpos not available:', error.message);
        }
        
        // Check for node-printer
        try {
            if (typeof require !== 'undefined') {
                const printer = require('node-printer');
                availableLibraries.push('node-printer');
                console.log('✅ node-printer available');
            }
        } catch (error) {
            console.log('❌ node-printer not available:', error.message);
        }
        
        // Check for usb
        try {
            if (typeof require !== 'undefined') {
                const usb = require('usb');
                availableLibraries.push('usb');
                console.log('✅ usb available');
            }
        } catch (error) {
            console.log('❌ usb not available:', error.message);
        }
        
        console.log('📚 Available libraries:', availableLibraries);
        return availableLibraries;
    }

    // Get available Windows printers
    async getAvailablePrinters() {
        try {
            if (typeof require !== 'undefined') {
                const printer = require('node-printer');
                const printers = printer.getPrinters();
                console.log('🖨️ Available Windows printers:', printers);
                return printers;
            }
        } catch (error) {
            console.log('❌ Could not get Windows printers:', error.message);
        }
        
        // Fallback: return common Bixolon printer names
        return [
            { name: 'BIXOLON SRP-350III', status: 'Unknown' },
            { name: 'BIXOLON SRP-350II', status: 'Unknown' },
            { name: 'BIXOLON SRP-350', status: 'Unknown' },
            { name: 'Printer1', status: 'Unknown' }
        ];
    }

    // Connect using node-thermal-printer (ESC/POS)
    async connectWithThermalPrinter(printerName = 'Printer1') {
        try {
            if (typeof require === 'undefined') {
                throw new Error('require not available in renderer');
            }
            
            const { ThermalPrinter, PrinterTypes } = require('node-thermal-printer');
            
            this.thermalPrinter = new ThermalPrinter({
                type: PrinterTypes.EPSON, // Bixolon uses ESC/POS
                interface: `USB:${printerName}`,
                options: {
                    timeout: 5000
                },
                width: this.printerConfig.width
            });
            
            // Test connection
            const isConnected = await this.thermalPrinter.isPrinterConnected();
            if (isConnected) {
                this.connected = true;
                this.printerName = printerName;
                this.connectionType = 'node-thermal-printer';
                console.log('✅ Connected via node-thermal-printer');
                return true;
            } else {
                throw new Error('Printer not responding');
            }
        } catch (error) {
            console.log('❌ node-thermal-printer connection failed:', error.message);
            return false;
        }
    }

    // Connect using escpos library
    async connectWithEscpos(printerName = 'Printer1') {
        try {
            if (typeof require === 'undefined') {
                throw new Error('require not available in renderer');
            }
            
            const escpos = require('escpos');
            
            // Try to find USB device
            const devices = escpos.USB.findPrinter();
            if (devices.length === 0) {
                throw new Error('No USB printers found');
            }
            
            // Use first available USB device
            const device = new escpos.USB(devices[0].vendorId, devices[0].productId);
            this.escposPrinter = new escpos.Printer(device);
            
            this.connected = true;
            this.printerName = printerName;
            this.connectionType = 'escpos';
            console.log('✅ Connected via escpos USB');
            return true;
        } catch (error) {
            console.log('❌ escpos connection failed:', error.message);
            return false;
        }
    }

    // Connect using node-printer (Windows native)
    async connectWithNodePrinter(printerName = 'Printer1') {
        try {
            if (typeof require === 'undefined') {
                throw new Error('require not available in renderer');
            }
            
            const printer = require('node-printer');
            
            // Get printer info
            const printerInfo = printer.getPrinter(printerName);
            if (!printerInfo) {
                throw new Error(`Printer ${printerName} not found`);
            }
            
            this.nodePrinter = printer;
            this.connected = true;
            this.printerName = printerName;
            this.connectionType = 'node-printer';
            console.log('✅ Connected via node-printer:', printerInfo);
            return true;
        } catch (error) {
            console.log('❌ node-printer connection failed:', error.message);
            return false;
        }
    }

    // Connect using USB library (low-level)
    async connectWithUSB() {
        try {
            if (typeof require === 'undefined') {
                throw new Error('require not available in renderer');
            }
            
            const usb = require('usb');
            
            // Find Bixolon USB devices
            const devices = usb.getDeviceList();
            const bixolonDevices = devices.filter(device => {
                // Common Bixolon vendor IDs
                const bixolonVendorIds = [0x1504, 0x04b8, 0x0483];
                return bixolonVendorIds.includes(device.deviceDescriptor.idVendor);
            });
            
            if (bixolonDevices.length === 0) {
                throw new Error('No Bixolon USB devices found');
            }
            
            // Use first Bixolon device
            const device = bixolonDevices[0];
            device.open();
            
            // Find printer interface
            const interface = device.interfaces[0];
            interface.claim();
            
            // Find output endpoint
            const outEndpoint = interface.endpoints.find(ep => ep.direction === 'out');
            if (!outEndpoint) {
                throw new Error('No output endpoint found');
            }
            
            this.usbConnection = {
                device,
                interface,
                outEndpoint
            };
            
            this.connected = true;
            this.printerName = 'USB_Bixolon';
            this.connectionType = 'usb';
            console.log('✅ Connected via USB library');
            return true;
        } catch (error) {
            console.log('❌ USB connection failed:', error.message);
            return false;
        }
    }

    // Auto-connect using best available method
    async autoConnect(printerName = 'Printer1') {
        console.log('🔌 Attempting auto-connection to printer...');
        
        // Try methods in order of preference
        const connectionMethods = [
            () => this.connectWithThermalPrinter(printerName),
            () => this.connectWithEscpos(printerName),
            () => this.connectWithNodePrinter(printerName),
            () => this.connectWithUSB()
        ];
        
        for (const method of connectionMethods) {
            try {
                const connected = await method();
                if (connected) {
                    console.log(`✅ Successfully connected using ${this.connectionType}`);
                    return true;
                }
            } catch (error) {
                console.log(`❌ Connection method failed:`, error.message);
                continue;
            }
        }
        
        console.log('❌ All connection methods failed');
        return false;
    }

    // Create print job
    createPrintJob(config = {}) {
        if (!this.connected) {
            throw new Error('Not connected to printer');
        }

        const printConfig = { ...this.printerConfig, ...config };
        return new WindowsPrintJob(this, printConfig);
    }

    // Get connection status
    getStatus() {
        return {
            connected: this.connected,
            connectionType: this.connectionType,
            printerName: this.printerName,
            config: this.printerConfig
        };
    }

    // Disconnect
    disconnect() {
        this.connected = false;
        
        if (this.thermalPrinter) {
            this.thermalPrinter = null;
        }
        if (this.escposPrinter) {
            this.escposPrinter = null;
        }
        if (this.nodePrinter) {
            this.nodePrinter = null;
        }
        if (this.usbConnection) {
            try {
                this.usbConnection.interface.release();
                this.usbConnection.device.close();
            } catch (error) {
                console.log('Error closing USB connection:', error.message);
            }
            this.usbConnection = null;
        }
        
        console.log('Disconnected from printer');
    }
}

// Windows Print Job class
class WindowsPrintJob {
    constructor(connector, config) {
        this.connector = connector;
        this.config = config;
        this.content = [];
        this.jobId = 'windows_job_' + Date.now();
    }

    // Add text
    addText(text) {
        this.content.push({
            type: 'text',
            content: text
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

    // Add separator
    addSeparator(char = '-') {
        const separator = char.repeat(this.config.width || 80);
        this.content.push({
            type: 'text',
            content: separator
        });
        return this;
    }

    // Add Bixolon-specific formatting
    addBixolonHeader(title) {
        this.addText(title);
        this.addLineBreak();
        this.addSeparator('=');
        return this;
    }

    // Add Bixolon receipt format - Main function for bet receipts
    addBetReceipt(data) {
        // Receipt header
        this.addBixolonHeader('BETZONE RECEIPT');
        
        // Receipt details
        if (data.receiptId) {
            this.addText(`Receipt #: ${data.receiptId}`);
            this.addLineBreak();
        }
        
        if (data.date) {
            this.addText(`Date: ${data.date}`);
            this.addLineBreak();
        } else {
            this.addText(`Date: ${new Date().toLocaleString()}`);
            this.addLineBreak();
        }
        
        if (data.customerName) {
            this.addText(`Customer: ${data.customerName}`);
            this.addLineBreak();
        }
        
        if (data.customerPhone) {
            this.addText(`Phone: ${data.customerPhone}`);
            this.addLineBreak();
        }
        
        this.addLineBreak();
        
        // Bet details
        if (data.bets && data.bets.length > 0) {
            this.addText('BET DETAILS:');
            this.addLineBreak();
            this.addSeparator('-');
            
            data.bets.forEach((bet, index) => {
                this.addText(`${index + 1}. ${bet.description || 'Unknown'}`);
                this.addLineBreak();
                if (bet.selection) {
                    this.addText(`   Selection: ${bet.selection}`);
                    this.addLineBreak();
                }
                if (bet.odds) {
                    this.addText(`   Odds: ${bet.odds}`);
                    this.addLineBreak();
                }
                if (bet.stake) {
                    this.addText(`   Stake: $${bet.stake.toFixed(2)}`);
                    this.addLineBreak();
                }
                if (bet.potentialWin) {
                    this.addText(`   Potential: $${bet.potentialWin.toFixed(2)}`);
                    this.addLineBreak();
                }
                this.addLineBreak();
            });
        }
        
        // Totals
        this.addSeparator('=');
        if (data.totalStake) {
            this.addText(`Total Stake: $${data.totalStake.toFixed(2)}`);
            this.addLineBreak();
        }
        if (data.potentialWin) {
            this.addText(`Potential Win: $${data.potentialWin.toFixed(2)}`);
            this.addLineBreak();
        }
        
        this.addLineBreak();
        
        // Footer
        this.addSeparator('=');
        this.addText('Thank you for using Betzone!');
        this.addLineBreak();
        this.addText('Good luck! 🍀');
        this.addLineBreak();
        this.addText('Keep this receipt for your records');
        
        return this;
    }

    // Add bet slip format - Simplified version
    addBetSlip(data) {
        // Slip header
        this.addBixolonHeader('BETZONE BET SLIP');
        
        // Basic bet info
        if (data.betId) {
            this.addText(`Bet ID: ${data.betId}`);
            this.addLineBreak();
        }
        
        this.addText(`Date: ${new Date().toLocaleString()}`);
        this.addLineBreak();
        this.addLineBreak();
        
        // Bet details
        if (data.bets && data.bets.length > 0) {
            this.addText('SELECTIONS:');
            this.addLineBreak();
            this.addSeparator('-');
            
            data.bets.forEach((bet, index) => {
                this.addText(`${index + 1}. ${bet.description || 'Unknown'}`);
                this.addLineBreak();
                if (bet.selection) {
                    this.addText(`   ${bet.selection}`);
                    this.addLineBreak();
                }
                this.addLineBreak();
            });
        }
        
        // Stake info
        this.addSeparator('=');
        if (data.totalStake) {
            this.addText(`Stake: $${data.totalStake.toFixed(2)}`);
            this.addLineBreak();
        }
        
        this.addLineBreak();
        this.addText('Present this slip to collect winnings');
        
        return this;
    }

    // Execute print job
    async execute() {
        if (this.content.length === 0) {
            throw new Error('No content to print');
        }

        console.log('🖨️ Executing Windows print job:', this.jobId);

        try {
            switch (this.connector.connectionType) {
                case 'node-thermal-printer':
                    return await this.executeWithThermalPrinter();
                case 'escpos':
                    return await this.executeWithEscpos();
                case 'node-printer':
                    return await this.executeWithNodePrinter();
                case 'usb':
                    return await this.executeWithUSB();
                default:
                    throw new Error('Unknown connection type');
            }
        } catch (error) {
            console.error('❌ Print job failed:', error);
            throw error;
        }
    }

    // Execute with node-thermal-printer
    async executeWithThermalPrinter() {
        const printer = this.connector.thermalPrinter;
        
        // Clear previous content
        printer.clear();
        
        // Add content
        for (const item of this.content) {
            if (item.type === 'text') {
                printer.alignCenter();
                printer.print(item.content);
            } else if (item.type === 'linebreak') {
                printer.newLine();
            }
        }
        
        // Execute print
        await printer.execute();
        
        return { success: true, jobId: this.jobId, method: 'thermal-printer' };
    }

    // Execute with escpos
    async executeWithEscpos() {
        const printer = this.connector.escposPrinter;
        
        // Add content
        for (const item of this.content) {
            if (item.type === 'text') {
                printer.text(item.content);
            } else if (item.type === 'linebreak') {
                printer.newLine();
            }
        }
        
        // Execute print
        printer.cut();
        printer.close();
        
        return { success: true, jobId: this.jobId, method: 'escpos' };
    }

    // Execute with node-printer
    async executeWithNodePrinter() {
        const printer = this.connector.nodePrinter;
        const printerName = this.connector.printerName;
        
        // Convert content to print format
        const printContent = this.content.map(item => {
            if (item.type === 'text') {
                return item.content;
            } else if (item.type === 'linebreak') {
                return '\n';
            }
            return '';
        }).join('');
        
        // Print using Windows printer API
        printer.printDirect({
            data: printContent,
            printer: printerName,
            type: 'RAW',
            success: (jobID) => {
                console.log('Print job submitted:', jobID);
            },
            error: (err) => {
                throw new Error(`Print error: ${err}`);
            }
        });
        
        return { success: true, jobId: this.jobId, method: 'node-printer' };
    }

    // Execute with USB
    async executeWithUSB() {
        const { outEndpoint } = this.connector.usbConnection;
        
        // Convert content to ESC/POS commands
        const escposCommands = this.generateEscposCommands();
        
        // Send commands via USB
        outEndpoint.transfer(escposCommands, (error) => {
            if (error) {
                throw new Error(`USB transfer error: ${error}`);
            }
        });
        
        return { success: true, jobId: this.jobId, method: 'usb' };
    }

    // Generate ESC/POS commands
    generateEscposCommands() {
        const commands = [];
        
        // Initialize printer
        commands.push(0x1B, 0x40); // ESC @
        
        // Add content
        for (const item of this.content) {
            if (item.type === 'text') {
                // Convert text to bytes
                const textBytes = Buffer.from(item.content, 'utf8');
                commands.push(...textBytes);
            } else if (item.type === 'linebreak') {
                commands.push(0x0A); // LF
            }
        }
        
        // Cut paper
        commands.push(0x1D, 0x56, 0x00); // GS V 0
        
        return Buffer.from(commands);
    }
}

// Make WindowsPrinterConnector available globally
window.WindowsPrinterConnector = WindowsPrinterConnector;

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔌 Windows Printer Connector loaded');
    
    // Create connector instance
    const connector = new WindowsPrinterConnector();
    
    // Try to auto-connect
    const connected = await connector.autoConnect();
    
    if (connected) {
        console.log('✅ Auto-connected to Windows printer');
        console.log('🖨️ Printer status:', connector.getStatus());
    } else {
        console.log('⚠️ Could not auto-connect to printer');
        console.log('💡 Try connecting manually or check printer drivers');
    }
    
    window.windowsPrinterConnector = connector;
});

