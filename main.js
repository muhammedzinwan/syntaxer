const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config();

let mainWindow;
let tray;

// Create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 560,
    height: 50, // Even smaller height to match the image
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    show: false,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  
  // Listen for content size changes and adjust window height
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.on('did-resize', () => {
      adjustWindowHeight();
    });
  });

  mainWindow.loadFile('index.html');
  mainWindow.setVisibleOnAllWorkspaces(true);
  
  // Give the user a chance to interact before hiding on blur
  // This helps prevent the window from disappearing too quickly
  let blurTimeout;
  mainWindow.on('blur', () => {
    // Only hide if the window has been out of focus for 2 seconds
    // This prevents accidental hiding when clicking on UI elements
    blurTimeout = setTimeout(() => {
      mainWindow.webContents.send('clear-contents');
      mainWindow.hide();
    }, 2000);
  });
  
  // Cancel the blur timeout if the window gets focus back
  mainWindow.on('focus', () => {
    if (blurTimeout) {
      clearTimeout(blurTimeout);
      blurTimeout = null;
    }
  });
  
  // Center window on screen
  positionWindowCenter();
}

// Adjust window height based on content
function adjustWindowHeight() {
  if (!mainWindow) return;
  
  mainWindow.webContents.executeJavaScript(`
    // Get full content height including all wrapped text
    document.body.scrollHeight
  `).then(height => {
    const [width] = mainWindow.getSize();
    if (height > 0) {
      // Add a larger buffer to ensure all content is visible
      // This is especially important for multiline content
      mainWindow.setSize(width, height + 30);
      
      // Log height adjustment for debugging
      console.log(`Adjusting window height to: ${height + 30}px`);
    }
  }).catch(err => {
    console.error('Error adjusting window size:', err);
  });
}

// Position the window in the center of the screen
function positionWindowCenter() {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  const windowBounds = mainWindow.getBounds();
  const x = Math.floor(width/2 - windowBounds.width/2);
  const y = Math.floor(height/2 - windowBounds.height/2);
  
  mainWindow.setPosition(x, y);
}

// Toggle window visibility
function toggleWindow() {
  if (mainWindow.isVisible()) {
    console.log('..Hiding window');
    mainWindow.webContents.send('clear-contents');
    mainWindow.hide();
  } else {
    console.log('..Showing window');
    // Reset to initial small height when showing
    mainWindow.setSize(560, 50);
    mainWindow.show();
    mainWindow.focus();
  }
}

// Setup system tray icon and context menu
function setupTray() {
  // Create a default icon as a 16x16 transparent pixel
  const { nativeImage } = require('electron');
  const defaultIcon = nativeImage.createFromBuffer(Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0xF3, 0xFF,
    0x61, 0x00, 0x00, 0x00, 0x01, 0x73, 0x52, 0x47, 0x42, 0x00, 0xAE, 0xCE, 0x1C, 0xE9, 0x00, 0x00,
    0x00, 0x04, 0x67, 0x41, 0x4D, 0x41, 0x00, 0x00, 0xB1, 0x8F, 0x0B, 0xFC, 0x61, 0x05, 0x00, 0x00,
    0x00, 0x09, 0x70, 0x48, 0x59, 0x73, 0x00, 0x00, 0x0E, 0xC3, 0x00, 0x00, 0x0E, 0xC3, 0x01, 0xC7,
    0x6F, 0xA8, 0x64, 0x00, 0x00, 0x00, 0x18, 0x49, 0x44, 0x41, 0x54, 0x38, 0x4F, 0x63, 0x60, 0x18,
    0x05, 0x83, 0x00, 0x30, 0x31, 0x30, 0x30, 0x30, 0x8C, 0x32, 0x60, 0x14, 0x0C, 0x42, 0x00, 0x00,
    0x05, 0x27, 0x00, 0x01, 0xFC, 0xB2, 0x73, 0x4D, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
  ]));
  
  // Try to create the system tray with a fallback for missing icon
  try {
    tray = new Tray(path.join(__dirname, 'icon.png'));
  } catch (err) {
    console.log('Using default icon for system tray');
    tray = new Tray(defaultIcon);
  }
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => toggleWindow() },
    { label: 'Quit', click: () => app.quit() }
  ]);
  
  tray.setToolTip('Syntaxer');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => toggleWindow());
}

// App initialization
app.whenReady().then(() => {
  console.log('\n================================');
  console.log(' Syntaxer is now running');
  console.log('================================\n');
  
  // Check for .env file and create if not exists
  const fs = require('fs');
  const envFile = path.join(__dirname, '.env');
  if (!fs.existsSync(envFile)) {
    console.log('Creating .env file with API key placeholders...');
    const envContent = 
      '# API Keys for LLM Services\n' +
      'GROQ_API_KEY=your_groq_api_key_here\n' +
      'GEMINI_API_KEY=your_gemini_api_key_here\n';
    
    try {
      fs.writeFileSync(envFile, envContent);
      console.log('Created .env file. Please update with your actual API keys.');
    } catch (err) {
      console.warn('Could not create .env file:', err);
    }
  }
  
  // Check for fonts directory and font files
  const fontsDir = path.join(__dirname, 'fonts');
  if (!fs.existsSync(fontsDir)) {
    try {
      fs.mkdirSync(fontsDir);
      console.log('Created fonts directory. Please add JetBrains Mono font files.');
    } catch (err) {
      console.warn('Could not create fonts directory:', err);
    }
  } else {
    // Check if font files exist
    const requiredFonts = ['JetBrainsMono-Regular.ttf', 'JetBrainsMono-Bold.ttf'];
    const missingFonts = requiredFonts.filter(font => !fs.existsSync(path.join(fontsDir, font)));
    
    if (missingFonts.length > 0) {
      console.warn(`Missing font files: ${missingFonts.join(', ')}`);
      console.warn('Application will use fallback fonts. See fonts/README.md for setup instructions.');
    } else {
      console.log('Font files found. Using JetBrains Mono.');
    }
  }
  
  createWindow();
  setupTray();
  
  // Register global shortcut (Alt+Space)
  globalShortcut.register('Alt+Space', () => {
    console.log('->Shortcut triggered: Alt+Space');
    toggleWindow();
  });
  
  console.log('->Global shortcut registered: Alt+Space');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('search-command', async (event, query) => {
  const { searchCommand } = require('./llm');
  try {
    const result = await searchCommand(query);
    
    // Schedule a window resize after results are displayed
    setTimeout(() => adjustWindowHeight(), 300);
    
    return result;
  } catch (error) {
    console.error('Error searching command:', error);
    // Also adjust height for error cases
    setTimeout(() => adjustWindowHeight(), 300);
    return { error: 'Failed to fetch command. Please try again.' };
  }
});

ipcMain.on('close-app', () => {
  mainWindow.webContents.send('clear-contents');
  mainWindow.hide();
});
