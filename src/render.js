// const { default: WebViewer } = require("@pdftron/webviewer");

const fs = require("fs");

const { dialog } = require("electron").remote;

const viewerElement = document.getElementById('viewer');
const openFileBtn = document.getElementById('open-file');
const openFolderBtn = document.getElementById('open-folder');
const tabKeyDiv = document.getElementById('key-div');
const chordKeySel = document.getElementById('key');
const formatDiv = document.getElementById('format-div');
const formatSel = document.getElementById('tab-format');
const songDiv = document.getElementById('song-div');
const songSel = document.getElementById('song-select');
const divider = document.getElementById('divider');
const saveFileBtn = document.getElementById('save-file');
const saveDiv = document.getElementById('save-div');

let filePath, songList;


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

  songSel.addEventListener('change', () => {
    populateFormatList();
    populateKeyList();
    instance.loadDocument(`${filePath}/${songSel.value}`);
  });

  chordKeySel.addEventListener('change', () => {
    loadSong();
  });

  formatSel.addEventListener('change', () => {
    populateKeyList();
    loadSong();
  });

  function loadSong() {
    selectedSong = songSel.options[songSel.selectedIndex].text
    instance.loadDocument(`${filePath}/${songList[selectedSong][formatSel.value][chordKeySel.value]}`);
  }

  saveFileBtn.addEventListener('click', () => {
    dialog.showSaveDialog({
      title: 'Chooase a directory to save PDF',
      buttonLabel: 'Save',
      filters: [
        { name: 'PDF', extensions: ['pdf'] },
      ]
    }).then(file => {
      if (!file.canceled) {
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
    if(!file.canceled) {
      filePath = file.filePaths[0];
      indexFiles();
      populateSongList();
      // Make buttons/selects visible
      tabKeyDiv.classList.remove('hide');
      tabKeyDiv.classList.add('tooltip');
      formatDiv.classList.remove('hide');
      formatDiv.classList.add('tooltip');
      songDiv.classList.remove('hide');
      songDiv.classList.add('tooltip');
      divider.classList.remove('hide');
      divider.classList.add('tooltip');
      saveDiv.classList.remove('hide');
      saveDiv.classList.add('tooltip');
    }
  });
});

function indexFiles() {
  songList = {};
  const files = fs.readdirSync(filePath);
  files.forEach(file => {
    let filename = file.split('.')
    if (filename.length > 1) { // continue if file not a folder
      filename = filename[0];
      if (filename.split('-').length >= 3) { // continue if file has correct naming
        const songName = toTitleCase(filename.split('-').slice(0,-2).join(' '));
        const chordKey = filename.split('-').slice(-2)[0];
        const format = filename.split('-').slice(-1)[0];
        if (!(songName in songList)) {
          let songFiles = {};
          songFiles[chordKey] = file;
          let formats = {};
          formats[format] = songFiles;
          songList[songName] = formats;
        }
        else if (!(format in songList[songName])) {
            let songFiles = {};
            songFiles[chordKey] = file;
            songList[songName][format] = songFiles;
        }
        else if (!(chordKey in songList[songName][format])) {
            songList[songName][format][chordKey] = file;
        }
        else {
          songList[songName][format][chordKey] = file;
        }
      }
    }
  });
  return songList;
}

function populateSongList() {
  songSel.innerHTML = '<option value="Select song" selected disabled>Select song</option>';
  Object.keys(songList).forEach(song => {
    keysList = Object.keys(songList[song]);
    sheetsList = Object.keys(songList[song][keysList[0]]);
    // Song selection
    const option = document.createElement('option');
    option.innerHTML = song;
    option.value = songList[song][keysList[0]][sheetsList[0]];
    songSel.appendChild(option);
  });
}

async function populateFormatList() {
  formatSel.innerHTML = '<option value="Select format" selected disabled>Select format</option>';
  const selectedSong = songSel.options[songSel.selectedIndex].text;
  const toWords = {
    cs: 'Chord sheet',
    ls: 'Lead sheet',
  }
  Object.keys(songList[selectedSong]).forEach((format, i) => { // get selected song and iterate through the formats
    const option = document.createElement('option');
    option.innerHTML = toWords[format];
    option.value = format;
    formatSel.appendChild(option);
    if (i === 0) option.selected = true;
  });
}

async function populateKeyList() {
  chordKeySel.innerHTML = '<option value="Select key" selected disabled>Select key</option>';
  const selectedSong = songSel.options[songSel.selectedIndex].text;
  const selectedFormat = formatSel.value;
  console.log('Selected Format', selectedFormat);
  Object.keys(songList[selectedSong][selectedFormat]).forEach((key, i) => { // get selected song text and iterate through the chord keys for the selected format
    const option = document.createElement('option');
    option.innerHTML = key;
    option.value = key;
    chordKeySel.appendChild(option);
    if (i === 0) option.selected = true;
  });
}

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}