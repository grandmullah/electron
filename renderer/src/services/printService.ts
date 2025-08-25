/*
  Centralized thermal ticket printing for 80mm printers.
  - Ensures correct paper size and zero margins
  - Uses monospace fonts only (no emojis) for thermal compatibility
  - Formats numbers consistently with two decimals
  - Waits for DOM load before printing
*/

type AnyBet = any;

function formatMoney(value: unknown): string {
      const num = typeof value === 'number' ? value : parseFloat(String(value ?? 0));
      if (!isFinite(num)) return '0.00';
      return num.toFixed(2);
}

export function printThermalTicket(bet: AnyBet): void {
      const printWindow = window.open('', '_blank', 'width=300,height=700');
      if (!printWindow) {
            alert('Please allow pop-ups to print the ticket');
            return;
      }

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
      @media print { 
        @page { size: 80mm auto; margin: 0; } 
        body { -webkit-print-color-adjust: exact; color-adjust: exact; }
      }
      body { 
        font-family: 'Courier New', 'Courier', monospace; 
        font-size: 11px; 
        line-height: 1.2;
        margin: 5px; 
        color: #000; 
        background: #fff; 
        width: 70mm;
      }
      .center { text-align: center; }
      .line { border-bottom: 1px solid #000; margin: 3px 0; }
      .dashed { border-bottom: 1px dashed #000; margin: 5px 0; }
      p { margin: 1px 0; }
      .bold { font-weight: bold; }
    </style>
  </head>
  <body>
    <div class="center bold">
      <p>BETZONE</p>
      <p>BET TICKET</p>
    </div>
    <div class="dashed"></div>
    
    <p><span class="bold">ID:</span> ${String(bet?.id ?? '').replace(/[^\w\-]/g, '')}</p>
    <p><span class="bold">Date:</span> ${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}</p>
    
    <div class="dashed"></div>
    
    <p><span class="bold">Bet Type:</span> ${String(bet?.betType ?? '').toUpperCase()}</p>
    <p><span class="bold">Stake:</span> $${formatMoney(bet?.totalStake)}</p>
    ${bet?.potentialWinnings != null ? `<p><span class="bold">Potential:</span> $${formatMoney(bet?.potentialWinnings)}</p>` : ''}
    ${bet?.taxPercentage ? `<p><span class="bold">Tax (${bet.taxPercentage}%):</span> -$${formatMoney(bet?.taxAmount)}</p>` : ''}
    ${bet?.netWinnings != null ? `<p><span class="bold">Net:</span> $${formatMoney(bet?.netWinnings)}</p>` : ''}
    ${bet?.status ? `<p><span class="bold">Status:</span> ${String(bet.status).toUpperCase()}</p>` : ''}
    
    <div class="dashed"></div>
    
    <p class="bold">SELECTIONS:</p>
    ${selectionsHtml}
    
    <div class="dashed"></div>
    
    <div class="center">
      <p>Thank you for betting with BetZone!</p>
      <p>Keep this ticket safe</p>
    </div>
  </body>
</html>`;

      // Write and print after load
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      // Ensure styles apply before printing
      printWindow.onload = () => {
            try {
                  printWindow.print();
            } finally {
                  setTimeout(() => {
                        try { printWindow.close(); } catch (_) { /* ignore */ }
                  }, 200);
            }
      };
}


