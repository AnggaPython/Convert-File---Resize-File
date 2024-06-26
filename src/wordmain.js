const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'wordrenderer.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('word.html');

    const menu = Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open',
                    click() {
                        dialog.showOpenDialog({
                            properties: ['openFile'],
                            filters: [
                                { name: 'Text Files', extensions: ['txt', 'md', 'docx'] }
                            ]
                        }).then(result => {
                            if (!result.canceled) {
                                const filePath = result.filePaths[0];
                                mainWindow.webContents.send('open-file', filePath);
                            }
                        }).catch(err => {
                            console.error(err);
                        });
                    }
                },
                {
                    label: 'Save',
                    click() {
                        mainWindow.webContents.send('save-file');
                    }
                },
                {
                    label: 'Export as PDF',
                    click() {
                        mainWindow.webContents.send('export-pdf');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    role: 'quit'
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' }
            ]
        }
    ]);

    Menu.setApplicationMenu(menu);

    ipcMain.handle('print-to-pdf', async (event, options) => {
        try {
            const pdfData = await mainWindow.webContents.printToPDF(options);
            return pdfData;
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            throw error;
        }
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
