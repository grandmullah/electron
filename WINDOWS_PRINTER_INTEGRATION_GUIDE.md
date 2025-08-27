# Windows Printer Connector Integration Guide

## Overview
This guide explains how to use the new Windows Printer Connector for Bixolon thermal printers on Windows machines. The connector provides multiple connection methods and automatically selects the best available option.

## 🚀 Quick Start

### 1. Dependencies
The following packages are required (already installed):
```bash
yarn add escpos node-printer usb
```

### 2. Files
- `renderer/js/windows-printer-connector.js` - Main connector library
- `renderer/test-windows-printer.html` - Test interface
- `WINDOWS_PRINTER_INTEGRATION_GUIDE.md` - This guide

## 🔌 Connection Methods

### Method 1: node-thermal-printer (Recommended)
- **Best for**: ESC/POS commands via USB interface
- **Pros**: Stable, well-maintained, good ESC/POS support
- **Cons**: Limited to ESC/POS commands
- **Use case**: Standard thermal printing needs

### Method 2: escpos
- **Best for**: Direct USB ESC/POS communication
- **Pros**: Direct USB access, good ESC/POS support
- **Cons**: Requires USB device detection
- **Use case**: When you need direct USB control

### Method 3: node-printer
- **Best for**: Windows native printer API
- **Pros**: Uses Windows printer system, reliable
- **Cons**: Windows-only, requires printer drivers
- **Use case**: When you want to use Windows printer management

### Method 4: USB Library
- **Best for**: Low-level USB communication
- **Pros**: Maximum control, works with any USB device
- **Cons**: Complex, requires manual endpoint management
- **Use case**: Advanced users who need custom USB handling

## 📱 Usage in Your App

### Basic Integration
```javascript
// Import the connector
import { WindowsPrinterConnector } from './js/windows-printer-connector.js';

// Create connector instance
const printerConnector = new WindowsPrinterConnector();

// Auto-connect to printer
const connected = await printerConnector.autoConnect('Printer1');

if (connected) {
    console.log('Connected to printer!');
    
    // Create and execute print job
    const printJob = printerConnector.createPrintJob({
        width: 80,
        fontSize: 14
    });
    
    printJob.addText('Hello World!');
    printJob.addLineBreak();
    printJob.addSeparator('=');
    
    const result = await printJob.execute();
    console.log('Print job completed:', result);
}
```

### Manual Connection
```javascript
// Try specific connection method
try {
    // Try thermal printer first
    const connected = await printerConnector.connectWithThermalPrinter('BIXOLON SRP-350III');
    if (connected) {
        console.log('Connected via thermal printer');
    }
} catch (error) {
    console.log('Thermal connection failed, trying escpos...');
    
    try {
        const connected = await printerConnector.connectWithEscpos();
        if (connected) {
            console.log('Connected via escpos');
        }
    } catch (escposError) {
        console.log('All connection methods failed');
    }
}
```

### Print Job Management
```javascript
// Create print job with custom config
const printJob = printerConnector.createPrintJob({
    width: 80,
    fontSize: 14,
    fontFamily: 'monospace',
    lineSpacing: 1.2,
    margin: 0
});

// Add content
printJob.addText('BETZONE RECEIPT');
printJob.addLineBreak();
printJob.addSeparator('=');
printJob.addText('Date: ' + new Date().toLocaleString());
printJob.addLineBreak();
printJob.addText('Receipt #: ABC123');
printJob.addLineBreak();
printJob.addSeparator('=');

// Execute print job
const result = await printJob.execute();
```

## 🧪 Testing

### 1. Open Test Interface
Navigate to `renderer/test-windows-printer.html` in your Electron app to test all connection methods.

### 2. Test Individual Methods
- Click "Test Connection" for each method to verify connectivity
- Use "Auto-Connect" to let the system choose the best method
- Test printing with sample text and receipts

### 3. Monitor Console
The test interface includes a real-time console that shows:
- Connection attempts and results
- Print job execution status
- Error messages and debugging info

## 🔧 Configuration

### Printer Settings
```javascript
const printerConfig = {
    width: 80,           // Print width in characters
    fontSize: 14,        // Font size
    fontFamily: 'monospace', // Font family
    lineSpacing: 1.2,   // Line spacing multiplier
    margin: 0            // Left margin
};
```

### Connection Preferences
The connector automatically tries methods in this order:
1. `node-thermal-printer` (most reliable)
2. `escpos` (direct USB)
3. `node-printer` (Windows native)
4. `usb` (low-level)

## 🐛 Troubleshooting

### Common Issues

#### 1. "require not available in renderer"
**Problem**: Node.js modules not accessible in renderer process
**Solution**: Ensure your Electron app has `nodeIntegration: true` or use preload scripts

#### 2. "No USB printers found"
**Problem**: USB device not detected
**Solution**: 
- Check USB connection
- Verify printer drivers are installed
- Try different USB ports
- Check Device Manager for printer status

#### 3. "Printer not responding"
**Problem**: Connection established but printer not responding
**Solution**:
- Check printer power and paper
- Verify printer is not in error state
- Try restarting the printer
- Check printer queue for stuck jobs

#### 4. "Permission denied"
**Problem**: Insufficient permissions for USB access
**Solution**:
- Run as Administrator (Windows)
- Check USB device permissions
- Verify printer sharing settings

### Debug Mode
Enable detailed logging:
```javascript
// Set debug level
console.log('🔍 Debug mode enabled');

// Check available libraries
const libraries = await printerConnector.detectAvailableLibraries();
console.log('Available libraries:', libraries);

// Get printer status
const status = printerConnector.getStatus();
console.log('Printer status:', status);
```

## 🔄 Integration with Existing Code

### Replace Bixolon Web Print API
```javascript
// Old code
const bixolonAPI = new BixolonWebPrintAPI();
await bixolonAPI.connect('Printer1');

// New code
const printerConnector = new WindowsPrinterConnector();
await printerConnector.autoConnect('Printer1');
```

### Update Print Jobs
```javascript
// Old code
const printJob = bixolonAPI.createPrintJob();
printJob.addText('Hello');

// New code
const printJob = printerConnector.createPrintJob();
printJob.addText('Hello');
```

## 📋 Windows Build Requirements

### Prerequisites
1. **Node.js**: Version 16+ recommended
2. **Python**: Required for native module compilation
3. **Visual Studio Build Tools**: For Windows native modules
4. **USB Drivers**: Bixolon printer drivers installed

### Build Commands
```bash
# Install dependencies
yarn install

# Build for Windows
yarn build:windows

# Create Windows installer
yarn make:win:installer

# Create portable Windows app
yarn make:win:portable
```

### Native Module Rebuild
If you encounter native module issues:
```bash
# Rebuild native modules for Electron
yarn electron-rebuild

# Or manually rebuild specific modules
cd node_modules/escpos && yarn rebuild
cd ../node-printer && yarn rebuild
cd ../usb && yarn rebuild
```

## 🚀 Performance Optimization

### Connection Pooling
```javascript
// Reuse connector instance
class PrinterService {
    constructor() {
        this.connector = new WindowsPrinterConnector();
        this.connected = false;
    }
    
    async ensureConnection() {
        if (!this.connected) {
            this.connected = await this.connector.autoConnect();
        }
        return this.connected;
    }
    
    async print(content) {
        await this.ensureConnection();
        const printJob = this.connector.createPrintJob();
        // ... add content
        return await printJob.execute();
    }
}
```

### Error Handling
```javascript
class RobustPrinterConnector extends WindowsPrinterConnector {
    async robustConnect(maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const connected = await this.autoConnect();
                if (connected) return true;
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            } catch (error) {
                console.log(`Connection attempt ${i + 1} failed:`, error.message);
            }
        }
        return false;
    }
}
```

## 📚 API Reference

### WindowsPrinterConnector Class

#### Methods
- `detectAvailableLibraries()` - Detect available printer libraries
- `getAvailablePrinters()` - Get list of available Windows printers
- `connectWithThermalPrinter(name)` - Connect using node-thermal-printer
- `connectWithEscpos(name)` - Connect using escpos library
- `connectWithNodePrinter(name)` - Connect using node-printer
- `connectWithUSB()` - Connect using USB library
- `autoConnect(name)` - Auto-connect using best available method
- `createPrintJob(config)` - Create new print job
- `getStatus()` - Get connection status
- `disconnect()` - Disconnect from printer

#### Properties
- `connected` - Connection status
- `connectionType` - Type of active connection
- `printerName` - Name of connected printer
- `printerConfig` - Printer configuration

### WindowsPrintJob Class

#### Methods
- `addText(text)` - Add text to print job
- `addLineBreak()` - Add line break
- `addSeparator(char)` - Add separator line
- `execute()` - Execute print job

#### Properties
- `content` - Array of print content items
- `jobId` - Unique job identifier
- `config` - Print job configuration

## 🔒 Security Considerations

### USB Device Access
- USB library requires elevated permissions on some systems
- Consider using Windows printer API for better security
- Implement proper error handling for permission issues

### Input Validation
```javascript
// Validate print content
function validatePrintContent(content) {
    if (typeof content !== 'string') {
        throw new Error('Content must be a string');
    }
    
    if (content.length > 10000) {
        throw new Error('Content too long');
    }
    
    // Sanitize content if needed
    return content.replace(/[^\x20-\x7E\n\r\t]/g, '');
}
```

## 📞 Support

### Getting Help
1. Check the console logs for detailed error messages
2. Verify all dependencies are properly installed
3. Test with the provided test interface
4. Check Windows Device Manager for printer status

### Common Solutions
- **USB not working**: Try different USB ports, check drivers
- **Permission issues**: Run as Administrator
- **Module not found**: Run `yarn install` and rebuild
- **Printer not responding**: Check printer status and restart if needed

## 🎯 Next Steps

1. **Test the connector** with your Bixolon printer
2. **Integrate into your app** using the provided examples
3. **Customize print layouts** for your specific needs
4. **Add error handling** and retry logic
5. **Implement print job queuing** if needed

---

**Note**: This connector is designed to work specifically on Windows machines with USB-connected Bixolon thermal printers. For other platforms or printer types, additional modifications may be required.
