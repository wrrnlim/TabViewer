// const { default: WebViewer } = require("@pdftron/webviewer");

const fs = require("fs");

const { dialog } = require("electron").remote;

const viewerElement = document.getElementById('viewer');
const openFileBtn = document.getElementById('open-file');
const openFolderBtn = document.getElementById('open-folder');
const tabKeySel = document.getElementById('key');
const formatSel = document.getElementById('tab-format');
const selectDiv = document.getElementById('song-div');
const selectSel = document.getElementById('song-select');
const saveFileBtn = document.getElementById('save-file');

let filePath;


WebViewer(
  {
    path: '../node_modules/@pdftron/webviewer/public',
  },
  viewerElement
).then((instance) => {
  instance.setTheme('dark');
  instance.disableElements(['downloadButton']);

  const { docViewer, annotManager } = instance;

  openFileBtn.addEventListener('click', () => {
    dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Documents', extensions: ['pdf', 'docx', 'pptx'] },
        { name: 'Images', extensions: ['png', 'jpg', 'jpeg'] },
      ]
    }).then(file => {
      if (!file.canceled) {
        instance.loadDocument(file.filePaths[0]);
      }
    });
  });

  selectSel.addEventListener('change', () => {
    console.log(`opening ${filePath}/${selectSel.value}`);
    instance.loadDocument(`${filePath}/${selectSel.value}`);
  });

  saveFileBtn.addEventListener('click', () => {
    dialog.showSaveDialog({
      title: 'Chooase a directory to save PDF',
      buttonLabel: 'Save',
      filters: [
        { name: 'PDF', extensions: ['pdf'] },
      ]
    }).then(file => {
      if (!file.canceled) {
        console.log(file);
        const doc = docViewer.getDocument();
        annotManager.exportAnnotations().then(xfdfString => {
          doc.getFileData({
            xfdfString
          }).then(data => {
            const arr = new Uint8Array(data);
            fs.writeFile(
              file.filePath,
              arr,
              (err) => {
                if (err) throw err;
                console.log('File saved!');
              }
            )
          });
        });
      }
    });
  });
});

openFolderBtn.addEventListener('click', () => {
  dialog.showOpenDialog({
    properties: ['openDirectory'],
    filters: [
      { name: 'Documents', extensions: ['pdf', 'docx', 'pptx'] },
      { name: 'Images', extensions: ['png', 'jpg', 'jpeg'] },
    ]
  }).then(file => {
    filePath = file.filePaths[0];
    populateSongList();
    selectDiv.classList.remove('hide');
    selectDiv.classList.add('tooltip');
    console.log(file);
  });
});

function populateSongList() {
  const files = fs.readdirSync(filePath);
  selectSel.innerHTML = '<option value="Select song" selected disabled>Select song</option>';
  let songList = {}
  files.forEach(file => {
    file = file.split('.')[0];
    const songName = file.split('-').slice(0,-2).join(' ');
    const chordKey = file.split('-').slice(-2)[0];
    const format = file.split('-').slice(-1)[0];
    if (!(songName in songList)) {
      let chords = {}
      chords[chordKey] = [format];
      songList[songName] = chords;
    }
    else if (!(chordKey in songList[songName])) {
      songList[songName][chordKey] = [format];
    }
    else {
      songList[songName][chordKey].push(format);
    }
    // const option = document.createElement('option');
    // option.innerHTML = file;
    // selectSel.appendChild(option);
  });
  console.log(songList);
}