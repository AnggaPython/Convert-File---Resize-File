const { ipcRenderer } = require('electron');

document.getElementById('fileInput').addEventListener('change', (event) => {
    const filePath = event.target.files[0].path;
    document.getElementById('filePath').innerText = `File selected: ${filePath}`;
});

document.getElementById('convertBtn').addEventListener('click', async () => {
    const filePath = document.getElementById('fileInput').files[0].path;
    const conversionType = document.querySelector('input[name="conversion"]:checked').value;

    document.getElementById('progressContainer').style.display = 'block';
    document.getElementById('progressBar').value = 0;
    document.getElementById('progressText').innerText = 'Progress: 0%';
    document.getElementById('downloadContainer').style.display = 'none';

    switch (conversionType) {
        case 'pdf-to-pptx':
            ipcRenderer.send('convert-pdf-to-pptx', filePath);
            break;
        case 'word-to-pdf':
            ipcRenderer.send('convert-word-to-pdf', filePath);
            break;
        case 'word-to-pptx':
            ipcRenderer.send('convert-word-to-pptx', filePath);
            break;
        case 'resize':
            ipcRenderer.send('resize-file', filePath);
            break;
        default:
            console.error('No conversion type selected');
    }
});

ipcRenderer.on('conversion-progress', (event, progress) => {
    document.getElementById('progressBar').value = progress;
    document.getElementById('progressText').innerText = `Progress: ${progress}%`;
});

ipcRenderer.on('conversion-complete', (event, outputPath) => {
    document.getElementById('progressText').innerText = 'Conversion complete!';
    document.getElementById('downloadLink').href = outputPath;
    document.getElementById('downloadLink').innerText = 'Download now';
    document.getElementById('downloadContainer').style.display = 'block';
    setTimeout(() => {
        document.getElementById('progressContainer').style.display = 'none';
    }, 3000);
});

ipcRenderer.on('conversion-error', (event, errorMessage) => {
    document.getElementById('progressText').innerText = `Error: ${errorMessage}`;
    setTimeout(() => {
        document.getElementById('progressContainer').style.display = 'none';
    }, 5000);
});
