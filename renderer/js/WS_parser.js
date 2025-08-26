/*
 * WS_parser.js - WebSocket parser for bGate Web Print API
 * Handles WebSocket communication with thermal printers
 */

class WS_Parser {
    constructor() {
        this.connected = false;
        this.socket = null;
        this.messageQueue = [];
    }

    connect(url) {
        return new Promise((resolve, reject) => {
            try {
                this.socket = new WebSocket(url);
                
                this.socket.onopen = () => {
                    this.connected = true;
                    console.log('WebSocket connected to thermal printer');
                    resolve();
                };
                
                this.socket.onmessage = (event) => {
                    this.handleMessage(event.data);
                };
                
                this.socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };
                
                this.socket.onclose = () => {
                    this.connected = false;
                    console.log('WebSocket disconnected from thermal printer');
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            console.log('Received message from printer:', message);
            
            // Handle different message types
            switch (message.type) {
                case 'status':
                    this.handleStatus(message);
                    break;
                case 'error':
                    this.handleError(message);
                    break;
                case 'print_complete':
                    this.handlePrintComplete(message);
                    break;
                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Failed to parse message:', error);
        }
    }

    handleStatus(message) {
        // Handle printer status updates
        console.log('Printer status:', message.status);
    }

    handleError(message) {
        // Handle printer errors
        console.error('Printer error:', message.error);
    }

    handlePrintComplete(message) {
        // Handle print job completion
        console.log('Print job completed:', message.jobId);
    }

    sendMessage(message) {
        if (this.connected && this.socket) {
            this.socket.send(JSON.stringify(message));
        } else {
            this.messageQueue.push(message);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
}

// Make WS_Parser available globally
window.WS_Parser = WS_Parser;
