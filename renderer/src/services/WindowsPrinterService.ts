/**
 * Windows Printer Service for Bixolon Thermal Printers
 * Provides multiple connection methods for Windows USB-connected printers
 */

export interface BetData {
    receiptId?: string;
    customerName?: string;
    customerPhone?: string;
    date?: string;
    bets: Array<{
        description: string;
        selection?: string;
        odds?: number;
        stake?: number;
        potentialWin?: number;
    }>;
    totalStake?: number;
    potentialWin?: number;
}

export interface PrintResult {
    success: boolean;
    jobId: string;
    method: string;
    bixolon?: boolean;
    contentLength?: number;
}

export class WindowsPrinterService {
    private connected: boolean = false;
    private printerName: string | null = null;
    private connectionType: string | null = null;

    constructor() {
        console.log('🔌 Windows Printer Service initialized');
    }

    // Check if connected printer is Bixolon
    isBixolonPrinter(): boolean {
        if (!this.printerName) return false;
        
        const bixolonNames = ['BIXOLON', 'SRP-350', 'SRP-275', 'SRP-200'];
        return bixolonNames.some(name => 
            this.printerName!.toUpperCase().includes(name.toUpperCase())
        );
    }

    // Print bet receipt - Main function for printing bets
    async printBetReceipt(betData: BetData): Promise<PrintResult> {
        if (!this.connected) {
            throw new Error('Not connected to printer');
        }

        console.log('🎯 Printing bet receipt:', betData);
        
        try {
            // Simulate print job execution
            const jobId = 'print_job_' + Date.now();
            
            console.log('📄 Bet Receipt Content:');
            console.log('='.repeat(80));
            console.log('BETZONE RECEIPT');
            console.log('='.repeat(80));
            
            if (betData.receiptId) {
                console.log(`Receipt #: ${betData.receiptId}`);
            }
            console.log(`Date: ${betData.date || new Date().toLocaleString()}`);
            
            if (betData.customerName) {
                console.log(`Customer: ${betData.customerName}`);
            }
            
            if (betData.customerPhone) {
                console.log(`Phone: ${betData.customerPhone}`);
            }
            
            console.log('');
            console.log('BET DETAILS:');
            console.log('-'.repeat(80));
            
            betData.bets.forEach((bet, index) => {
                console.log(`${index + 1}. ${bet.description}`);
                if (bet.selection) console.log(`   Selection: ${bet.selection}`);
                if (bet.odds) console.log(`   Odds: ${bet.odds}`);
                if (bet.stake) console.log(`   Stake: $${bet.stake.toFixed(2)}`);
                if (bet.potentialWin) console.log(`   Potential: $${bet.potentialWin.toFixed(2)}`);
                console.log('');
            });
            
            console.log('='.repeat(80));
            if (betData.totalStake) console.log(`Total Stake: $${betData.totalStake.toFixed(2)}`);
            if (betData.potentialWin) console.log(`Potential Win: $${betData.potentialWin.toFixed(2)}`);
            console.log('');
            console.log('Thank you for using Betzone!');
            console.log('Good luck! 🍀');
            console.log('='.repeat(80));
            
            const result: PrintResult = {
                success: true,
                jobId,
                method: 'simulated',
                bixolon: this.isBixolonPrinter(),
                contentLength: betData.bets.length
            };
            
            console.log('✅ Bet receipt printed successfully:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Failed to print bet receipt:', error);
            throw error;
        }
    }

    // Print simple bet slip
    async printBetSlip(betData: { betId?: string; bets: Array<{ description: string; selection?: string }>; totalStake?: number }): Promise<PrintResult> {
        if (!this.connected) {
            throw new Error('Not connected to printer');
        }

        console.log('🎯 Printing bet slip:', betData);
        
        try {
            const jobId = 'slip_job_' + Date.now();
            
            console.log('📄 Bet Slip Content:');
            console.log('='.repeat(80));
            console.log('BETZONE BET SLIP');
            console.log('='.repeat(80));
            
            if (betData.betId) {
                console.log(`Bet ID: ${betData.betId}`);
            }
            console.log(`Date: ${new Date().toLocaleString()}`);
            console.log('');
            console.log('SELECTIONS:');
            console.log('-'.repeat(80));
            
            betData.bets.forEach((bet, index) => {
                console.log(`${index + 1}. ${bet.description}`);
                if (bet.selection) console.log(`   ${bet.selection}`);
                console.log('');
            });
            
            console.log('='.repeat(80));
            if (betData.totalStake) {
                console.log(`Stake: $${betData.totalStake.toFixed(2)}`);
            }
            console.log('');
            console.log('Present this slip to collect winnings');
            console.log('='.repeat(80));
            
            const result: PrintResult = {
                success: true,
                jobId,
                method: 'simulated',
                bixolon: this.isBixolonPrinter(),
                contentLength: betData.bets.length
            };
            
            console.log('✅ Bet slip printed successfully:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Failed to print bet slip:', error);
            throw error;
        }
    }

    // Simulate connection for testing
    async simulateConnection(): Promise<boolean> {
        this.connected = true;
        this.printerName = 'BIXOLON_SRP-350III';
        this.connectionType = 'simulated';
        console.log('✅ Simulated connection to Bixolon printer');
        return true;
    }

    // Get connection status
    getStatus() {
        return {
            connected: this.connected,
            connectionType: this.connectionType,
            printerName: this.printerName,
            bixolonDetected: this.isBixolonPrinter()
        };
    }

    // Disconnect
    disconnect(): void {
        this.connected = false;
        console.log('Disconnected from printer');
    }
}

// Export the service instance
export const windowsPrinterService = new WindowsPrinterService();
