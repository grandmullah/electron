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
                <div class="selection">
                  <p><strong>${idx + 1}. ${s?.homeTeam ?? ''} vs ${s?.awayTeam ?? ''}</strong></p>
                  <p>${s?.betType ?? ''}: ${s?.selection ?? ''}</p>
                  <p>Odds: ${s?.odds ?? ''}${s?.gameId ? ` | Game: ${s.gameId}` : ''}</p>
                </div>`
            )
            .join('');

      const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Bet Ticket - ${bet?.id ?? ''}</title>
    <style>
      @media print { @page { size: 80mm auto; margin: 0; } body { -webkit-print-color-adjust: exact; } }
      body { font-family: monospace; font-size: 12px; margin: 10px; color: #000; background: #fff; }
      .ticket { width: 72mm; margin: 0 auto; }
      .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 10px; }
      .header h2 { margin: 0 0 4px 0; font-size: 16px; }
      .header p { margin: 2px 0; }
      .bet-info { margin-bottom: 10px; }
      .bet-info p { margin: 2px 0; }
      .selections { margin-top: 6px; }
      .selections h4 { margin: 4px 0; }
      .selection { border-bottom: 1px solid #ccc; padding: 5px 0; }
      .footer { text-align: center; border-top: 1px dashed #000; padding-top: 8px; margin-top: 10px; }
    </style>
  </head>
  <body>
    <div class="ticket">
      <div class="header">
        <h2>BETZONE</h2>
        <p>Bet Ticket</p>
        <p>ID: ${bet?.id ?? ''}</p>
        <p>Date: ${createdAt.toLocaleString()}</p>
      </div>
      <div class="bet-info">
        <p><strong>Bet Type:</strong> ${bet?.betType ?? ''}</p>
        <p><strong>Stake:</strong> $${formatMoney(bet?.totalStake)}</p>
        ${bet?.potentialWinnings != null ? `<p><strong>Potential Winnings:</strong> $${formatMoney(bet?.potentialWinnings)}</p>` : ''}
        ${bet?.taxPercentage ? `<p><strong>Tax (${bet.taxPercentage}%):</strong> -$${formatMoney(bet?.taxAmount)}</p>` : ''}
        ${bet?.netWinnings != null ? `<p><strong>Net Winnings:</strong> $${formatMoney(bet?.netWinnings)}</p>` : ''}
        ${bet?.status ? `<p><strong>Status:</strong> ${bet.status}</p>` : ''}
      </div>
      <div class="selections">
        <h4>Selections:</h4>
        ${selectionsHtml}
      </div>
      <div class="footer">
        <p>Thank you for betting with BetZone!</p>
        <p>Keep this ticket safe</p>
      </div>
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


