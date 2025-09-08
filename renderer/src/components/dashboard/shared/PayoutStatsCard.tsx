import React from "react";
import { PayoutStatistics } from "../../../services/payoutStatsService";

interface PayoutStatsCardProps {
  stats: PayoutStatistics;
}

export const PayoutStatsCard: React.FC<PayoutStatsCardProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => `SSP ${amount.toFixed(2)}`;
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="payout-stats-card">
      <div className="stats-header">
        <h3>📊 Payout Statistics</h3>
        <p>Overview of payout performance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-label">Total Payouts</span>
            <span className="stat-value">{stats.totalPayouts}</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <span className="stat-label">Pending</span>
            <span className="stat-value pending">{stats.pendingPayouts}</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-label">Completed</span>
            <span className="stat-value success">{stats.completedPayouts}</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <span className="stat-label">Cancelled</span>
            <span className="stat-value cancelled">
              {stats.cancelledPayouts}
            </span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <span className="stat-label">Failed</span>
            <span className="stat-value failed">{stats.failedPayouts}</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <span className="stat-label">Total Amount</span>
            <span className="stat-value amount">
              {formatCurrency(stats.totalAmount)}
            </span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-label">Average Amount</span>
            <span className="stat-value amount">
              {formatCurrency(stats.averageAmount)}
            </span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">🕐</div>
          <div className="stat-content">
            <span className="stat-label">First Payout</span>
            <span className="stat-value date">
              {formatDate(stats.firstPayout)}
            </span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">🕐</div>
          <div className="stat-content">
            <span className="stat-label">Last Payout</span>
            <span className="stat-value date">
              {formatDate(stats.lastPayout)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
