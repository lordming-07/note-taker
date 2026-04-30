const { app, BrowserWindow, ipcMain, dialog, menu} = require('electron');
const path = require('node:path');
const fs = require('node:fs');

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {

    createWindow();
     const template =[
        {
            label:'File',
            submenu:[
                {
                    label:'New Note',
                    accelerator: 'CmdOrCtrl+N',
                    click:() => {
                        BrowserWindow.getFocusedWindow().webContents.send('menu-new-note');
                    }
                },
                {
                    label:'open File',
                    accelerator: 'CmdOrCtrl+O',
                    click:() => {
                      BrowserWindow.getFocusedWindow().webContents.send('menu-open-file');
                    }
                },
                 {
                    label:'Save',
                    accelerator: 'CmdOrCtrl+S',
                    click:() => {
                        BrowserWindow.getFocusedWindow().webContents.send('menu-save');
                    }
                },
                 {
                    label:'Save As',
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click:() => {
                        BrowserWindow.getFocusedWindow().webContents.send('menu-save-as');
                    }
                },
                 { type:'separator'},
                 {
                    label:'Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click:() => app.quit()
                }
              
            ]
        }
    ];

    ipcMain.handle('smart-save', async (event, text, filepath) => {
        const targetPath = filepath || path.join(app.getPath('documents'), 'quicknote.txt');
        fs.writeFileSync(targetPath, text,'utf-8');
        return { success: true ,filePath: targetPath};
    });

    ipcMain.handle('load-note', async () => {
        const filePath = path.join(app.getPath('documents'), 'quicknote.txt');
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf-8');
        }
        return '';
    });

    ipcMain.handle('save-as', async (event, text) => {
        const result = await dialog.showSaveDialog({
            defaultPath: 'mynote.txt'
        });

        if (result.canceled) return { success: false };

        fs.writeFileSync(result.filePath, text);
        return { success: true, filepath: result.filePath };
    });

    ipcMain.handle('new-note', async () => {
        const result = await dialog.showMessageBox({
            type: 'warning',
            buttons: ['Discard', 'Cancel'],
            message: 'Unsaved changes. Continue?'
        });

        return { confirmed: result.response === 0 };
    });
    ipcMain.handle('open-file', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Text Files', extensions: ['txt'] }]
        }); 
        if (result.canceled)
             return { success: false };
        const filePath = result.filePaths[0];
        const content = fs.readFileSync(filePath, 'utf-8');
        return { success: true, content };
    });
   
});