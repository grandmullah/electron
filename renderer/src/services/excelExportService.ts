import { API_BASE_URL } from './apiConfig';

export interface ExportSummaryData {
      summary: {
            shop: {
                  id: string;
                  name: string;
                  code: string;
                  address: string;
                  currency: string;
            };
            financial: {
                  grossRevenue: number;
                  netWinningsPaidToUsers: number;
                  stakesFromLostBets: number;
                  stakesFromWinningBets: number;
                  taxesCollectedByShop: number;
            };
            counts: {
                  totalBets: number;
                  winningBets: number;
                  losingBets: number;
                  pendingBets: number;
                  totalPayouts: number;
                  completedPayouts: number;
                  pendingPayouts: number;
            };
            period: {
                  days: number;
                  fromDate: string;
                  toDate: string;
            };
      };
      payouts: Array<{
            payout_id: string;
            ticket_id: string;
            payout_amount: number;
            payment_method: string;
            reference: string;
            payout_status: string;
            payout_created_at: string;
            payout_processed_at: string;
            payout_notes: string;
            bet_id: string;
            bet_type: string;
            total_stake: number;
            potential_winnings: number;
            tax_amount: number;
            net_winnings: number;
            bet_status: string;
            bet_created_at: string;
            bet_settled_at: string;
            user_id: string;
            phone_number: string;
            country_code: string;
            dial_code: string;
            shop_name: string;
            shop_code: string;
      }>;
      bets: Array<{
            bet_id: string;
            user_id: string;
            bet_type: string;
            total_stake: number;
            potential_winnings: number;
            tax_amount: number;
            net_winnings: number;
            bet_status: string;
            bet_created_at: string;
            bet_settled_at: string;
            payout_status: string;
            payout_id: string;
            phone_number: string;
            country_code: string;
            dial_code: string;
            shop_name: string;
            shop_code: string;
            total_selections: number;
            settled_selections: number;
            won_selections: number;
            lost_selections: number;
            void_selections: number;
      }>;
      selections: Array<{
            selection_id: string;
            bet_id: string;
            game_id: string;
            market_type: string;
            selection: string;
            odds_data: any;
            settlement_status: string;
            settlement_result: string;
            settlement_reason: string;
            settled_at: string;
            game_external_id: string;
            home_team_name: string;
            away_team_name: string;
            home_score: number;
            away_score: number;
            game_status: string;
            commence_time: string;
            league_key: string;
            league_name: string;
            sport_key: string;
            sport_name: string;
            bet_type: string;
            total_stake: number;
            bet_status: string;
            phone_number: string;
            country_code: string;
            shop_name: string;
            shop_code: string;
      }>;
}

export interface ExportResponse {
      success: boolean;
      message: string;
      data: ExportSummaryData;
      excelStructure?: {
            sheets: Array<{
                  name: string;
                  data: any[];
            }>;
      };
}

class ExcelExportService {
      private baseUrl: string;

      constructor() {
            this.baseUrl = `${API_BASE_URL}/payout`;
      }

      /**
       * Get export summary data for Excel generation
       */
      async getExportSummary(days: number = 30, format: 'json' | 'excel' = 'json'): Promise<ExportResponse> {
            try {
                  const queryParams = new URLSearchParams();
                  queryParams.append('days', days.toString());
                  queryParams.append('format', format);

                  const response = await fetch(`${this.baseUrl}/export-summary?${queryParams.toString()}`, {
                        method: 'GET',
                        headers: {
                              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                              'Content-Type': 'application/json',
                        },
                  });

                  const data = await response.json();

                  if (!response.ok) {
                        throw new Error(data.message || 'Failed to get export summary');
                  }

                  return data;
            } catch (error: any) {
                  console.error('Error getting export summary:', error);
                  throw new Error(error.message || 'Failed to get export summary');
            }
      }

      /**
       * Generate Excel file from export data
       */
      async generateExcelFile(exportData: ExportSummaryData, days: number): Promise<void> {
            try {
                  // Import xlsx library dynamically
                  const XLSX = await import('xlsx');

                  // Create workbook
                  const workbook = XLSX.utils.book_new();

                  // 1. Summary Sheet
                  const summarySheet = this.createSummarySheet(exportData.summary);
                  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

                  // 2. Payouts Sheet
                  const payoutsSheet = this.createPayoutsSheet(exportData.payouts);
                  XLSX.utils.book_append_sheet(workbook, payoutsSheet, 'Payouts');

                  // 3. Bets Sheet
                  const betsSheet = this.createBetsSheet(exportData.bets);
                  XLSX.utils.book_append_sheet(workbook, betsSheet, 'Bets');

                  // 4. Selections Sheet
                  const selectionsSheet = this.createSelectionsSheet(exportData.selections);
                  XLSX.utils.book_append_sheet(workbook, selectionsSheet, 'Selections');

                  // Generate filename with timestamp
                  const timestamp = new Date().toISOString().split('T')[0];
                  const filename = `betzone-export-${days}days-${timestamp}.xlsx`;

                  // Write file
                  XLSX.writeFile(workbook, filename);

                  console.log(`Excel file generated: ${filename}`);
            } catch (error: any) {
                  console.error('Error generating Excel file:', error);
                  throw new Error(error.message || 'Failed to generate Excel file');
            }
      }

      /**
       * Create Summary sheet data
       */
      private createSummarySheet(summary: ExportSummaryData['summary']): any[] {
            const sheetData = [
                  ['BETZONE EXPORT SUMMARY'],
                  [''],
                  ['Shop Information'],
                  ['Shop Name', summary.shop.name],
                  ['Shop Code', summary.shop.code],
                  ['Shop Address', summary.shop.address],
                  ['Currency', summary.shop.currency],
                  [''],
                  ['Period Information'],
                  ['Days', summary.period.days],
                  ['From Date', new Date(summary.period.fromDate).toLocaleDateString()],
                  ['To Date', new Date(summary.period.toDate).toLocaleDateString()],
                  [''],
                  ['Financial Summary'],
                  ['Gross Revenue', summary.financial.grossRevenue],
                  ['Net Winnings Paid to Users', summary.financial.netWinningsPaidToUsers],
                  ['Stakes from Lost Bets', summary.financial.stakesFromLostBets],
                  ['Stakes from Winning Bets', summary.financial.stakesFromWinningBets],
                  ['Taxes Collected by Shop', summary.financial.taxesCollectedByShop],
                  [''],
                  ['Counts Summary'],
                  ['Total Bets', summary.counts.totalBets],
                  ['Winning Bets', summary.counts.winningBets],
                  ['Losing Bets', summary.counts.losingBets],
                  ['Pending Bets', summary.counts.pendingBets],
                  ['Total Payouts', summary.counts.totalPayouts],
                  ['Completed Payouts', summary.counts.completedPayouts],
                  ['Pending Payouts', summary.counts.pendingPayouts],
                  [''],
                  ['Generated on', new Date().toLocaleString()],
            ];

            return sheetData;
      }

      /**
       * Create Payouts sheet data
       */
      private createPayoutsSheet(payouts: ExportSummaryData['payouts']): any[] {
            if (payouts.length === 0) {
                  return [['No payout data available']];
            }

            const headers = [
                  'Payout ID',
                  'Ticket ID',
                  'Amount',
                  'Payment Method',
                  'Reference',
                  'Status',
                  'Created At',
                  'Processed At',
                  'Notes',
                  'Bet ID',
                  'Bet Type',
                  'Total Stake',
                  'Potential Winnings',
                  'Tax Amount',
                  'Net Winnings',
                  'Bet Status',
                  'Bet Created At',
                  'Bet Settled At',
                  'User ID',
                  'Phone Number',
                  'Country Code',
                  'Dial Code',
                  'Shop Name',
                  'Shop Code',
            ];

            const rows = payouts.map(payout => [
                  payout.payout_id,
                  payout.ticket_id,
                  payout.payout_amount,
                  payout.payment_method,
                  payout.reference,
                  payout.payout_status,
                  new Date(payout.payout_created_at).toLocaleString(),
                  payout.payout_processed_at ? new Date(payout.payout_processed_at).toLocaleString() : '',
                  payout.payout_notes || '',
                  payout.bet_id,
                  payout.bet_type,
                  payout.total_stake,
                  payout.potential_winnings,
                  payout.tax_amount,
                  payout.net_winnings,
                  payout.bet_status,
                  new Date(payout.bet_created_at).toLocaleString(),
                  payout.bet_settled_at ? new Date(payout.bet_settled_at).toLocaleString() : '',
                  payout.user_id,
                  payout.phone_number,
                  payout.country_code,
                  payout.dial_code,
                  payout.shop_name,
                  payout.shop_code,
            ]);

            return [headers, ...rows];
      }

      /**
       * Create Bets sheet data
       */
      private createBetsSheet(bets: ExportSummaryData['bets']): any[] {
            if (bets.length === 0) {
                  return [['No bet data available']];
            }

            const headers = [
                  'Bet ID',
                  'User ID',
                  'Bet Type',
                  'Total Stake',
                  'Potential Winnings',
                  'Tax Amount',
                  'Net Winnings',
                  'Bet Status',
                  'Bet Created At',
                  'Bet Settled At',
                  'Payout Status',
                  'Payout ID',
                  'Phone Number',
                  'Country Code',
                  'Dial Code',
                  'Shop Name',
                  'Shop Code',
                  'Total Selections',
                  'Settled Selections',
                  'Won Selections',
                  'Lost Selections',
                  'Void Selections',
            ];

            const rows = bets.map(bet => [
                  bet.bet_id,
                  bet.user_id,
                  bet.bet_type,
                  bet.total_stake,
                  bet.potential_winnings,
                  bet.tax_amount,
                  bet.net_winnings,
                  bet.bet_status,
                  new Date(bet.bet_created_at).toLocaleString(),
                  bet.bet_settled_at ? new Date(bet.bet_settled_at).toLocaleString() : '',
                  bet.payout_status,
                  bet.payout_id || '',
                  bet.phone_number,
                  bet.country_code,
                  bet.dial_code,
                  bet.shop_name,
                  bet.shop_code,
                  bet.total_selections,
                  bet.settled_selections,
                  bet.won_selections,
                  bet.lost_selections,
                  bet.void_selections,
            ]);

            return [headers, ...rows];
      }

      /**
       * Create Selections sheet data
       */
      private createSelectionsSheet(selections: ExportSummaryData['selections']): any[] {
            if (selections.length === 0) {
                  return [['No selection data available']];
            }

            const headers = [
                  'Selection ID',
                  'Bet ID',
                  'Game ID',
                  'Market Type',
                  'Selection',
                  'Settlement Status',
                  'Settlement Result',
                  'Settlement Reason',
                  'Settled At',
                  'Game External ID',
                  'Home Team',
                  'Away Team',
                  'Home Score',
                  'Away Score',
                  'Game Status',
                  'Commence Time',
                  'League Key',
                  'League Name',
                  'Sport Key',
                  'Sport Name',
                  'Bet Type',
                  'Total Stake',
                  'Bet Status',
                  'Phone Number',
                  'Country Code',
                  'Shop Name',
                  'Shop Code',
            ];

            const rows = selections.map(selection => [
                  selection.selection_id,
                  selection.bet_id,
                  selection.game_id,
                  selection.market_type,
                  selection.selection,
                  selection.settlement_status,
                  selection.settlement_result,
                  selection.settlement_reason || '',
                  selection.settled_at ? new Date(selection.settled_at).toLocaleString() : '',
                  selection.game_external_id,
                  selection.home_team_name,
                  selection.away_team_name,
                  selection.home_score,
                  selection.away_score,
                  selection.game_status,
                  new Date(selection.commence_time).toLocaleString(),
                  selection.league_key,
                  selection.league_name,
                  selection.sport_key,
                  selection.sport_name,
                  selection.bet_type,
                  selection.total_stake,
                  selection.bet_status,
                  selection.phone_number,
                  selection.country_code,
                  selection.shop_name,
                  selection.shop_code,
            ]);

            return [headers, ...rows];
      }

      /**
       * Format currency for display
       */
      private formatCurrency(amount: number): string {
            return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'SSP',
                  minimumFractionDigits: 2,
            }).format(amount);
      }
}

export default new ExcelExportService();


