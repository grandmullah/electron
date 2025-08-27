#!/bin/bash

# Betzone Electron App - Automated Build Script for New Machines
# This script automatically sets up the environment and builds the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
    echo $OS
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js based on OS
install_nodejs() {
    local os=$1
    
    print_status "Installing Node.js for $os..."
    
    if [[ "$os" == "linux" ]]; then
        # Install Node.js on Linux using NodeSource repository
        if ! command_exists curl; then
            print_status "Installing curl..."
            sudo apt-get update && sudo apt-get install -y curl
        fi
        
        # Install Node.js 18.x LTS
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
        
        # Install build tools
        sudo apt-get install -y build-essential python3
        
    elif [[ "$os" == "macos" ]]; then
        # Install Node.js on macOS using Homebrew
        if ! command_exists brew; then
            print_status "Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        
        # Install Node.js
        brew install node@18
        
        # Add Node.js to PATH
        echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
        source ~/.zshrc
        
    elif [[ "$os" == "windows" ]]; then
        print_error "Windows installation requires manual setup. Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    
    print_success "Node.js installed successfully"
}

# Function to install Yarn
install_yarn() {
    print_status "Installing Yarn..."
    
    if command_exists npm; then
        npm install -g yarn
        print_success "Yarn installed successfully"
    else
        print_error "npm not found. Cannot install Yarn."
        exit 1
    fi
}

# Function to verify installations
verify_installations() {
    print_status "Verifying installations..."
    
    if command_exists node; then
        local node_version=$(node --version)
        print_success "Node.js: $node_version"
    else
        print_error "Node.js not found"
        exit 1
    fi
    
    if command_exists npm; then
        local npm_version=$(npm --version)
        print_success "npm: $npm_version"
    else
        print_error "npm not found"
        exit 1
    fi
    
    if command_exists yarn; then
        local yarn_version=$(yarn --version)
        print_success "Yarn: $yarn_version"
    else
        print_error "Yarn not found"
        exit 1
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    if [[ -f "yarn.lock" ]]; then
        yarn install --frozen-lockfile
    else
        yarn install
    fi
    
    print_success "Dependencies installed successfully"
}

# Function to build the application
build_application() {
    print_status "Building the application..."
    
    # Build the main process
    yarn build
    
    print_success "Application built successfully"
}

# Function to create distributable
create_distributable() {
    print_status "Creating distributable package..."
    
    local os=$(detect_os)
    
    if [[ "$os" == "linux" ]]; then
        yarn eb:dir
        print_success "Linux distributable created in dist-electron-builder/"
    elif [[ "$os" == "macos" ]]; then
        yarn eb:dir
        print_success "macOS distributable created in dist-electron-builder/"
    elif [[ "$os" == "windows" ]]; then
        # Use yarn make for Windows to create proper folder structure
        yarn make
        print_success "Windows distributable created in dist-electron-builder/"
    fi
}

# Function to create and run installer
create_and_run_installer() {
    print_status "Creating installer package..."
    
    local os=$(detect_os)
    
    if [[ "$os" == "linux" ]]; then
        # For Linux, we already created the distributable with yarn make
        print_status "Looking for Linux installer packages..."
        
        # Check dist-electron-builder directory first (Electron Builder)
        local installer=$(find dist-electron-builder/ -name "*.deb" -o -name "*.rpm" | head -1)
        if [[ -n "$installer" ]]; then
            print_status "Installing the application from dist-electron-builder..."
            if [[ "$installer" == *.deb ]]; then
                sudo dpkg -i "$installer"
                print_success "Application installed successfully!"
            elif [[ "$installer" == *.rpm ]]; then
                sudo rpm -i "$installer"
                print_success "Application installed successfully!"
            fi
        else
            # Check out directory (Electron Forge)
            print_status "Checking out directory (Electron Forge)..."
            installer=$(find out/ -name "*.deb" -o -name "*.rpm" | head -1)
            if [[ -n "$installer" ]]; then
                print_status "Installing the application from out directory..."
                if [[ "$installer" == *.deb ]]; then
                    sudo dpkg -i "$installer"
                    print_success "Application installed successfully!"
                elif [[ "$installer" == *.rpm ]]; then
                    sudo rpm -i "$installer"
                    print_success "Application installed successfully!"
                fi
            else
                print_warning "No installer package found. You may need to run 'yarn make' separately."
            fi
        fi
        
    elif [[ "$os" == "macos" ]]; then
        # For macOS, we already created the distributable with yarn make
        print_status "Looking for macOS installer packages..."
        
        # Check dist-electron-builder directory first (Electron Builder)
        local installer=$(find dist-electron-builder/ -name "*.dmg" | head -1)
        if [[ -n "$installer" ]]; then
            print_status "Opening installer from dist-electron-builder..."
            open "$installer"
            print_success "Installer opened! Follow the installation wizard."
        else
            # Check out directory (Electron Forge)
            print_status "Checking out directory (Electron Forge)..."
            installer=$(find out/ -name "*.dmg" | head -1)
            if [[ -n "$installer" ]]; then
                print_status "Opening installer from out directory..."
                open "$installer"
                print_success "Installer opened! Follow the installation wizard."
            else
                print_warning "No installer package found. You may need to run 'yarn make' separately."
            fi
        fi
        
    elif [[ "$os" == "windows" ]]; then
        # For Windows, we already created the distributable with yarn make
        print_status "Looking for Windows installer packages..."
        
        # Check dist-electron-builder directory first (Electron Builder)
        local installer=$(find dist-electron-builder/ -name "*.exe" | head -1)
        if [[ -n "$installer" ]]; then
            print_status "Running installer from dist-electron-builder..."
            "$installer"
            print_success "Installer started! Follow the installation wizard."
        else
            # Check out directory (Electron Forge)
            print_status "Checking out directory (Electron Forge)..."
            installer=$(find out/ -name "*.exe" | head -1)
            if [[ -n "$installer" ]]; then
                print_status "Running installer from out directory..."
                "$installer"
                print_success "Installer started! Follow the installation wizard."
            else
                print_warning "No installer package found. You may need to run 'yarn make' separately."
            fi
        fi
    fi
}

# Function to display next steps
show_next_steps() {
    local os=$(detect_os)
    
    echo ""
    print_success "🎉 Build completed successfully!"
    echo ""
    echo "📁 Your built application is located in: dist-electron-builder/"
    echo ""
    
    if [[ "$os" == "linux" ]]; then
        echo "🚀 To run the application:"
        echo "   ./dist-electron-builder/linux-unpacked/betzone-electron"
        echo ""
        echo "📦 To create an installer:"
        echo "   yarn make"
    elif [[ "$os" == "macos" ]]; then
        echo "🚀 To run the application:"
        echo "   open dist-electron-builder/mac-arm64/Betzone.app"
        echo ""
        echo "📦 To create an installer:"
        echo "   yarn make"
    elif [[ "$os" == "windows" ]]; then
        echo "🚀 To run the application:"
        echo "   dist-electron-builder\\win-unpacked\\Betzone.exe"
        echo ""
        echo "📦 To create an installer:"
        echo "   yarn make"
    fi
    
    echo ""
    echo "🔧 Additional commands:"
    echo "   yarn start          - Build and start the app"
    echo "   yarn dev            - Start in development mode"
    echo "   yarn make           - Create platform-specific installer"
    echo ""
    
    echo ""
    echo "🔒 The terminal will stay open so you can run additional commands."
    echo "   Type 'exit' and press Enter to close when you're done."
    echo ""
}

# Main execution
main() {
    echo "🚀 Betzone Electron App - Automated Build Script"
    echo "=================================================="
    echo ""
    
    # Detect OS
    OS=$(detect_os)
    print_status "Detected OS: $OS"
    
    # Check if Node.js is already installed
    if command_exists node; then
        print_status "Node.js is already installed"
    else
        print_status "Node.js not found. Installing..."
        install_nodejs $OS
    fi
    
    # Check if Yarn is already installed
    if command_exists yarn; then
        print_status "Yarn is already installed"
    else
        print_status "Yarn not found. Installing..."
        install_yarn
    fi
    
    # Verify all installations
    verify_installations
    
    # Install project dependencies
    install_dependencies
    
    # Build the application
    build_application
    
    # Create distributable
    create_distributable
    
    # Automatically create and run installer
    echo ""
    print_status "Creating and running installer automatically..."
    create_and_run_installer
    
    # Show next steps
    show_next_steps
}

# Run main function
main "$@"
