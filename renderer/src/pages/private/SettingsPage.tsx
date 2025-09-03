import React, { useState, useEffect } from "react";
import { Header } from "../../components/Header";

interface SettingsPageProps {
  onNavigate: (
    page: "home" | "dashboard" | "settings" | "games" | "agent" | "history"
  ) => void;
}

interface Settings {
  notifications: boolean;
  autoRefresh: number;
  theme: string;
  defaultStake: number;
  maxBets: number;
  riskLevel: string;
  username: string;
  email: string;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    autoRefresh: 30,
    theme: "dark",
    defaultStake: 10,
    maxBets: 5,
    riskLevel: "medium",
    username: "betzone_user",
    email: "user@betzone.com",
  });

  const [saveStatus, setSaveStatus] = useState<{
    text: string;
    disabled: boolean;
  }>({
    text: "Save Settings",
    disabled: false,
  });

  useEffect(() => {
    // Load saved settings from localStorage or API
    console.log("Loading settings...");
  }, []);

  const handleSettingChange = (key: keyof Settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    // Save settings to localStorage or API
    console.log("Settings saved!", settings);

    setSaveStatus({ text: "Saved! ✓", disabled: true });

    setTimeout(() => {
      setSaveStatus({ text: "Save Settings", disabled: false });
    }, 2000);
  };

  return (
    <div>
      <Header onNavigate={onNavigate} currentPage="settings" />

      <div className="settings-content">
        <div className="settings-header">
          <h1>⚙️ Settings</h1>
        </div>
        <div className="settings-section">
          <h3>General Settings</h3>
          <div className="setting-item">
            <label htmlFor="notifications">Enable Notifications</label>
            <input
              type="checkbox"
              id="notifications"
              checked={settings.notifications}
              onChange={(e) =>
                handleSettingChange("notifications", e.target.checked)
              }
            />
          </div>
          <div className="setting-item">
            <label htmlFor="auto-refresh">Auto Refresh (seconds)</label>
            <input
              type="number"
              id="auto-refresh"
              value={settings.autoRefresh}
              min={5}
              max={300}
              onChange={(e) =>
                handleSettingChange("autoRefresh", parseInt(e.target.value))
              }
            />
          </div>
          <div className="setting-item">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              value={settings.theme}
              onChange={(e) => handleSettingChange("theme", e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3>Betting Preferences</h3>
          <div className="setting-item">
            <label htmlFor="default-stake">Default Stake (SSP)</label>
            <input
              type="number"
              id="default-stake"
              value={settings.defaultStake}
              min={1}
              max={1000}
              onChange={(e) =>
                handleSettingChange("defaultStake", parseInt(e.target.value))
              }
            />
          </div>
          <div className="setting-item">
            <label htmlFor="max-bets">Max Active Bets</label>
            <input
              type="number"
              id="max-bets"
              value={settings.maxBets}
              min={1}
              max={20}
              onChange={(e) =>
                handleSettingChange("maxBets", parseInt(e.target.value))
              }
            />
          </div>
          <div className="setting-item">
            <label htmlFor="risk-level">Risk Level</label>
            <select
              id="risk-level"
              value={settings.riskLevel}
              onChange={(e) => handleSettingChange("riskLevel", e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3>Account</h3>
          <div className="setting-item">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={settings.username}
              readOnly
            />
          </div>
          <div className="setting-item">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={settings.email}
              onChange={(e) => handleSettingChange("email", e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={saveSettings}
            disabled={saveStatus.disabled}
          >
            {saveStatus.text}
          </button>
        </div>
      </div>
    </div>
  );
};
