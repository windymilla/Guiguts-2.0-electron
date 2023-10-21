const {
  BrowserWindow,
  app,
  ipcMain,
  dialog,
  Menu,
  globalShortcut,
  top,
} = require('electron');
const path = require('path');
const fs = require("fs");


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

app.whenReady().then(() => {
  globalShortcut.register('CommandOrControl+O', () => {
    ipcMain.emit("open-document-triggered");
  })
  globalShortcut.register('CommandOrControl+S', () => {
    ipcMain.emit("save-document-triggered");
  })
  globalShortcut.register('Shift+CommandOrControl+S', () => {
    ipcMain.emit("saveas-document-triggered");
  })
  globalShortcut.register('CommandOrControl+L', () => {
    ipcMain.emit("load-image-triggered");
  })
  globalShortcut.register('CommandOrControl+T', () => {
    ipcMain.emit("test-dialog-triggered");
  })
  globalShortcut.register('Shift+CommandOrControl+T', () => {
    ipcMain.emit("test-dialog2-triggered");
  })
});

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      titleBarStyle: "hiddenInset",
      // devTools: false,
    },
  });

  // Create the menus
  const isMac = process.platform === 'darwin';
  const template = [
    // { role: 'appMenu' }
    ...(isMac
      ? [{
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        }]
      : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        {
          label: 'Open...',
          accelerator: 'CommandOrControl+O',
          click: async () => ipcMain.emit("open-document-triggered"),
        },
        {
          label: 'Save',
          accelerator: 'CommandOrControl+S',
          click: async () => ipcMain.emit("save-document-triggered"),
        },
        {
          label: 'Save As...',
          accelerator: 'Shift+CommandOrControl+S',
          click: async () => ipcMain.emit("saveas-document-triggered"),
        },
        { type: 'separator' },
        {
          label: 'Load Image',
          accelerator: 'CommandOrControl+L',
          click: async () => ipcMain.emit("load-image-triggered"),
        },
        {
          label: 'Test Dialog...',
          accelerator: 'CommandOrControl+T',
          click: async () => ipcMain.emit("test-dialog-triggered"),
        },
        {
          label: 'Test Dialog 2...',
          accelerator: 'Shift+CommandOrControl+T',
          click: async () => ipcMain.emit("test-dialog2-triggered"),
        },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' },
              { role: 'delete' },
              { role: 'selectAll' },
              { type: 'separator' },
              {
                label: 'Speech',
                submenu: [
                  { role: 'startSpeaking' },
                  { role: 'stopSpeaking' }
                ]
              }
            ]
          : [
              { role: 'delete' },
              { type: 'separator' },
              { role: 'selectAll' }
            ])
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              { role: 'window' }
            ]
          : []
          )
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Help',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://www.pgdp.net/wiki/PPTools/Guiguts/Guiguts_Manual')
          }
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

let openedFilePath;

ipcMain.on("open-document-triggered", () => {
  dialog
    .showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Text files", extensions: ["txt"] }, {name: "HTML files", extensions: ["htm", "html"]}],
    })
    .then(({ filePaths }) => {
      const filePath = filePaths[0].replace(/\\/g,'/');
      openFile(filePath);
    });
});

const openFile = (filePath) => {
  fs.readFile(filePath, "utf8", (error, content) => {
    if (error) {
      console.log(error);
    } else {
      openedFilePath = filePath;      
      mainWindow.webContents.send("document-opened", { filePath, content });
      mainWindow.setTitle("Guiguts-2.0 - " + filePath);
    }
  });
};

ipcMain.on("save-document-triggered", () => {
  if (openedFilePath) {
    mainWindow.webContents.send("document-saveas", openedFilePath);
  } else {
    ipcMain.emit("saveas-document-triggered");
  }
});

ipcMain.on("saveas-document-triggered", () => {
  dialog.showSaveDialog(mainWindow, {
    filters: [{ name: "Text files", extensions: ["txt"] }, {name: "HTML files", extensions: ["htm", "html"]}], 
    defaultPath: openedFilePath,
  })
    .then(({ filePath }) => {
        mainWindow.webContents.send("document-saveas", filePath);
      });
});

ipcMain.on("saveas-document", (_, {filePath, content}) => {
  saveFile(filePath, content)
});


const saveFile = (filePath, content) => {
  fs.writeFile(filePath, content, (error) => {
    if (error) {
      console.log(error);
    } else {
      openedFilePath = filePath;
      mainWindow.setTitle("Guiguts-2.0 - " + filePath);
    }
  });
};

ipcMain.on("load-image-triggered", () => {
  mainWindow.webContents.send("load-image");
});

ipcMain.on("test-dialog-triggered", () => {
  mainWindow.webContents.send("open-testdialog");
});

ipcMain.on("test-dialog2-triggered", () => {
  const child = new BrowserWindow({ 
    parent: top, 
    width:350,
    height:110,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      devTools: false,
    },

  })
  child.loadFile('src/testdialog2.html')
  child.removeMenu();
  child.show()
});


