import React from "react";

interface DashboardTabsProps {
  activeTab: "user" | "shop" | "payout" | "bets";
  onTabChange: (tab: "user" | "shop" | "payout" | "bets") => void;
  payoutCount?: number;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  activeTab,
  onTabChange,
  payoutCount = 0,
}) => {
  const tabs = [
    { id: "user" as const, label: "User", icon: "👤" },
    { id: "shop" as const, label: "Shop", icon: "🏪" },
    { id: "payout" as const, label: "Payout", icon: "💰", badge: payoutCount },
    { id: "bets" as const, label: "Bets", icon: "🎯" },
  ];

  return (
    <div className="dashboard-tabs">
      <div className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <span className="tab-badge">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
