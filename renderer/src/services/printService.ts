/*
  Simple thermal ticket printing using Bixolon Web Print SDK.
  Following the proven 1nl-client-master implementation pattern.
  - Direct function calls to global Bixolon functions
  - Simple error handling with direct user feedback
  - No complex API objects or async operations
  - Compatible with Bixolon SRP series thermal printers
*/

type AnyBet = any;

// Global flag to prevent multiple simultaneous print operations
let globalPrintInProgress = false;

function formatMoney(value: unknown): string {
    const num = typeof value === 'number' ? value : parseFloat(String(value ?? 0));
    if (!isFinite(num)) return '0.00';
    return num.toFixed(2);
}

/**
 * Print thermal ticket using simple Bixolon functions
 * Following the proven 1nl-client-master pattern
 */
export async function printThermalTicket(bet: AnyBet): Promise<void> {
    // Prevent multiple simultaneous print operations
    if (globalPrintInProgress) {
        console.warn('Print operation already in progress. Please wait.');
        return;
    }

    globalPrintInProgress = true;

    try {
        // Check if Bixolon printer functions are available
        const win: any = window;
        if (!win.checkPrinterStatus) {
            window.alert(
                "Error Printing\n\nCannot load printer functions. Please reload your page."
            );
            globalPrintInProgress = false;
            return;
        }

        // Check printer status first
        win.checkPrinterStatus();

        // Get printer name from settings (default to 'Printer1')
        const printerName = 'Printer1'; // You can make this configurable

        // Create ticket content using simple Bixolon functions
        console.log('🖨️ Starting thermal ticket print...');

        // Print header
        const headerText = `BETZONE\nBET TICKET\n\n`;
        win.printText(headerText, 0, 0, false, false, false, 0, 1);

        // Print separator line
        const separatorLine = "----------------------------------------\n";
        win.printText(separatorLine, 0, 0, false, false, false, 0, 0);

        // Print ticket details
        const createdAt = bet?.createdAt ? new Date(bet.createdAt) : new Date();
        const ticketId = `ID: ${String(bet?.id ?? '').replace(/[^\w\-]/g, '')}\n`;
        const dateText = `Date: ${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}\n\n`;
        
        win.printText(ticketId, 0, 0, false, false, false, 0, 0);
        win.printText(dateText, 0, 0, false, false, false, 0, 0);

        // Print bet type and stake
        const betType = `Bet Type: ${String(bet?.betType ?? '').toUpperCase()}\n`;
        const stake = `Stake: $${formatMoney(bet?.totalStake)}\n`;
        
        win.printText(betType, 0, 0, false, false, false, 0, 0);
        win.printText(stake, 0, 0, false, false, false, 0, 0);

        // Print potential winnings if available
        if (bet?.potentialWinnings != null) {
            const potential = `Potential: $${formatMoney(bet?.potentialWinnings)}\n`;
            win.printText(potential, 0, 0, false, false, false, 0, 0);
        }

        // Print tax if available
        if (bet?.taxPercentage) {
            const tax = `Tax (${bet.taxPercentage}%): -$${formatMoney(bet?.taxAmount)}\n`;
            win.printText(tax, 0, 0, false, false, false, 0, 0);
        }

        // Print net winnings if available
        if (bet?.netWinnings != null) {
            const net = `Net: $${formatMoney(bet?.netWinnings)}\n`;
            win.printText(net, 0, 0, false, false, false, 0, 0);
        }

        // Print status if available
        if (bet?.status) {
            const status = `Status: ${String(bet.status).toUpperCase()}\n`;
            win.printText(status, 0, 0, false, false, false, 0, 0);
        }

        win.printText("\n", 0, 0, false, false, false, 0, 0);

        // Print selections
        win.printText("SELECTIONS:\n", 0, 0, true, false, false, 0, 0);
        
        if (bet?.selections && Array.isArray(bet.selections)) {
            bet.selections.forEach((selection: any, index: number) => {
                const homeTeam = String(selection?.homeTeam ?? '').replace(/[^\w\s]/g, '');
                const awayTeam = String(selection?.awayTeam ?? '').replace(/[^\w\s]/g, '');
                const betType = String(selection?.betType ?? '').replace(/[^\w\s]/g, '');
                const sel = String(selection?.selection ?? '').replace(/[^\w\s]/g, '');
                const odds = selection?.odds ?? '';
                const gameId = selection?.gameId ? String(selection.gameId).replace(/[^\w]/g, '') : '';

                const selectionText = `${index + 1}. ${homeTeam} vs ${awayTeam}\n`;
                const betTypeText = `   ${betType}: ${sel}\n`;
                const oddsText = `   Odds: ${odds}${gameId ? ` Game: ${gameId}` : ''}\n\n`;

                win.printText(selectionText, 0, 0, false, false, false, 0, 0);
                win.printText(betTypeText, 0, 0, false, false, false, 0, 0);
                win.printText(oddsText, 0, 0, false, false, false, 0, 0);
            });
        }

        // Print footer
        win.printText(separatorLine, 0, 0, false, false, false, 0, 0);
        win.printText("\nThank you for betting with BetZone!\n", 0, 0, false, false, false, 0, 1);
        win.printText("Keep this ticket safe\n\n", 0, 0, false, false, false, 0, 1);

        // Print barcode (ticket ID)
        const barcodeData = `BET${String(bet?.id ?? '').replace(/[^\w]/g, '')}`;
        win.print1DBarcode(barcodeData, 7, 3, 70, 2, 1);

        // Add some spacing and cut paper
        win.printText("\n\n", 0, 0, false, false, false, 0, 0);
        win.cutPaper(1);

        // Send to printer using the simple approach
        console.log('📤 Sending print job to Bixolon printer...');
        
        const textToPrint = win.getPosData();
        
        win.requestPrint(printerName, textToPrint, function (result: any) {
            globalPrintInProgress = false;
            
            if (!result) {
                console.log('❌ No print result received');
                return;
            }

            console.log('🖨️ Print result:', result);

            // Handle different result types (following 1nl-client-master pattern)
            if (result === "No printers") {
                window.alert("Error Printing\n\nThere were no printers found.");
                return;
            } else if (result === "Cannot connect to server") {
                window.alert(
                    "Error Printing\n\nCannot connect to the print server. Make sure the Bixolon Web Print SDK program is running and the receipt printer is added and listening on port 18080."
                );
                return;
            }

            // Parse result (format: [randomId]:[error|success])
            var res = String(result).split(":");
            if (Array.isArray(res) && res[1] === "error") {
                window.alert(
                    "Error Printing\n\nThere was a problem printing. Please check the printer is connected and on."
                );
                return;
            }

            // Success!
            console.log('✅ Ticket printed successfully!');
        });

    } catch (error) {
        console.error('❌ Print error:', error);
        window.alert(`Print Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
        globalPrintInProgress = false;
    }
}

// Export a simple test function
export function testBixolonPrinter(): void {
    const win: any = window;
    
    if (!win.checkPrinterStatus) {
        console.error('❌ Bixolon printer functions not available');
        return;
    }

    console.log('✅ Bixolon printer functions available');
    console.log('Available functions:', Object.keys(window).filter(key => 
        key.includes('print') || 
        key.includes('check') || 
        key.includes('request') ||
        key.includes('getPosData')
    ));
}


