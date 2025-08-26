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

      // Minimal HTML for Bixolon thermal printer - guaranteed to work
      const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Bet Ticket</title>
<style>
@media print {
  @page { size: 80mm auto; margin: 0; }
}
body {
  font-family: monospace;
  font-size: 11px;
  margin: 0;
  padding: 2px;
  width: 76mm;
}
.center { text-align: center; }
.bold { font-weight: bold; }
.line { border-top: 1px solid black; margin: 3px 0; }
</style>
</head>
<body>
<div class="center bold">
BETZONE<br>
BET TICKET<br>
</div>
<div class="line"></div>

ID: ${String(bet?.id ?? '').replace(/[^\w\-]/g, '')}<br>
Date: ${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}<br>
<div class="line"></div>

Bet Type: ${String(bet?.betType ?? '').toUpperCase()}<br>
Stake: $${formatMoney(bet?.totalStake)}<br>
${bet?.potentialWinnings != null ? `Potential: $${formatMoney(bet?.potentialWinnings)}<br>` : ''}
${bet?.taxPercentage ? `Tax (${bet.taxPercentage}%): -$${formatMoney(bet?.taxAmount)}<br>` : ''}
${bet?.netWinnings != null ? `Net: $${formatMoney(bet?.netWinnings)}<br>` : ''}
${bet?.status ? `Status: ${String(bet.status).toUpperCase()}<br>` : ''}
<div class="line"></div>

SELECTIONS:<br>
${(bet?.selections || []).map((s: any, idx: number) =>
            `${idx + 1}. ${String(s?.homeTeam ?? '').replace(/[^\w\s]/g, '')} vs ${String(s?.awayTeam ?? '').replace(/[^\w\s]/g, '')}<br>` +
            `${String(s?.betType ?? '').replace(/[^\w\s]/g, '')}: ${String(s?.selection ?? '').replace(/[^\w\s]/g, '')}<br>` +
            `Odds: ${s?.odds ?? ''}${s?.gameId ? ` Game: ${String(s.gameId).replace(/[^\w]/g, '')}` : ''}<br>`
      ).join('')}
<div class="line"></div>

<div class="center">
Thank you for betting with BetZone!<br>
Keep this ticket safe<br>
</div>
</body>
</html>`;

      // Direct print function for Bixolon thermal printer
      const safePrint = () => {
            if (hasPrinted) return;
            hasPrinted = true;

            try {
                  // Print immediately
                  printWindow.print();

                  // Close window after a short delay
                  setTimeout(() => {
                        try {
                              if (!printWindow.closed) {
                                    printWindow.close();
                              }
                        } catch (_) {
                              // Ignore errors when closing
                        }
                        globalPrintInProgress = false;
                  }, 2000);

            } catch (error) {
                  console.error('Print failed:', error);
                  globalPrintInProgress = false;
            }
      };

      // Write content and print immediately
      try {
            console.log('Creating print document...');
            printWindow.document.open();
            printWindow.document.write(html);
            printWindow.document.close();

            console.log('Document created, waiting to print...');

            // Wait for content to load, then print
            printWindow.onload = () => {
                  console.log('Document loaded, printing...');

                  // Verify content is visible before printing
                  if (printWindow.document.body && printWindow.document.body.innerHTML.length > 100) {
                        console.log('Content verified, printing...');
                        setTimeout(() => {
                              safePrint();
                        }, 300);
                  } else {
                        console.error('Content not properly loaded');
                        globalPrintInProgress = false;
                  }
            };

            // Fallback if onload doesn't fire
            setTimeout(() => {
                  if (!hasPrinted) {
                        console.log('Fallback print triggered');
                        safePrint();
                  }
            }, 3000);

      } catch (error) {
            console.error('Failed to create print document:', error);
            try { printWindow.close(); } catch (_) { /* ignore */ }
            globalPrintInProgress = false;
      }
}


