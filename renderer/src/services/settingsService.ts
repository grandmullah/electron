/*
  Settings Service - Manages application settings including printer configuration
  Following the pattern from the working 1nl-client-master version
*/

interface AppSettings {
      notifications: boolean;
      autoRefresh: number;
      theme: string;
      defaultStake: number;
      maxBets: number;
      riskLevel: string;
      username: string;
      email: string;
      printerLogicalName: string;
}

const DEFAULT_SETTINGS: AppSettings = {
      notifications: true,
      autoRefresh: 30,
      theme: "dark",
      defaultStake: 10,
      maxBets: 5,
      riskLevel: "medium",
      username: "betzone_user",
      email: "user@betzone.com",
      printerLogicalName: "Printer1", // Default printer name
};

const SETTINGS_KEY = 'betzone_app_settings';

class SettingsService {
      private settings: AppSettings;

      constructor() {
            this.settings = this.loadSettings();
      }

      private loadSettings(): AppSettings {
            try {
                  const saved = localStorage.getItem(SETTINGS_KEY);
                  if (saved) {
                        const parsed = JSON.parse(saved);
                        // Merge with defaults to ensure all properties exist
                        return { ...DEFAULT_SETTINGS, ...parsed };
                  }
            } catch (error) {
                  console.error('Failed to load settings:', error);
            }
            return { ...DEFAULT_SETTINGS };
      }

      private saveSettings(): void {
            try {
                  localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
            } catch (error) {
                  console.error('Failed to save settings:', error);
            }
      }

      getSettings(): AppSettings {
            return { ...this.settings };
      }

      updateSettings(updates: Partial<AppSettings>): void {
            this.settings = { ...this.settings, ...updates };
            this.saveSettings();
      }

      getPrinterLogicalName(): string {
            return this.settings.printerLogicalName;
      }

      setPrinterLogicalName(name: string): void {
            this.updateSettings({ printerLogicalName: name });
      }

      // Get specific setting
      getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
            return this.settings[key];
      }

      // Set specific setting
      setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
            this.updateSettings({ [key]: value } as Partial<AppSettings>);
      }

      // Reset to defaults
      resetToDefaults(): void {
            this.settings = { ...DEFAULT_SETTINGS };
            this.saveSettings();
      }
}

// Export singleton instance
export const settingsService = new SettingsService();
export default settingsService;
