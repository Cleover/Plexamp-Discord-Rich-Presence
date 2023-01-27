const { app, BrowserWindow, Menu, nativeImage, Tray } = require('electron')
const path = require('path');

try {
  require('electron-reloader')(module)
} catch (_) {}


let tray = null
function createTray () {
  const icon = path.join(__dirname, '/logo.png') // required.
  const trayicon = nativeImage.createFromPath(icon)
  tray = new Tray(trayicon.resize({ width: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        createWindow()
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.quit() // actually quit the app.
      }
    },
  ])

  tray.setContextMenu(contextMenu)
}


let mainWindow

function createWindow () {
  if (!tray) { // if tray hasn't been created already.
    createTray()
  }

  mainWindow = new BrowserWindow({
    width: 400,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    skipTaskbar: true,
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  app.dock.hide()
})