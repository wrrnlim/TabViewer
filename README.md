# TabViewer

![Pre-release](https://img.shields.io/badge/status-pre--release-orange)
![Electron version](https://img.shields.io/badge/electron-v13.5.1-blue)
[![GitHub Release Date](https://img.shields.io/github/release-date/wrrnlim/electron-app-template)](https://github.com/wrrnlim/TabViewer/releases)
![Platform](https://img.shields.io/badge/platform-win--32%20%7C%20win—64-lightgrey)
![Preview](./assets/img/preview.png)
*Song sheet partly removed for copyright reasons*

Easily view and annotate your music tabs all in one place. TabViewer enables you to view music sheets and switch between songs, music keys, and lead sheet/chord sheet formats within a folder. Annotate your music with handwriting, text, or highlights, and export it as a PDF.

## Installation

To install, go to the [releases](https://github.com/wrrnlim/TabViewer/releases/) page and download the setup `.exe` for the latest release. Your browser and/or operating system may detect the installer as malicious and prompt you to not download/run this file. You may need to manually approve the download and allow the setup to run. Each release will have a VirusTotal check and a checksum to verify that the download does not contain any viruses.

## Usage

Currently, songs files must have the following naming convention:

```text
song-name-A-cs.pdf
```

where `A` is the key that the song is in, and `cs` is `cs` or `ls` for chord sheet and lead sheet respectively. Place all your song sheets into a folder, then open the folder in TabViewer. If you have a song in multiple keys and correctly followed the naming convention, you can change the key using the dropdown menus. The same applies for songs with both chord sheet and lead sheet files.

In future updates, I plan to add an upload section to the app, so users can upload files and have files automatically renamed.

## Roadmap

The following are planned features for future updates to TabViewer. Feel free to contribute to this project by putting in a pull request!

- Implement automatic renaming of files ([Issue #2](https://github.com/wrrnlim/TabViewer/issues/2))

## Resources

The PDF webviewer used in this project is created by [PDFTron](https://github.com/PDFTron/webviewer-electron-sample/) ([tutorial](https://youtu.be/FyZ40lNE-pY))
