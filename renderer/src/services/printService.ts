/*
  Centralized thermal ticket printing optimized for Bixolon POS thermal printers.
  - Ensures correct 80mm paper size with zero margins for Bixolon compatibility
  - Uses monospace fonts only (no emojis) for thermal printer compatibility
  - Optimized for Bixolon SRP series (SRP-330, SRP-350, SRP-270, etc.)
  - Formats numbers consistently with two decimals
  - Prevents endless printing with multiple safeguards
  - Uses proper paper width and character spacing for thermal printing
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
 * Print thermal ticket optimized for Bixolon POS thermal printers
 * 
 * Bixolon-specific optimizations:
 * - 76mm content width for 80mm paper (optimal margin for Bixolon SRP series)
 * - Extended timeouts for thermal printer processing
 * - Monospace fonts for consistent character spacing
 * - Proper page break handling with no-break classes
 * - Multiple safeguards against endless printing
 * 
 * Compatible with: SRP-330, SRP-350, SRP-270, SRP-275, and other Bixolon models
 */
export function printThermalTicket(bet: AnyBet): void {
      // Prevent multiple simultaneous print operations
      if (globalPrintInProgress) {
            console.warn('Print operation already in progress. Please wait.');
            return;
      }

      globalPrintInProgress = true;

      // Optimized window size for Bixolon thermal printer preview
      const printWindow = window.open('', '_blank', 'width=320,height=800,scrollbars=no,resizable=no');
      if (!printWindow) {
            alert('Please allow pop-ups to print the ticket');
            globalPrintInProgress = false; // Reset flag on failure
            return;
      }

      // Flag to prevent multiple print calls
      let hasPrinted = false;

      const createdAt = bet?.createdAt ? new Date(bet.createdAt) : new Date();
      const selectionsHtml = (bet?.selections || [])
            .map(
                  (s: any, idx: number) => `
                <p class="bold">${idx + 1}. ${String(s?.homeTeam ?? '').replace(/[^\w\s]/g, '')} vs ${String(s?.awayTeam ?? '').replace(/[^\w\s]/g, '')}</p>
                <p>${String(s?.betType ?? '').replace(/[^\w\s]/g, '')}: ${String(s?.selection ?? '').replace(/[^\w\s]/g, '')}</p>
                <p>Odds: ${s?.odds ?? ''}${s?.gameId ? ` Game: ${String(s.gameId).replace(/[^\w]/g, '')}` : ''}</p>
                <div class="line"></div>`
            )
            .join('');

      // Use simple ASCII characters and avoid complex formatting for thermal compatibility
      const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Bet Ticket</title>
    <style>
      /* Bixolon thermal printer optimized styles */
      @media print { 
        @page { 
          size: 80mm auto; 
          margin: 0mm; 
          padding: 0mm;
        } 
        body { 
          -webkit-print-color-adjust: exact; 
          color-adjust: exact;
          print-color-adjust: exact;
        }
      }
      body { 
        font-family: 'Courier New', 'Courier', monospace; 
        font-size: 10px; 
        line-height: 1.1;
        margin: 2mm; 
        padding: 0;
        color: #000; 
        background: #fff; 
        width: 76mm; /* Optimal for 80mm Bixolon thermal paper */
        max-width: 76mm;
        overflow: hidden;
        word-wrap: break-word;
      }
      .center { 
        text-align: center; 
        width: 100%;
      }
      .line { 
        border-bottom: 1px solid #000; 
        margin: 2px 0; 
        width: 100%;
        height: 1px;
      }
      .dashed { 
        border-bottom: 1px dashed #000; 
        margin: 3px 0; 
        width: 100%;
        height: 1px;
      }
      p { 
        margin: 1px 0; 
        padding: 0;
        font-size: 10px;
        line-height: 1.1;
      }
      .bold { 
        font-weight: bold; 
        font-size: 10px;
      }
      /* Ensure no page breaks in critical sections */
      .no-break {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    </style>
  </head>
  <body>
    <div class="center bold no-break">
      <p>BETZONE</p>
      <p>BET TICKET</p>
    </div>
    <div class="dashed"></div>
    
    <div class="no-break">
      <p><span class="bold">ID:</span> ${String(bet?.id ?? '').replace(/[^\w\-]/g, '')}</p>
      <p><span class="bold">Date:</span> ${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}</p>
    </div>
    
    <div class="dashed"></div>
    
    <div class="no-break">
      <p><span class="bold">Bet Type:</span> ${String(bet?.betType ?? '').toUpperCase()}</p>
      <p><span class="bold">Stake:</span> $${formatMoney(bet?.totalStake)}</p>
      ${bet?.potentialWinnings != null ? `<p><span class="bold">Potential:</span> $${formatMoney(bet?.potentialWinnings)}</p>` : ''}
      ${bet?.taxPercentage ? `<p><span class="bold">Tax (${bet.taxPercentage}%):</span> -$${formatMoney(bet?.taxAmount)}</p>` : ''}
      ${bet?.netWinnings != null ? `<p><span class="bold">Net:</span> $${formatMoney(bet?.netWinnings)}</p>` : ''}
      ${bet?.status ? `<p><span class="bold">Status:</span> ${String(bet.status).toUpperCase()}</p>` : ''}
    </div>
    
    <div class="dashed"></div>
    
    <div class="no-break">
      <p class="bold">SELECTIONS:</p>
      ${selectionsHtml}
    </div>
    
    <div class="dashed"></div>
    
    <div class="center no-break">
      <p>Thank you for betting with BetZone!</p>
      <p>Keep this ticket safe</p>
    </div>
  </body>
</html>`;

      // Function to safely print and close - optimized for Bixolon thermal printers
      const safePrint = () => {
            if (hasPrinted) return; // Prevent multiple prints
            hasPrinted = true;

            try {
                  // Give Bixolon printer time to process the document
                  setTimeout(() => {
                        try {
                              printWindow.print();
                        } catch (error) {
                              console.error('Bixolon print failed:', error);
                        }
                  }, 100);
            } catch (error) {
                  console.error('Print setup failed:', error);
            } finally {
                  // Close window after print dialog and reset global flag
                  // Extended timeout for Bixolon thermal printer processing
                  setTimeout(() => {
                        try {
                              if (!printWindow.closed) {
                                    printWindow.close();
                              }
                        } catch (_) {
                              // Ignore errors when closing
                        }
                        // Reset global print flag
                        globalPrintInProgress = false;
                        console.log('Bixolon print job completed');
                  }, 800);
            }
      };

      // Write content to window
      try {
            printWindow.document.open();
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();

            // Bixolon-optimized document loading and printing
            if (printWindow.document.readyState === 'complete') {
                  // Document already loaded - wait a bit for Bixolon printer readiness
                  setTimeout(safePrint, 200);
            } else {
                  // Wait for document to load
                  printWindow.onload = safePrint;
                  // Extended fallback timeout for Bixolon thermal printer processing
                  setTimeout(safePrint, 1500);
            }
      } catch (error) {
            console.error('Failed to create print document:', error);
            try { printWindow.close(); } catch (_) { /* ignore */ }
            globalPrintInProgress = false; // Reset flag on error
      }
}


