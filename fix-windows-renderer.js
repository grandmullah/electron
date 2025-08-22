/**
 * Windows Renderer Fix Script
 * This script fixes common renderer loading issues on Windows
 */

const fs = require('fs');
const path = require('path');

// Helper function to copy folders recursively
function copyFolderSync(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }
    
    const files = fs.readdirSync(source);
    files.forEach(file => {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);
        
        if (fs.lstatSync(sourcePath).isDirectory()) {
            copyFolderSync(sourcePath, targetPath);
        } else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    });
}

// Function to fix HTML paths for Windows compatibility
function fixWindowsPaths() {
    const htmlPath = path.join(__dirname, 'dist', 'renderer', 'index.html');
    
    if (fs.existsSync(htmlPath)) {
        let html = fs.readFileSync(htmlPath, 'utf8');
        
        // Ensure paths don't have ./ prefix and use forward slashes
        html = html.replace(/href="\.\/styles\//g, 'href="styles/');
        html = html.replace(/src="\.\/src\//g, 'src="src/');
        // Also handle backslashes that might appear on Windows
        html = html.replace(/href="styles\\/g, 'href="styles/');
        html = html.replace(/src="src\\/g, 'src="src/');
        
        fs.writeFileSync(htmlPath, html);
        console.log('✅ Fixed HTML paths for Windows compatibility');
    } else {
        console.error('❌ HTML file not found at:', htmlPath);
    }
    
    // Ensure styles and resources are copied
    const stylesSource = path.join(__dirname, 'renderer', 'styles');
    const stylesDest = path.join(__dirname, 'dist', 'renderer', 'styles');
    const resourcesSource = path.join(__dirname, 'resources');
    const resourcesDest = path.join(__dirname, 'dist', 'resources');
    
    // Copy styles if not already there
    if (fs.existsSync(stylesSource) && !fs.existsSync(stylesDest)) {
        fs.mkdirSync(stylesDest, { recursive: true });
        copyFolderSync(stylesSource, stylesDest);
        console.log('✅ Copied styles folder');
    }
    
    // Copy resources if not already there  
    if (fs.existsSync(resourcesSource) && !fs.existsSync(resourcesDest)) {
        fs.mkdirSync(resourcesDest, { recursive: true });
        copyFolderSync(resourcesSource, resourcesDest);
        console.log('✅ Copied resources folder');
    }
}

// Run the fix
fixWindowsPaths();