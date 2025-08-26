/*
  Centralized thermal ticket printing using bGate Web Print API.
  - Direct thermal printer communication via WebSocket
  - Bypasses browser printing issues and encoding problems
  - Optimized for Bixolon and other thermal printers
  - Reliable text rendering without HTML corruption
  - Supports 80mm thermal paper with proper formatting
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
export async function printThermalTicket(bet: AnyBet): Promise<void> {
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

            console.log('Receipt lines:', receiptLines);
            console.log('Receipt text:', receiptLines.join('\n'));

            // Check if BIXOLON Web Print API is available
            if (typeof (window as any).BixolonWebPrintAPI === 'undefined' &&
                  typeof (window as any).bixolonAPI === 'undefined') {
                  console.error('BIXOLON Web Print API not found. Please include the required scripts.');
                  console.error('Available global objects:', Object.keys(window).filter(key =>
                        key.toLowerCase().includes('bixolon') ||
                        key.toLowerCase().includes('webprint') ||
                        key.toLowerCase().includes('sdk')
                  ));

                  // Try to get enhanced logs if available
                  if (typeof (window as any).BixolonLogs !== 'undefined') {
                        console.log('Enhanced Bixolon logs available:', (window as any).BixolonLogs.getLogs());
                  }

                  alert('BIXOLON thermal printer API not available. Please check script inclusion.');
                  globalPrintInProgress = false;
                  return;
            }

            // Use BIXOLON Web Print API for thermal printing
            console.log('Using BIXOLON Web Print API for thermal printing...');
            console.log('💡 Note: API will auto-detect current machine IP for port 18080');

            try {
                  // Initialize BIXOLON Web Print API (try both names for compatibility)
                  const bixolonAPI = (window as any).bixolonAPI || new (window as any).BixolonWebPrintAPI();

                  // Log current API status
                  if (typeof (window as any).BixolonLogs !== 'undefined') {
                        console.log('Current Bixolon API status:', (window as any).BixolonLogs.getLogs());
                  }

                  // Check if connected to BIXOLON printer
                  if (!bixolonAPI.connected) {
                        console.log('BIXOLON printer not connected, attempting to connect...');

                        try {
                              const connected = await bixolonAPI.connect();
                              if (!connected) {
                                    console.log('Failed to connect to BIXOLON printer, using fallback printing');
                                    throw new Error('BIXOLON printer connection failed');
                              }
                        } catch (connectError) {
                              console.log('BIXOLON printer connection failed, using fallback printing');
                              throw connectError;
                        }
                  }

                  // Configure printer settings for 80mm thermal paper
                  const printerConfig = {
                        width: 80, // 80mm paper width
                        fontSize: 11,
                        fontFamily: 'monospace',
                        lineSpacing: 1.2,
                        margin: 0
                  };

                  // Create print job
                  const printJob = bixolonAPI.createPrintJob(printerConfig);

                  // Add receipt content
                  receiptLines.forEach(line => {
                        if (line === '') {
                              printJob.addLineBreak();
                        } else {
                              printJob.addText(line);
                              printJob.addLineBreak();
                        }
                  });

                  // Execute print job
                  printJob.execute().then(() => {
                        console.log('BIXOLON thermal print job completed successfully');
                        globalPrintInProgress = false;
                  }).catch((error: any) => {
                        console.error('BIXOLON thermal print job failed:', error);
                        globalPrintInProgress = false;
                  });

            } catch (apiError) {
                  console.error('BIXOLON API error:', apiError);

                  // Fallback to simple text printing if API fails
                  console.log('Falling back to simple text printing...');
                  const printWindow = window.open('', '_blank', 'width=300,height=600');
                  if (printWindow) {
                        const simpleText = receiptLines.join('\n');
                        printWindow.document.write(`
                            <html>
                            <head><title>Print</title></head>
                            <body style="font-family: monospace; font-size: 11px;">
                            <pre>${simpleText}</pre>
                            </body>
                            </html>
                        `);
                        printWindow.document.close();

                        setTimeout(() => {
                              printWindow.print();
                              setTimeout(() => {
                                    try { printWindow.close(); } catch (_) { }
                                    globalPrintInProgress = false;
                              }, 2000);
                        }, 1000);
                  } else {
                        globalPrintInProgress = false;
                  }
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


