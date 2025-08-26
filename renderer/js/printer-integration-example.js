/*
 * Printer Integration Example
 * Shows how to integrate the Windows Printer Connector with existing Betzone code
 */

// Example: Replace existing Bixolon Web Print API usage
class BetzonePrinterService {
    constructor() {
        this.connector = null;
        this.connected = false;
        this.connectionRetries = 0;
        this.maxRetries = 3;
    }

    // Initialize printer connection
    async initialize() {
        try {
            console.log('🔌 Initializing Betzone Printer Service...');
            
            // Create Windows Printer Connector instance
            this.connector = new WindowsPrinterConnector();
            
            // Try to auto-connect
            const connected = await this.connector.autoConnect('Printer1');
            
            if (connected) {
                this.connected = true;
                console.log('✅ Printer service initialized successfully');
                return true;
            } else {
                console.log('⚠️ Auto-connection failed, will retry on demand');
                return false;
            }
        } catch (error) {
            console.error('❌ Failed to initialize printer service:', error);
            return false;
        }
    }

    // Ensure connection is established
    async ensureConnection() {
        if (this.connected && this.connector) {
            return true;
        }

        if (this.connectionRetries >= this.maxRetries) {
            throw new Error('Max connection retries exceeded');
        }

        try {
            this.connectionRetries++;
            console.log(`🔄 Attempting connection (attempt ${this.connectionRetries}/${this.maxRetries})`);
            
            const connected = await this.connector.autoConnect('Printer1');
            
            if (connected) {
                this.connected = true;
                this.connectionRetries = 0;
                console.log('✅ Connection established');
                return true;
            } else {
                throw new Error('Connection failed');
            }
        } catch (error) {
            console.error(`❌ Connection attempt ${this.connectionRetries} failed:`, error.message);
            
            if (this.connectionRetries >= this.maxRetries) {
                throw new Error('All connection attempts failed');
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * this.connectionRetries));
            return false;
        }
    }

    // Print bet receipt
    async printBetReceipt(betData) {
        try {
            await this.ensureConnection();
            
            console.log('🖨️ Printing bet receipt...');
            
            const printJob = this.connector.createPrintJob({
                width: 80,
                fontSize: 14
            });

            // Receipt header
            printJob.addText('BETZONE - BET RECEIPT');
            printJob.addLineBreak();
            printJob.addSeparator('=');
            
            // Receipt details
            printJob.addText(`Receipt #: ${betData.receiptId || 'N/A'}`);
            printJob.addLineBreak();
            printJob.addText(`Date: ${new Date().toLocaleString()}`);
            printJob.addLineBreak();
            printJob.addText(`Customer: ${betData.customerName || 'N/A'}`);
            printJob.addLineBreak();
            printJob.addLineBreak();
            
            // Bet details
            printJob.addText('BET DETAILS:');
            printJob.addLineBreak();
            printJob.addSeparator('-');
            
            if (betData.bets && betData.bets.length > 0) {
                betData.bets.forEach((bet, index) => {
                    printJob.addText(`${index + 1}. ${bet.description}`);
                    printJob.addLineBreak();
                    printJob.addText(`   Selection: ${bet.selection}`);
                    printJob.addLineBreak();
                    printJob.addText(`   Odds: ${bet.odds}`);
                    printJob.addLineBreak();
                    printJob.addText(`   Stake: $${bet.stake.toFixed(2)}`);
                    printJob.addLineBreak();
                    printJob.addLineBreak();
                });
            }
            
            // Totals
            printJob.addSeparator('=');
            printJob.addText(`Total Stake: $${betData.totalStake?.toFixed(2) || '0.00'}`);
            printJob.addLineBreak();
            printJob.addText(`Potential Win: $${betData.potentialWin?.toFixed(2) || '0.00'}`);
            printJob.addLineBreak();
            printJob.addLineBreak();
            
            // Footer
            printJob.addSeparator('=');
            printJob.addText('Thank you for using Betzone!');
            printJob.addLineBreak();
            printJob.addText('Good luck! 🍀');
            printJob.addLineBreak();
            printJob.addText('Keep this receipt for your records');
            
            // Execute print job
            const result = await printJob.execute();
            
            console.log('✅ Bet receipt printed successfully:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Failed to print bet receipt:', error);
            throw error;
        }
    }

    // Print simple text
    async printText(text, options = {}) {
        try {
            await this.ensureConnection();
            
            console.log('🖨️ Printing text:', text);
            
            const printJob = this.connector.createPrintJob({
                width: options.width || 80,
                fontSize: options.fontSize || 14,
                ...options
            });

            printJob.addText(text);
            
            if (options.addSeparator) {
                printJob.addLineBreak();
                printJob.addSeparator(options.separatorChar || '=');
            }

            const result = await printJob.execute();
            
            console.log('✅ Text printed successfully:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Failed to print text:', error);
            throw error;
        }
    }

    // Print error message
    async printError(errorMessage) {
        try {
            await this.ensureConnection();
            
            console.log('🖨️ Printing error message:', errorMessage);
            
            const printJob = this.connector.createPrintJob({
                width: 80,
                fontSize: 12
            });

            printJob.addText('ERROR MESSAGE');
            printJob.addLineBreak();
            printJob.addSeparator('!');
            printJob.addText(`Time: ${new Date().toLocaleString()}`);
            printJob.addLineBreak();
            printJob.addText(`Error: ${errorMessage}`);
            printJob.addLineBreak();
            printJob.addSeparator('!');
            printJob.addText('Please contact support if this persists');

            const result = await printJob.execute();
            
            console.log('✅ Error message printed successfully:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Failed to print error message:', error);
            throw error;
        }
    }

    // Get printer status
    getStatus() {
        if (!this.connector) {
            return {
                connected: false,
                error: 'Printer service not initialized'
            };
        }

        return {
            ...this.connector.getStatus(),
            serviceInitialized: true,
            connectionRetries: this.connectionRetries
        };
    }

    // Disconnect printer
    disconnect() {
        if (this.connector) {
            this.connector.disconnect();
            this.connected = false;
            this.connectionRetries = 0;
            console.log('✅ Printer service disconnected');
        }
    }
}

// Example: Integration with existing Betzone components
class BetzonePrinterIntegration {
    constructor() {
        this.printerService = new BetzonePrinterService();
        this.initialized = false;
    }

    // Initialize when component mounts
    async componentDidMount() {
        try {
            this.initialized = await this.printerService.initialize();
            
            if (this.initialized) {
                console.log('✅ Betzone Printer Integration ready');
            } else {
                console.log('⚠️ Betzone Printer Integration initialized with warnings');
            }
        } catch (error) {
            console.error('❌ Failed to initialize Betzone Printer Integration:', error);
        }
    }

    // Handle bet placement with printing
    async handleBetPlacement(betData) {
        try {
            // Your existing bet placement logic here
            console.log('🎯 Processing bet placement...');
            
            // ... existing bet processing code ...
            
            // Print receipt after successful bet placement
            if (this.initialized) {
                await this.printerService.printBetReceipt(betData);
                console.log('✅ Bet receipt printed');
            }
            
            return { success: true, message: 'Bet placed successfully' };
            
        } catch (error) {
            console.error('❌ Bet placement failed:', error);
            
            // Try to print error message
            if (this.initialized) {
                try {
                    await this.printerService.printError(error.message);
                } catch (printError) {
                    console.error('❌ Failed to print error message:', printError);
                }
            }
            
            throw error;
        }
    }

    // Print system status
    async printSystemStatus() {
        if (!this.initialized) {
            throw new Error('Printer service not initialized');
        }

        const status = this.printerService.getStatus();
        
        await this.printerService.printText(
            `SYSTEM STATUS\n\n` +
            `Connected: ${status.connected ? 'Yes' : 'No'}\n` +
            `Connection Type: ${status.connectionType || 'None'}\n` +
            `Printer: ${status.printerName || 'None'}\n` +
            `Time: ${new Date().toLocaleString()}`,
            { addSeparator: true }
        );
    }

    // Cleanup when component unmounts
    componentWillUnmount() {
        if (this.printerService) {
            this.printerService.disconnect();
        }
    }
}

// Example: Usage in React component
/*
import React, { useEffect, useState } from 'react';

function BetzoneApp() {
    const [printerIntegration, setPrinterIntegration] = useState(null);
    const [printerStatus, setPrinterStatus] = useState(null);

    useEffect(() => {
        const integration = new BetzonePrinterIntegration();
        
        integration.componentDidMount().then(() => {
            setPrinterIntegration(integration);
            setPrinterStatus(integration.printerService.getStatus());
        });

        return () => {
            integration.componentWillUnmount();
        };
    }, []);

    const handleBetPlacement = async (betData) => {
        if (printerIntegration) {
            try {
                await printerIntegration.handleBetPlacement(betData);
                // Update UI, show success message, etc.
            } catch (error) {
                // Handle error, show error message, etc.
            }
        }
    };

    return (
        <div>
            <h1>Betzone App</h1>
            
            {printerStatus && (
                <div>
                    <h3>Printer Status</h3>
                    <p>Connected: {printerStatus.connected ? 'Yes' : 'No'}</p>
                    <p>Type: {printerStatus.connectionType || 'None'}</p>
                    <p>Printer: {printerStatus.printerName || 'None'}</p>
                </div>
            )}
            
            <button onClick={() => handleBetPlacement({
                receiptId: 'BET123',
                customerName: 'John Doe',
                bets: [{
                    description: 'Manchester United vs Liverpool',
                    selection: 'Home Win',
                    odds: 2.50,
                    stake: 10.00
                }],
                totalStake: 10.00,
                potentialWin: 25.00
            })}>
                Place Test Bet
            </button>
        </div>
    );
}

export default BetzoneApp;
*/

// Make classes available globally
window.BetzonePrinterService = BetzonePrinterService;
window.BetzonePrinterIntegration = BetzonePrinterIntegration;

console.log('✅ Betzone Printer Integration Example loaded');
console.log('Available classes: BetzonePrinterService, BetzonePrinterIntegration');
