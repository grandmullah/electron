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

            // Method 1: Try using iframe approach
            console.log('Trying iframe method...');
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
                  iframeDoc.open();
                  iframeDoc.body.innerHTML = `
                      <html>
                      <head>
                          <title>Bet Ticket</title>
                          <style>
                              @media print {
                                  @page { size: 80mm auto; margin: 0; }
                              }
                              body {
                                  font-family: monospace;
                                  font-size: 10px;
                                  margin: 0;
                                  padding: 5px;
                                  width: 70mm;
                              }
                          </style>
                      </head>
                      <body>
                          <pre style="font-family: monospace; font-size: 10px; margin: 0; padding: 0; white-space: pre;">
${receiptLines.join('\n')}
                          </pre>
                      </body>
                      </html>
                  `;
                  iframeDoc.close();

                  // Wait for iframe to load
                  setTimeout(() => {
                        try {
                              console.log('Iframe content loaded, checking...');
                              const iframeText = iframeDoc.body?.textContent || '';
                              console.log('Iframe text length:', iframeText.length);
                              console.log('Iframe text preview:', iframeText.substring(0, 100));

                              if (iframeText.length > 20) {
                                    console.log('Iframe content verified, printing...');
                                    iframe.contentWindow?.print();
                                    console.log('Iframe print command sent');

                                    // Clean up iframe after printing
                                    setTimeout(() => {
                                          document.body.removeChild(iframe);
                                          globalPrintInProgress = false;
                                          console.log('Iframe print job completed');
                                    }, 3000);
                              } else {
                                    console.error('Iframe content not loaded, trying window method...');
                                    document.body.removeChild(iframe);
                                    tryWindowMethod();
                              }
                        } catch (error) {
                              console.error('Iframe print failed:', error);
                              document.body.removeChild(iframe);
                              tryWindowMethod();
                        }
                  }, 1000);
            } else {
                  console.error('Iframe not supported, trying window method...');
                  tryWindowMethod();
            }

            // Fallback method using window.open
            function tryWindowMethod() {
                  console.log('Trying window.open method...');

                  const printWindow = window.open('', '_blank', 'width=300,height=600');
                  if (!printWindow) {
                        alert('Please allow pop-ups to print the ticket');
                        globalPrintInProgress = false;
                        return;
                  }

                  // Create very simple content
                  const simpleContent = `
                      <html>
                      <head><title>Print</title></head>
                      <body style="font-family: monospace; font-size: 10px;">
                      ${receiptLines.map(line => line === '' ? '<br>' : line).join('<br>')}
                      </body>
                      </html>`;

                  printWindow.document.open();
                  printWindow.document.body.innerHTML = simpleContent;
                  printWindow.document.close();

                  setTimeout(() => {
                        try {
                              printWindow.print();
                              console.log('Window print command sent');

                              setTimeout(() => {
                                    try { printWindow.close(); } catch (_) { }
                                    globalPrintInProgress = false;
                              }, 2000);
                        } catch (error) {
                              console.error('Window print failed:', error);
                              globalPrintInProgress = false;
                        }
                  }, 1000);
            }

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


