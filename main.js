const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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

    ipcMain.handle('save-note', async (event, text) => {
        const filePath = path.join(app.getPath('documents'), 'quicknote.txt');
        fs.writeFileSync(filePath, text);
        return { success: true };
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