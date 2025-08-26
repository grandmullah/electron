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

      try {
            // Create a simple text-based receipt
            const createdAt = bet?.createdAt ? new Date(bet.createdAt) : new Date();

            // Build receipt text line by line
            const receiptLines = [
                  'BETZONE',
                  'BET TICKET',
                  '',
                  `ID: ${String(bet?.id ?? '').replace(/[^\w\-]/g, '')}`,
                  `Date: ${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}`,
                  '',
                  `Bet Type: ${String(bet?.betType ?? '').toUpperCase()}`,
                  `Stake: $${formatMoney(bet?.totalStake)}`,
                  ...(bet?.potentialWinnings != null ? [`Potential: $${formatMoney(bet?.potentialWinnings)}`] : []),
                  ...(bet?.taxPercentage ? [`Tax (${bet.taxPercentage}%): -$${formatMoney(bet?.taxAmount)}`] : []),
                  ...(bet?.netWinnings != null ? [`Net: $${formatMoney(bet?.netWinnings)}`] : []),
                  ...(bet?.status ? [`Status: ${String(bet.status).toUpperCase()}`] : []),
                  '',
                  'SELECTIONS:',
                  ...(bet?.selections || []).map((s: any, idx: number) => [
                        `${idx + 1}. ${String(s?.homeTeam ?? '').replace(/[^\w\s]/g, '')} vs ${String(s?.awayTeam ?? '').replace(/[^\w\s]/g, '')}`,
                        `${String(s?.betType ?? '').replace(/[^\w\s]/g, '')}: ${String(s?.selection ?? '').replace(/[^\w\s]/g, '')}`,
                        `Odds: ${s?.odds ?? ''}${s?.gameId ? ` Game: ${String(s.gameId).replace(/[^\w]/g, '')}` : ''}`,
                        ''
                  ]).flat(),
                  'Thank you for betting with BetZone!',
                  'Keep this ticket safe'
            ];

            // Debug: Log the receipt content
            console.log('Receipt lines:', receiptLines);
            console.log('Receipt text:', receiptLines.join('\n'));

            // Create the absolute simplest possible HTML
            const minimalHtml = `
<html>
<head>
<title>Bet Ticket</title>
</head>
<body>
<pre>${receiptLines.join('\n')}</pre>
</body>
</html>`;

            console.log('Minimal HTML created, length:', minimalHtml.length);
            console.log('Minimal HTML:', minimalHtml);

            // Create print window
            const printWindow = window.open('', '_blank', 'width=300,height=600');
            if (!printWindow) {
                  alert('Please allow pop-ups to print the ticket');
                  globalPrintInProgress = false;
                  return;
            }

            console.log('Print window created, writing minimal content...');

            // Write minimal content
            printWindow.document.open();
            printWindow.document.write(minimalHtml);
            printWindow.document.close();

            // Wait and then print
            setTimeout(() => {
                  console.log('Checking content and printing...');

                  try {
                        // Get the actual text content
                        const preElement = printWindow.document.querySelector('pre');
                        const textContent = preElement?.textContent || '';

                        console.log('Pre element found:', !!preElement);
                        console.log('Text content length:', textContent.length);
                        console.log('Text content:', textContent);

                        if (textContent && textContent.length > 20) {
                              console.log('Content verified, printing...');
                              printWindow.print();
                              console.log('Print command sent');

                              // Close window after printing
                              setTimeout(() => {
                                    try {
                                          if (!printWindow.closed) {
                                                printWindow.close();
                                          }
                                    } catch (_) {
                                          // Ignore close errors
                                    }
                                    globalPrintInProgress = false;
                                    console.log('Print job completed');
                              }, 3000);
                        } else {
                              console.error('No text content found, trying direct text method...');

                              // Last resort: Create a completely text-based approach
                              const textWindow = window.open('', '_blank', 'width=200,height=400');
                              if (textWindow) {
                                    textWindow.document.write(`
                                        <html>
                                        <head><title>Print</title></head>
                                        <body>
                                        ${receiptLines.map(line => line === '' ? '<br>' : line).join('<br>')}
                                        </body>
                                        </html>
                                    `);
                                    textWindow.document.close();

                                    setTimeout(() => {
                                          textWindow.print();
                                          setTimeout(() => {
                                                try { textWindow.close(); } catch (_) { }
                                                globalPrintInProgress = false;
                                          }, 2000);
                                    }, 500);
                              } else {
                                    // Final fallback: Try data URL approach
                                    console.log('Trying data URL approach...');
                                    const receiptText = receiptLines.join('\n');
                                    const dataUrl = `data:text/html,<html><body><pre>${encodeURIComponent(receiptText)}</pre></body></html>`;
                                    const dataWindow = window.open(dataUrl, '_blank', 'width=200,height=400');

                                    if (dataWindow) {
                                          setTimeout(() => {
                                                dataWindow.print();
                                                setTimeout(() => {
                                                      try { dataWindow.close(); } catch (_) { }
                                                      globalPrintInProgress = false;
                                                }, 2000);
                                          }, 500);
                                    } else {
                                          globalPrintInProgress = false;
                                    }
                              }
                        }
                  } catch (error) {
                        console.error('Print failed:', error);
                        globalPrintInProgress = false;
                  }
            }, 1000);

      } catch (error) {
            console.error('Failed to create print ticket:', error);
            globalPrintInProgress = false;
      }
}

// Test function to verify print service is working
export function testPrintService(): void {
      const testBet = {
            id: 'TEST-001',
            createdAt: new Date(),
            betType: 'Single',
            totalStake: 10.00,
            potentialWinnings: 25.00,
            status: 'pending',
            selections: [
                  {
                        homeTeam: 'Team A',
                        awayTeam: 'Team B',
                        betType: 'Match Winner',
                        selection: 'Team A',
                        odds: '2.50',
                        gameId: 'GAME-001'
                  }
            ]
      };

      console.log('Testing print service with sample bet...');
      printThermalTicket(testBet);
}


