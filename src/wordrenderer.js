const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    editor.addEventListener('input', () => {
        document.execCommand('defaultParagraphSeparator', false, 'p');
    });
});

function execCmd(command, value = null) {
    document.execCommand(command, false, value);
}

ipcRenderer.on('open-file', (event, filePath) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('An error occurred reading the file:', err);
            return;
        }
        document.getElementById('editor').innerHTML = data;
    });
});

ipcRenderer.on('save-file', () => {
    const content = document.getElementById('editor').innerHTML;
    ipcRenderer.invoke('save-dialog').then(filePath => {
        if (filePath) {
            fs.writeFile(filePath, content, (err) => {
                if (err) {
                    console.error('An error occurred saving the file:', err);
                }
            });
        }
    });
});

ipcRenderer.on('export-pdf', async () => {
    const content = document.getElementById('editor').innerHTML;
    ipcRenderer.invoke('export-pdf', content);
});

function insertImage() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const img = document.createElement('img');
        img.src = event.target.result;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.classList.add('resizable');

        const editor = document.getElementById('editor');
        editor.appendChild(img);

        // Make the image resizable
        makeResizable(img);
    };

    reader.readAsDataURL(file);
}

function makeResizable(img) {
    img.addEventListener('mousedown', startResize);

    function startResize(e) {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResize);
    }

    function resize(e) {
        img.style.width = e.clientX - img.getBoundingClientRect().left + 'px';
        img.style.height = e.clientY - img.getBoundingClientRect().top + 'px';
    }

    function stopResize() {
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResize);
    }
}
