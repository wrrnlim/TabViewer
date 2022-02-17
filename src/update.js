const { ipcRenderer } = require('electron');

ipcRenderer.on('updater-data', (event, status) => {
    document.getElementById('status_text').innerHTML = status;
});

ipcRenderer.on('version', (event, version) => {
    document.getElementById('version_text').innerHTML = version;
});

ipcRenderer.on('show-buttons', (event) => {
    document.getElementById('restartBtn').hidden = false;
    document.getElementById('laterBtn').hidden = false;
});

document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('status_text').innerHTML = 'Restarting app...please wait';
    document.getElementById('restartBtn').disabled = true;
    document.getElementById('laterBtn').disabled = true;
    ipcRenderer.send('restart-app');
});

document.getElementById('laterBtn').addEventListener('click', () => {
    ipcRenderer.send('close-update-window');
});
