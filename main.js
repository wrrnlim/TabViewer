/**
 * Electron related code
 */
const electron = require('electron');
const { dialog } = require('electron');
const { app, BrowserWindow, ipcMain, shell, Menu } = electron; // ES6 destructuring -> equivalent to app = electron.app etc
const { autoUpdater } = require("electron-updater");


let mainWindow, data, updateWindow;
const version = `v${app.getVersion()}`;
console.log(`Starting ${version}`);

/* Menus */
const menuTemplate = [ // TODO change menu items
  {
    label: 'File',
    submenu: [
      {
        label: 'Exit',
        accelerator: 'CmdOrCtrl+Q',
        role: 'quit'
      }
    ],
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        role: 'reload'

      },
      { type: 'separator' },
      {
        label: 'Actual Size',
        accelerator: 'CmdOrCtrl+0',
        role: 'resetZoom'
      },
      {
        label: 'Zoom In',
        accelerator: 'CmdOrCtrl+=',
        role: 'zoomIn'
      },
      {
        label: 'Zoom Out',
        accelerator: 'CmdOrCtrl+-',
        role: 'zoomOut'
      },
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
    ]
  }, {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click: () => {
          shell.openExternal('https://github.com/wrrnlim/TabViewer')
        }
      },
      {
        label: 'Report an Issue',
        click: () => {
          shell.openExternal('https://github.com/wrrnlim/TabViewer/issues/new/choose')
        }
      },
      {
        label: 'Open Developer Tools',
        accelerator: 'CmdOrCtrl+Shift+I',
        role: 'toggleDevTools'
      },
      { type: 'separator' },
      {
        label: 'TabViewer Version: ' + version,
        enabled: false
      },
      {
        label: 'Check for Updates',
        click: () => {
          createUpdateWindow();
          autoUpdater.checkForUpdatesAndNotify();
        }
      },
    ]
  }
]

/**
 * Create main window - Event based programming syntax 
 */
app.on('ready', () => {
  mainWindow = new BrowserWindow({
    title: 'TabViewer',
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    show: false,
    icon: './assets/icons/icon.ico'
  });
  mainWindow.maximize();
  mainWindow.show();

  /* Open links in external browser */
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  /* Load index.html */
  mainWindow.loadFile('src/index.html');

  /* Menus */
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});

/**
 * Create the update window
 */
function createUpdateWindow() {
  if (!updateWindow) { // Prevent update window from being created multiple times
    updateWindow = new BrowserWindow({
      width: 400,
      height: 250,
      title: 'Updater',
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
      icon: './assets/icons/icon.ico'
    });
    updateWindow.loadFile('src/update.html');
    /* Wait for contents to load then set status */
    updateWindow.webContents.on('did-finish-load', () => {
      updateWindow.webContents.send('version', version);
    });
  }
  else {
    updateWindow.focus();
  }
  updateWindow.on('closed', () => { // set updateWindow to null so it can be created again
    updateWindow = null;
  });
}

/**
 * Show status on update window
 */
function showStatus(status) {
  updateWindow.webContents.send('updater-data', status);
}

/**
 * Auto updater
 */
autoUpdater.on('checking-for-update', () => {
  showStatus('Checking for updates...');
})
autoUpdater.on('update-available', (info) => {
  showStatus('Update found! Download will begin shortly.');
})
autoUpdater.on('update-not-available', (info) => {
  showStatus('You have the newest version!');
})
autoUpdater.on('error', (err) => {
  showStatus('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  showStatus('Downloading: ' + progressObj.percent.toFixed(2) + '%');
})
autoUpdater.on('update-downloaded', (info) => {
  updateWindow.webContents.send('show-buttons');
  showStatus('Update downloaded. Restart app to apply update.');
});

/**
 * IPC Listeners
 */
ipcMain.on('restart-app', () => {
  autoUpdater.quitAndInstall(isSilent = true, isForceRunAfter = true);
});

ipcMain.on('close-update-window', () => {
  updateWindow.close();
});

ipcMain.handle('getUserDataPath', async () => {
  return app.getPath('userData');
});

ipcMain.handle('show-file-dialog', async (options) => {
  dialog.showOpenDialog(options).then(result => {
    if (!result.canceled) {
      return result.filePaths[0];
    }
  });
});
