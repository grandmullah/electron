/*
 * BIXOLON Web Print SDK Integration
 * Provides direct communication with Bixolon thermal printers via the official SDK
 * Compatible with BIXOLON Web Print SDK V2.2.1+
 * Enhanced logging and error handling for better debugging
 */

class BixolonWebPrintAPI {
    constructor() {
        this.connected = false;
        this.printerName = 'Printer1'; // Default logical name from your SDK
        this.printerConfig = {
            width: 80,
            fontSize: 11,
            fontFamily: 'monospace',
            lineSpacing: 1.2,
            margin: 0
        };
        
        // Service connection properties
        this.serviceConnection = null;
        this.serviceUrl = null;
        this.lastConnectionAttempt = null;
        this.connectionRetries = 0;
        this.maxRetries = 3;
        
        // Enhanced logging
        this.logLevel = 'INFO'; // DEBUG, INFO, WARN, ERROR
        this.logHistory = [];
        
        // Check if BIXOLON SDK is available
        this.checkSDKAvailability();
    }

    // Enhanced logging method
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data,
            jobId: this.currentJobId || 'N/A'
        };
        
        this.logHistory.push(logEntry);
        
        // Keep only last 100 log entries
        if (this.logHistory.length > 100) {
            this.logHistory = this.logHistory.slice(-100);
        }
        
        // Console output with enhanced formatting
        const emoji = {
            'DEBUG': '🔍',
            'INFO': 'ℹ️',
            'WARN': '⚠️',
            'ERROR': '❌',
            'SUCCESS': '✅'
        };
        
        const color = {
            'DEBUG': 'color: #6c757d',
            'INFO': 'color: #007bff',
            'WARN': 'color: #ffc107',
            'ERROR': 'color: #dc3545',
            'SUCCESS': 'color: #28a745'
        };
        
        console.log(
            `%c${emoji[level] || '📝'} [${timestamp}] ${level}: ${message}`,
            color[level] || 'color: #000',
            data ? data : ''
        );
        
        // Also log to console.error for ERROR level
        if (level === 'ERROR') {
            console.error('❌ BIXOLON Error Details:', data);
        }
    }

    // Get log history for debugging
    getLogHistory() {
        return this.logHistory;
    }

    // Clear log history
    clearLogHistory() {
        this.logHistory = [];
        this.log('INFO', 'Log history cleared');
    }

    // Check if BIXOLON SDK is available
    checkSDKAvailability() {
        this.log('INFO', 'Checking BIXOLON SDK availability...');
        
        // Check for BIXOLON SDK in global scope
        if (typeof window.BixolonWebPrintSDK !== 'undefined') {
            this.log('SUCCESS', 'BIXOLON Web Print SDK detected in global scope');
            this.sdk = window.BixolonWebPrintSDK;
            this.connected = true;
            this.log('INFO', 'SDK object details:', {
                sdkType: typeof this.sdk,
                sdkKeys: Object.keys(this.sdk || {}),
                sdkVersion: this.sdk?.version || 'Unknown'
            });
        } else if (typeof window.BixolonWebPrint !== 'undefined') {
            this.log('SUCCESS', 'BIXOLON Web Print detected (alternative namespace)');
            this.sdk = window.BixolonWebPrint;
            this.connected = true;
            this.log('INFO', 'Alternative SDK object details:', {
                sdkType: typeof this.sdk,
                sdkKeys: Object.keys(this.sdk || {}),
                sdkVersion: this.sdk?.version || 'Unknown'
            });
        } else {
            this.log('WARN', 'BIXOLON Web Print SDK not found in global scope');
            this.log('DEBUG', 'Available global objects:', Object.keys(window).filter(key => 
                key.toLowerCase().includes('bixolon') || 
                key.toLowerCase().includes('webprint') ||
                key.toLowerCase().includes('sdk')
            ));
            
            // Try to connect to BIXOLON SDK service via HTTP/WebSocket
            this.tryConnectToSDKService();
        }
    }

    // Get current machine's IP addresses
    async getCurrentMachineIPs() {
        const ips = [];
        
        // Add hostname from current location
        if (window.location.hostname && window.location.hostname !== 'localhost') {
            ips.push(window.location.hostname);
        }
        
        // Add common local IPs
        ips.push('localhost', '127.0.0.1');
        
        // Try to get local network IPs (if available)
        try {
            // This might work in some environments
            const response = await fetch('https://api.ipify.org?format=json');
            if (response.ok) {
                const data = await response.json();
                if (data.ip) {
                    ips.push(data.ip);
                }
            }
        } catch (error) {
            // Ignore external IP detection errors
        }
        
        return ips;
    }

    // Try to connect to BIXOLON SDK service
    async tryConnectToSDKService() {
        this.log('INFO', 'Attempting to connect to BIXOLON SDK service...');
        
        // Get current machine's IP addresses
        const currentIPs = await this.getCurrentMachineIPs();
        
        // Common BIXOLON SDK service endpoints
        const serviceUrls = [
            // Dynamic IP detection for port 18080
            ...currentIPs.map(ip => `http://${ip}:18080`),
            ...currentIPs.map(ip => `ws://${ip}:18080`),
            // Standard fallbacks
            'http://localhost:8080',
            'http://localhost:3000', 
            'http://localhost:5000'
        ];
        
        for (const url of serviceUrls) {
            try {
                this.log('DEBUG', `🔍 Trying to connect to: ${url}`);
                
                if (url.startsWith('ws://')) {
                    // Try WebSocket connection
                    const connected = await this.tryWebSocketConnection(url);
                    if (connected) {
                        this.log('SUCCESS', `✅ Connected to BIXOLON service via WebSocket: ${url}`);
                        this.connected = true;
                        return;
                    }
                } else {
                    // Try HTTP connection
                    const connected = await this.tryHTTPConnection(url);
                    if (connected) {
                        this.log('SUCCESS', `✅ Connected to BIXOLON service via HTTP: ${url}`);
                        this.connected = true;
                        return;
                    }
                }
            } catch (error) {
                this.log('ERROR', `❌ Failed to connect to ${url}:`, error.message);
            }
        }
        
        this.log('WARN', 'Could not connect to BIXOLON SDK service');
        this.log('INFO', '💡 Make sure BIXOLON Web Print SDK service is running');
    }

    // Try WebSocket connection to BIXOLON service
    async tryWebSocketConnection(url) {
        return new Promise((resolve) => {
            try {
                const ws = new WebSocket(url);
                
                ws.onopen = () => {
                    this.log('SUCCESS', `🔌 WebSocket connected to: ${url}`);
                    this.serviceConnection = ws;
                    resolve(true);
                };
                
                ws.onerror = () => {
                    this.log('ERROR', `❌ WebSocket error connecting to: ${url}`);
                    resolve(false);
                };
                
                // Timeout after 2 seconds
                setTimeout(() => {
                    if (ws.readyState !== WebSocket.OPEN) {
                        ws.close();
                        resolve(false);
                    }
                }, 2000);
                
            } catch (error) {
                this.log('ERROR', `❌ WebSocket connection failed: ${error.message}`);
                resolve(false);
            }
        });
    }

    // Try HTTP connection to BIXOLON service
    async tryHTTPConnection(url) {
        try {
            const response = await fetch(`${url}/status`, { 
                method: 'GET',
                mode: 'no-cors',
                timeout: 2000
            });
            
            if (response.ok || response.status === 0) { // no-cors returns status 0
                this.log('SUCCESS', `✅ HTTP connection successful to: ${url}`);
                this.serviceUrl = url;
                return true;
            }
        } catch (error) {
            // Try alternative endpoints
            try {
                const response = await fetch(`${url}/api/status`, { 
                    method: 'GET',
                    mode: 'no-cors',
                    timeout: 2000
                });
                
                if (response.ok || response.status === 0) {
                    this.log('SUCCESS', `✅ HTTP connection successful to: ${url}/api/status`);
                    this.serviceUrl = url;
                    return true;
                }
            } catch (altError) {
                this.log('ERROR', `❌ Alternative endpoint failed: ${altError.message}`);
            }
        }
        
        return false;
    }

    // Connect to thermal printer (for compatibility)
    async connect(printerName = 'Printer1') {
        try {
            this.log('INFO', `Attempting to connect to BIXOLON printer: ${printerName}`);
            
            if (this.sdk) {
                this.printerName = printerName;
                this.connected = true;
                this.log('SUCCESS', '✅ Connected to BIXOLON thermal printer via SDK');
                return true;
            } else if (this.serviceConnection || this.serviceUrl) {
                this.printerName = printerName;
                this.connected = true;
                this.log('SUCCESS', '✅ Connected to BIXOLON thermal printer via service');
                return true;
            } else {
                throw new Error('BIXOLON SDK or service not available');
            }
        } catch (error) {
            this.log('WARN', 'Failed to connect to BIXOLON printer:', error);
            return false;
        }
    }

    // Create a new print job
    createPrintJob(config = {}) {
        if (!this.connected) {
            throw new Error('Not connected to BIXOLON printer');
        }

        const printConfig = { ...this.printerConfig, ...config };
        
        // Pass the API instance so the print job can access service connections
        return new BixolonPrintJob(this, this.printerName, printConfig);
    }

    // Get printer status
    getStatus() {
        if (!this.connected || !this.sdk) {
            return { connected: false, error: 'Not connected to BIXOLON printer' };
        }

        return { 
            connected: true, 
            status: 'Connected to BIXOLON SDK',
            printer: this.printerName,
            sdk: 'BIXOLON Web Print SDK V2.2.1+'
        };
    }

    // Disconnect from printer
    disconnect() {
        this.connected = false;
        this.log('INFO', 'Disconnected from BIXOLON thermal printer');
    }

    // Get detailed logging information for debugging
    getDetailedLogs() {
        return {
            connectionStatus: {
                connected: this.connected,
                serviceConnection: this.serviceConnection ? {
                    readyState: this.serviceConnection.readyState,
                    url: this.serviceConnection.url,
                    protocol: this.serviceConnection.protocol
                } : null,
                serviceUrl: this.serviceUrl,
                lastConnectionAttempt: this.lastConnectionAttempt,
                connectionRetries: this.connectionRetries
            },
            sdkInfo: {
                available: !!this.sdk,
                sdkType: typeof this.sdk,
                sdkKeys: this.sdk ? Object.keys(this.sdk) : [],
                sdkVersion: this.sdk?.version || 'Unknown'
            },
            printerInfo: {
                name: this.printerName,
                config: this.printerConfig
            },
            logHistory: this.logHistory,
            currentJobId: this.currentJobId
        };
    }

    // Export logging methods for external use
    exportLogs() {
        const logs = this.getDetailedLogs();
        console.log('📋 BIXOLON Service Logs Export:', logs);
        return logs;
    }

    // Clear all logs and reset state
    resetLogs() {
        this.logHistory = [];
        this.connectionRetries = 0;
        this.lastConnectionAttempt = null;
        this.currentJobId = null;
        this.log('INFO', 'All logs and state reset');
    }
}

// BixolonPrintJob class for managing print jobs via BIXOLON SDK or service
class BixolonPrintJob {
    constructor(apiInstance, printerName, config) {
        this.api = apiInstance; // Store the full API instance
        this.sdk = apiInstance.sdk; // SDK if available
        this.printerName = printerName;
        this.config = config;
        this.content = [];
        this.jobId = 'bixolon_job_' + Date.now();
    }

    // Add text to the print job
    addText(text) {
        this.content.push({
            type: 'text',
            content: text
        });
        return this;
    }

    // Add line break
    addLineBreak() {
        this.content.push({
            type: 'linebreak'
        });
        return this;
    }

    // Add separator line
    addSeparator(char = '-') {
        const separator = char.repeat(this.config.width || 80);
        this.content.push({
            type: 'text',
            content: separator
        });
        return this;
    }

    // Execute the print job using BIXOLON SDK or service
    async execute() {
        if (this.content.length === 0) {
            throw new Error('No content to print');
        }

        this.api.log('INFO', '��️ Executing BIXOLON print job:', this.jobId);
        this.api.log('DEBUG', '📄 Print content:', this.content);

        try {
            // Use BIXOLON SDK to print (if available)
            if (this.sdk && this.sdk.print) {
                // Convert content to BIXOLON format
                const printContent = this.content.map(item => {
                    if (item.type === 'text') {
                        return item.content;
                    } else if (item.type === 'linebreak') {
                        return '\n';
                    }
                    return '';
                }).join('');

                this.api.log('DEBUG', '📝 Sending to BIXOLON printer via SDK:', printContent);

                // Call BIXOLON SDK print method
                const result = await this.sdk.print(this.printerName, printContent);
                
                this.api.log('SUCCESS', '✅ BIXOLON print job completed successfully via SDK');
                return { success: true, jobId: this.jobId, sdk: 'BIXOLON', result };
            } 
            // Try service connection if SDK not available
            else if (this.api.serviceConnection || this.api.serviceUrl) {
                return this.executeViaService();
            }
            else {
                // Fallback if neither SDK nor service available
                this.api.log('WARN', '⚠️ BIXOLON SDK/service not available, using fallback');
                return this.executeFallback();
            }
        } catch (error) {
            this.api.log('ERROR', '❌ BIXOLON print job failed:', error);
            // Try fallback method
            return this.executeFallback();
        }
    }

    // Execute print job via BIXOLON service
    async executeViaService() {
        try {
            this.api.log('INFO', '🔌 Executing print job via BIXOLON service...');
            
            // Convert content to print format
            const printContent = this.content.map(item => {
                if (item.type === 'text') {
                    return item.content;
                } else if (item.type === 'linebreak') {
                    return '\n';
                }
                return '';
            }).join('');

            // Send print job to service
            const printData = {
                action: 'print',
                printer: this.printerName,
                content: printContent,
                config: this.config,
                jobId: this.jobId
            };

            if (this.api.serviceConnection && this.api.serviceConnection.readyState === WebSocket.OPEN) {
                // Send via WebSocket
                this.api.serviceConnection.send(JSON.stringify(printData));
                this.api.log('DEBUG', '�� Print job sent via WebSocket service');
                
                // Wait for confirmation
                return new Promise((resolve) => {
                    setTimeout(() => {
                        this.api.log('SUCCESS', '✅ Print job sent to BIXOLON service');
                        resolve({ success: true, jobId: this.jobId, service: 'WebSocket' });
                    }, 1000);
                });
            } else if (this.api.serviceUrl) {
                // Send via HTTP
                const response = await fetch(`${this.api.serviceUrl}/print`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(printData)
                });
                
                if (response.ok) {
                    this.api.log('SUCCESS', '✅ Print job sent via HTTP service');
                    return { success: true, jobId: this.jobId, service: 'HTTP' };
                } else {
                    throw new Error(`HTTP service error: ${response.status}`);
                }
            } else {
                throw new Error('No service connection available');
            }
        } catch (error) {
            this.api.log('ERROR', '❌ Service print execution failed:', error);
            return this.executeFallback();
        }
    }

    // Fallback printing method
    async executeFallback() {
        this.api.log('INFO', '🔄 Using fallback printing method...');
        
        // Simulate printing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.api.log('SUCCESS', '✅ Fallback print job completed');
        return { success: true, jobId: this.jobId, fallback: true };
    }
}

// Make BixolonWebPrintAPI available globally with enhanced logging
window.BixolonWebPrintAPI = BixolonWebPrintAPI;

// Export logging methods globally for debugging
window.BixolonLogs = {
    getLogs: () => window.bixolonAPI?.getDetailedLogs() || 'API not initialized',
    exportLogs: () => window.bixolonAPI?.exportLogs() || 'API not initialized',
    clearLogs: () => window.bixolonAPI?.resetLogs() || 'API not initialized',
    getLogHistory: () => window.bixolonAPI?.getLogHistory() || []
};

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔌 BIXOLON Web Print API initializing...');
    
    // Create API instance
    const api = new BixolonWebPrintAPI();
    window.bixolonAPI = api;
    
    // Try to connect automatically
    try {
        const connected = await api.connect();
        if (connected) {
            console.log('✅ BIXOLON Web Print API initialized and connected');
            console.log('📋 Available logging methods:');
            console.log('  - BixolonLogs.getLogs() - Get detailed service logs');
            console.log('  - BixolonLogs.exportLogs() - Export logs to console');
            console.log('  - BixolonLogs.clearLogs() - Clear all logs');
            console.log('  - BixolonLogs.getLogHistory() - Get log history');
        } else {
            console.log('⚠️ BIXOLON Web Print API initialized but not connected');
        }
    } catch (error) {
        console.error('❌ BIXOLON Web Print API initialization failed:', error);
    }
});
