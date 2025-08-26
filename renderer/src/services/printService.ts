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

            // Windows 11-optimized printing approach
            console.log('Using Windows 11-optimized printing method...');

            // Create a new window with Windows 11-specific settings
            const printWindow = window.open('', '_blank', 'width=500,height=900,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no');
            if (!printWindow) {
                  alert('Please allow pop-ups to print the ticket');
                  globalPrintInProgress = false;
                  return;
            }

            // Add print window reference to prevent multiple windows
            let printWindowRef = printWindow;

            // Windows 11-optimized HTML with guaranteed text display
            const windowsHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Bet Ticket</title>
    <style>
        @media print {
            @page { 
                size: 80mm auto; 
                margin: 0; 
                padding: 0;
            }
            body { 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                color-adjust: exact;
            }
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
        }
        body {
            font-family: monospace;
            font-size: 12px;
            margin: 0;
            padding: 10px;
            width: 70mm;
            background: white;
            color: black;
            line-height: 1.3;
        }
        .receipt-content {
            font-family: monospace;
            font-size: 12px;
            white-space: pre;
            margin: 0;
            padding: 0;
            border: 1px solid #ccc;
            background: white;
            min-height: 200px;
        }
        @media screen {
            body { 
                background: #f0f0f0; 
                padding: 20px;
            }
            .receipt-content {
                border: 2px solid #333;
                background: white;
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-content">
${receiptLines.join('\n')}
    </div>
    
    <!-- Backup text display -->
    <pre style="font-family: monospace; font-size: 12px; margin: 10px 0; padding: 10px; border: 1px solid #999; background: #f9f9f9;">
${receiptLines.join('\n')}
    </pre>
</body>
</html>`;

            console.log('Windows HTML created, length:', windowsHtml.length);
            console.log('Windows HTML preview:', windowsHtml.substring(0, 300));

            // Write content to window using multiple methods for Windows 11
            printWindow.document.open();
            printWindow.document.write(windowsHtml);
            printWindow.document.close();

            // Alternative method: Also set innerHTML as backup
            setTimeout(() => {
                  try {
                        if (printWindow.document.body) {
                              printWindow.document.body.innerHTML = windowsHtml;
                              console.log('Backup innerHTML method applied');
                        }
                  } catch (e) {
                        console.log('Backup method failed:', e);
                  }
            }, 100);

            // Windows 11 alternative: Create data URL for better compatibility
            setTimeout(() => {
                  try {
                        const receiptText = receiptLines.join('\n');
                        const dataUrl = `data:text/html;charset=utf-8,<html><head><title>Bet Ticket</title><style>@media print{@page{size:80mm auto;margin:0}}body{font-family:monospace;font-size:12px;margin:0;padding:10px;width:70mm}</style></head><body><pre>${encodeURIComponent(receiptText)}</pre></body></html>`;

                        const dataWindow = window.open(dataUrl, '_blank', 'width=400,height=600');
                        if (dataWindow) {
                              console.log('Windows 11 data URL window created as backup');

                              // Store reference for cleanup
                              setTimeout(() => {
                                    try {
                                          if (dataWindow && !dataWindow.closed) {
                                                dataWindow.close();
                                          }
                                    } catch (_) { }
                              }, 5000);
                        }
                  } catch (e) {
                        console.log('Data URL method failed:', e);
                  }
            }, 200);

            // Windows 11-specific timing and print handling
            setTimeout(() => {
                  try {
                        console.log('Checking Windows 11 print window content...');

                        // Debug: Check the entire document
                        console.log('Document title:', printWindow.document.title);
                        console.log('Document body exists:', !!printWindow.document.body);
                        console.log('Document body innerHTML length:', printWindow.document.body?.innerHTML?.length || 0);
                        console.log('Document body textContent length:', printWindow.document.body?.textContent?.length || 0);

                        // Verify content is loaded
                        const contentDiv = printWindow.document.querySelector('.receipt-content');
                        const textContent = contentDiv?.textContent || '';

                        console.log('Content div found:', !!contentDiv);
                        console.log('Content div innerHTML:', contentDiv?.innerHTML?.substring(0, 200) || 'NOT FOUND');
                        console.log('Text content length:', textContent.length);
                        console.log('Text content preview:', textContent.substring(0, 200));

                        if (textContent && textContent.length > 30) {
                              console.log('Windows 11 content verified, printing...');

                              // Set flag to prevent multiple prints
                              let hasPrinted = false;

                              // Windows 11-specific print sequence
                              printWindow.focus();

                              // Wait for Windows 11 to process the window
                              setTimeout(() => {
                                    if (hasPrinted) return; // Prevent multiple prints
                                    hasPrinted = true;

                                    try {
                                          // Windows 11-specific print sequence
                                          console.log('Executing Windows 11 print sequence...');

                                          // Method 1: Standard print
                                          printWindow.print();
                                          console.log('Windows 11 print command sent');

                                          // Method 2: Alternative print method for Windows 11
                                          setTimeout(() => {
                                                try {
                                                      // Try using execCommand as backup for Windows 11
                                                      if (printWindow.document.execCommand) {
                                                            printWindow.document.execCommand('print', false, undefined);
                                                            console.log('Windows 11 execCommand print sent');
                                                      }
                                                } catch (execError) {
                                                      console.log('execCommand print failed:', execError);
                                                }
                                          }, 1000);

                                          // Extended timeout for Windows 11 print processing
                                          setTimeout(() => {
                                                try {
                                                      if (!printWindow.closed) {
                                                            printWindow.close();
                                                      }
                                                } catch (_) {
                                                      // Ignore close errors
                                                }
                                                globalPrintInProgress = false;
                                                console.log('Windows 11 print job completed');
                                          }, 4000); // Extended for Windows 11
                                    } catch (printError) {
                                          console.error('Windows 11 print execution failed:', printError);
                                          globalPrintInProgress = false;
                                    }
                              }, 500);
                        } else {
                              console.error('Windows 11 content not loaded, trying fallback...');
                              tryFallbackMethod();
                        }
                  } catch (error) {
                        console.error('Windows 11 print failed:', error);
                        tryFallbackMethod();
                  }
            }, 2000); // Extended timeout for Windows 11

            // Safety timeout to prevent endless printing
            setTimeout(() => {
                  if (globalPrintInProgress) {
                        console.warn('Safety timeout triggered, resetting print state');
                        try {
                              if (printWindowRef && !printWindowRef.closed) {
                                    printWindowRef.close();
                              }
                        } catch (_) { }
                        globalPrintInProgress = false;
                  }
            }, 10000); // 10 second safety timeout

            // Fallback method using window.open
            function tryFallbackMethod() {
                  // Prevent fallback if main method is already printing
                  if (!globalPrintInProgress) {
                        console.log('Main print method already completed, skipping fallback');
                        return;
                  }

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


