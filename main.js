const electron = require('electron')

const { app, BrowserWindow } = require('electron')

function createWindow () {
  // Erstelle das Browser-Fenster.
  win = new BrowserWindow({ width: 800, height: 600 })

  // und Laden der index.html der App.
  win.loadFile('index.html')
}

app.on('ready', createWindow)