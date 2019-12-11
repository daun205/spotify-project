const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const { fork } = require('child_process')

// const ps = null;
const ps = fork(`${__dirname}/server.js`)
let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({ width: 800, height: 600 })

  mainWindow.loadURL('http://localhost:3000');

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      if (ps != null) {
        ps.kill()
      }
      app.quit()
    }
})