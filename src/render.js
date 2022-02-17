// const { default: WebViewer } = require("@pdftron/webviewer");

const { dialog } = require("electron").remote;

const viewerElement = document.getElementById('viewer');
const openFileBtn = document.getElementById('open');
const saveFileBtn = document.getElementById('save');

WebViewer(
  {
    path: '../node_modules/@pdftron/webviewer/public', // TODO remove public folder
  },
  viewerElement
).then((instance) => {
    instance.setTheme('dark');
    instance.disableElements(['downloadButton']);

    openFileBtn.addEventListener('click', () => {
      const file = dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Documents', extensions: ['pdf','docx','pptx'] },
          { name: 'Images', extensions: ['png','jpg','jpeg'] },
        ]
      });

      if (!file.canceled) {
        instance.loadDocument(file.filePaths[0]);
      }
    });
  });