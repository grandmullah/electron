/*
 * Thermal Printer Simulator
 * Provides a simulated thermal printer for testing when no real printer is available
 */

class ThermalPrinterSimulator {
    constructor() {
        this.connected = true;
        this.printQueue = [];
        this.isPrinting = false;
        console.log('🔌 Thermal Printer Simulator loaded');
        console.log('📄 This simulates a Bixolon thermal printer for testing');
    }

    // Simulate connecting to printer
    async connect(url = 'ws://localhost:9100') {
        console.log(`🔌 Simulator: Attempting to connect to ${url}`);
        
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('✅ Simulator: Connected to thermal printer simulator');
        this.connected = true;
        return true;
    }

    // Create a simulated print job
    createPrintJob(config = {}) {
        if (!this.connected) {
            throw new Error('Simulator not connected');
        }

        return new SimulatedPrintJob(this, config);
    }

    // Get simulator status
    getStatus() {
        return {
            connected: this.connected,
            status: 'Simulator Mode',
            type: 'Bixolon SRP-330 (Simulated)',
            paper: '80mm Thermal',
            queue: this.printQueue.length
        };
    }

    // Disconnect simulator
    disconnect() {
        this.connected = false;
        console.log('🔌 Simulator: Disconnected from thermal printer simulator');
    }
}

// Simulated PrintJob class
class SimulatedPrintJob {
    constructor(simulator, config) {
        this.simulator = simulator;
        this.config = config;
        this.content = [];
        this.jobId = 'sim_job_' + Date.now();
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
        const separator = char.repeat(this.config.width || 80);
        this.content.push({
            type: 'text',
            content: separator,
            config: this.config
        });
        return this;
    }

    // Execute the simulated print job
    async execute() {
        if (this.content.length === 0) {
            throw new Error('No content to print');
        }

        console.log('🖨️ Simulator: Starting print job:', this.jobId);
        console.log('📄 Print content:');
        
        // Display the receipt content in console
        this.content.forEach(item => {
            if (item.type === 'text') {
                console.log(`  ${item.content}`);
            } else if (item.type === 'linebreak') {
                console.log('  [LINE BREAK]');
            }
        });

        // Simulate printing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('✅ Simulator: Print job completed successfully');
        console.log('📄 Receipt would be printed on 80mm thermal paper');
        
        return { success: true, jobId: this.jobId, simulator: true };
    }
}

// Make simulator available globally
window.ThermalPrinterSimulator = ThermalPrinterSimulator;

// Auto-load simulator if no real printer is available
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔌 Thermal Printer Simulator ready');
    console.log('💡 Use this for testing when no real thermal printer is connected');
    
    // Create global simulator instance
    window.thermalPrinterSimulator = new ThermalPrinterSimulator();
});

