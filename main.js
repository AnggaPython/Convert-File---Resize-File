const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdf-lib').PDFDocument;
const pptxgen = require('officegen');
const pdf = require('pdf-parse');
const { exec } = require('child_process');

app.disableHardwareAcceleration();

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'assets', '/src/ankara.jpeg')
    });

    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', () => {
    createWindow();

    // Ensure output directory exists
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});

ipcMain.handle('select-file', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile']
    });
    return result.filePaths[0];
});

ipcMain.on('convert-pdf-to-pptx', async (event, filePath) => {
    try {
        event.sender.send('conversion-progress', 0);
        const outputPath = await convertPDFtoPPTX(filePath, (progress) => {
            event.sender.send('conversion-progress', progress);
        });
        event.sender.send('conversion-complete', outputPath);
    } catch (error) {
        event.sender.send('conversion-error', error.message);
    }
});

ipcMain.on('convert-word-to-pdf', async (event, filePath) => {
    try {
        event.sender.send('conversion-progress', 0);
        const outputPath = await convertWordToPDF(filePath, (progress) => {
            event.sender.send('conversion-progress', progress);
        });
        event.sender.send('conversion-complete', outputPath);
    } catch (error) {
        event.sender.send('conversion-error', error.message);
    }
});

ipcMain.on('convert-word-to-pptx', async (event, filePath) => {
    try {
        event.sender.send('conversion-progress', 0);
        const outputPath = await convertWordToPPTX(filePath, (progress) => {
            event.sender.send('conversion-progress', progress);
        });
        event.sender.send('conversion-complete', outputPath);
    } catch (error) {
        event.sender.send('conversion-error', error.message);
    }
});

ipcMain.on('resize-file', async (event, filePath) => {
    try {
        event.sender.send('conversion-progress', 0);
        const outputPath = await resizeFile(filePath, (progress) => {
            event.sender.send('conversion-progress', progress);
        });
        event.sender.send('conversion-complete', outputPath);
    } catch (error) {
        event.sender.send('conversion-error', error.message);
    }
});

async function convertPDFtoPPTX(filePath, onProgress) {
    const outputPath = path.join(__dirname, 'output', 'converted.pptx');
    await simulateConversion(onProgress, outputPath);
    return outputPath;
}

async function convertWordToPDF(filePath, onProgress) {
    const outputPath = path.join(__dirname, 'output', 'converted.pdf');
    await simulateConversion(onProgress, outputPath);
    return outputPath;
}

async function convertWordToPPTX(filePath, onProgress) {
    const outputPath = path.join(__dirname, 'output', 'converted.pptx');
    await simulateConversion(onProgress, outputPath);
    return outputPath;
}

async function resizeFile(filePath, onProgress) {
    const outputPath = path.join(__dirname, 'output', 'resized.file');
    await simulateConversion(onProgress, outputPath);
    return outputPath;
}

async function simulateConversion(onProgress, outputPath) {
    for (let i = 0; i <= 100; i++) {
        await new Promise(r => setTimeout(r, 50));
        onProgress(i);
    }
    fs.writeFileSync(outputPath, Buffer.alloc(1.8 * 1024 * 1024)); // Simulate a 1.8 MB file
}
