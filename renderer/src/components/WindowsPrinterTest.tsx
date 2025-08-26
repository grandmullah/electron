import React, { useState, useEffect } from 'react';
import { windowsPrinterService, BetData } from '../services/WindowsPrinterService';

const WindowsPrinterTest: React.FC = () => {
    const [status, setStatus] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        // Initialize service
        addLog('🔌 Windows Printer Test Component loaded');
        updateStatus();
    }, []);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    const updateStatus = () => {
        const currentStatus = windowsPrinterService.getStatus();
        setStatus(currentStatus);
        setIsConnected(currentStatus.connected);
    };

    const handleConnect = async () => {
        try {
            addLog('🔌 Attempting to connect to printer...');
            const connected = await windowsPrinterService.simulateConnection();
            if (connected) {
                addLog('✅ Successfully connected to printer');
                updateStatus();
            } else {
                addLog('❌ Failed to connect to printer');
            }
        } catch (error) {
            addLog(`❌ Connection error: ${error}`);
        }
    };

    const handleDisconnect = () => {
        windowsPrinterService.disconnect();
        addLog('❌ Disconnected from printer');
        updateStatus();
    };

    const handleTestBetReceipt = async () => {
        try {
            const betData: BetData = {
                receiptId: 'BET001',
                customerName: 'John Doe',
                customerPhone: '+1234567890',
                date: new Date().toLocaleString(),
                bets: [
                    {
                        description: 'Manchester United vs Liverpool',
                        selection: 'Home Win',
                        odds: 2.50,
                        stake: 10.00,
                        potentialWin: 25.00
                    },
                    {
                        description: 'Arsenal vs Chelsea',
                        selection: 'Draw',
                        odds: 3.20,
                        stake: 15.00,
                        potentialWin: 48.00
                    }
                ],
                totalStake: 25.00,
                potentialWin: 73.00
            };

            addLog('🎯 Testing bet receipt printing...');
            const result = await windowsPrinterService.printBetReceipt(betData);
            addLog(`✅ Bet receipt printed successfully: ${JSON.stringify(result)}`);
        } catch (error) {
            addLog(`❌ Failed to print bet receipt: ${error}`);
        }
    };

    const handleTestBetSlip = async () => {
        try {
            const betSlip = {
                betId: 'SLIP001',
                bets: [
                    {
                        description: 'Manchester United vs Liverpool',
                        selection: 'Home Win'
                    },
                    {
                        description: 'Arsenal vs Chelsea',
                        selection: 'Draw'
                    }
                ],
                totalStake: 25.00
            };

            addLog('📄 Testing bet slip printing...');
            const result = await windowsPrinterService.printBetSlip(betSlip);
            addLog(`✅ Bet slip printed successfully: ${JSON.stringify(result)}`);
        } catch (error) {
            addLog(`❌ Failed to print bet slip: ${error}`);
        }
    };

    return (
        <div className="windows-printer-test" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>🎯 Windows Printer Service Test</h2>
            
            {/* Status Section */}
            <div style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                border: '1px solid #dee2e6'
            }}>
                <h3>📊 Printer Status</h3>
                {status && (
                    <div>
                        <p><strong>Connected:</strong> {status.connected ? '✅ Yes' : '❌ No'}</p>
                        <p><strong>Connection Type:</strong> {status.connectionType || 'None'}</p>
                        <p><strong>Printer Name:</strong> {status.printerName || 'None'}</p>
                        <p><strong>Bixolon Detected:</strong> {status.bixolonDetected ? '✅ Yes' : '❌ No'}</p>
                    </div>
                )}
            </div>

            {/* Control Buttons */}
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={handleConnect}
                    disabled={isConnected}
                    style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        marginRight: '10px',
                        cursor: isConnected ? 'not-allowed' : 'pointer'
                    }}
                >
                    🔌 Connect
                </button>
                
                <button 
                    onClick={handleDisconnect}
                    disabled={!isConnected}
                    style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        marginRight: '10px',
                        cursor: !isConnected ? 'not-allowed' : 'pointer'
                    }}
                >
                    ❌ Disconnect
                </button>
                
                <button 
                    onClick={handleTestBetReceipt}
                    disabled={!isConnected}
                    style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        marginRight: '10px',
                        cursor: !isConnected ? 'not-allowed' : 'pointer'
                    }}
                >
                    🎯 Test Bet Receipt
                </button>
                
                <button 
                    onClick={handleTestBetSlip}
                    disabled={!isConnected}
                    style={{
                        background: '#6f42c1',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        cursor: !isConnected ? 'not-allowed' : 'pointer'
                    }}
                >
                    📄 Test Bet Slip
                </button>
            </div>

            {/* Logs Section */}
            <div style={{ 
                background: '#000', 
                color: '#00ff00', 
                padding: '15px', 
                borderRadius: '5px',
                fontFamily: 'Courier New, monospace',
                fontSize: '12px',
                maxHeight: '400px',
                overflowY: 'auto'
            }}>
                <h3 style={{ color: '#fff', marginTop: '0' }}>📋 Console Logs</h3>
                {logs.map((log, index) => (
                    <div key={index} style={{ marginBottom: '5px' }}>
                        {log}
                    </div>
                ))}
                {logs.length === 0 && (
                    <div style={{ color: '#666' }}>No logs yet...</div>
                )}
            </div>
        </div>
    );
};

export default WindowsPrinterTest;
