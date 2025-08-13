import React, { useState, useEffect } from 'react';
import { Header } from '../../components/Header';

interface DashboardPageProps {
  onNavigate: (page: 'home' | 'dashboard' | 'settings' | 'games') => void;
}

interface DashboardData {
  activeBets: number;
  totalWinnings: string;
  winRate: string;
  nextMatch: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [dashboardData] = useState<DashboardData>({
    activeBets: 12,
    totalWinnings: '$2,450',
    winRate: '68%',
    nextMatch: '2h 15m'
  });

  useEffect(() => {
    // Simulate loading dashboard data
    const timer = setTimeout(() => {
      console.log('Dashboard data loaded');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="dashboard-page">
      <Header 
        onNavigate={onNavigate} 
        currentPage="dashboard" 
      />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>📊 Dashboard</h1>
        </div>
      
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Active Bets</h3>
            <div className="stat-number">{dashboardData.activeBets}</div>
            <p>Currently active</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Total Winnings</h3>
            <div className="stat-number">{dashboardData.totalWinnings}</div>
            <p>This month</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Win Rate</h3>
            <div className="stat-number">{dashboardData.winRate}</div>
            <p>Last 30 days</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Next Match</h3>
            <div className="stat-number">{dashboardData.nextMatch}</div>
            <p>Until kickoff</p>
          </div>
        </div>
        
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">✅</span>
              <span className="activity-text">Won $150 on Manchester United vs Liverpool</span>
              <span className="activity-time">2 hours ago</span>
            </div>
            <div className="activity-item">
              <span className="activity-icon">📝</span>
              <span className="activity-text">Placed bet on Real Madrid vs Barcelona</span>
              <span className="activity-time">4 hours ago</span>
            </div>
            <div className="activity-item">
              <span className="activity-icon">❌</span>
              <span className="activity-text">Lost $75 on Arsenal vs Chelsea</span>
              <span className="activity-time">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 