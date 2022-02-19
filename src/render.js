// const { default: WebViewer } = require("@pdftron/webviewer");

const fs = require("fs");

const { dialog } = require("electron").remote;

const viewerElement = document.getElementById('viewer');
const openFileBtn = document.getElementById('open-file');
const openFolderBtn = document.getElementById('open-folder');
const tabKeyDiv = document.getElementById('key-div');
const tabKeySel = document.getElementById('key');
const formatDiv = document.getElementById('format-div');
const formatSel = document.getElementById('tab-format');
const songDiv = document.getElementById('song-div');
const songSel = document.getElementById('song-select');
const divider = document.getElementById('divider');
const saveFileBtn = document.getElementById('save-file');
const saveDiv = document.getElementById('save-div');

let filePath, songList = {};


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
    populateKeyList();
    populateFormatList();
    instance.loadDocument(`${filePath}/${songSel.value}`);
  });

  tabKeySel.addEventListener('change', () => {
    populateFormatList();
    loadSong();
  });

  formatSel.addEventListener('change', () => {
    loadSong();
  });

  function loadSong() {
    selectedSong = songSel.options[songSel.selectedIndex].text
    instance.loadDocument(`${filePath}/${songList[selectedSong][tabKeySel.value][formatSel.value]}`);
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
      console.log(songList);
    }
  });
});

function indexFiles() {
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
          let songFile = {};
          songFile[format] = file;
          let chords = {};
          chords[chordKey] = songFile;
          songList[songName] = chords;
        }
        else if (!(chordKey in songList[songName])) {
          songList[songName][chordKey] = {[format]: file};
        }
        else if (!(format in songList[songName][chordKey])) {
          songList[songName][chordKey][format] = file;
        }
        else {
          songList[songName][chordKey].push(format);
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

async function populateKeyList() {
  tabKeySel.innerHTML = '<option value="Select key" selected disabled>Select key</option>';
  const selectedSong = songSel.options[songSel.selectedIndex].text;
  Object.keys(songList[selectedSong]).forEach((key, i) => { // get selected song text and iterate through the chord keys
    const option = document.createElement('option');
    option.innerHTML = key;
    option.value = key;
    tabKeySel.appendChild(option);
    if (i === 0) option.selected = true;
  });
}

async function populateFormatList() {
  formatSel.innerHTML = '<option value="Select format" selected disabled>Select format</option>';
  const selectedSong = songSel.options[songSel.selectedIndex].text;
  const selectedKey = tabKeySel.value;
  console.log(selectedKey);
  Object.keys(songList[selectedSong][selectedKey]).forEach((format, i) => { // get selected key and iterate through the formats
    const toWords = {
      cs: 'Chord sheet',
      ls: 'Lead sheet',
    }
    const option = document.createElement('option');
    option.innerHTML = toWords[format];
    option.value = format;
    formatSel.appendChild(option);
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