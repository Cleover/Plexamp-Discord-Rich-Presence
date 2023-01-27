const {
  app,
  Menu,
  nativeImage,
  Tray,
  Notification
} = require('electron')

const path = require('path');

const express = require('express')
const multer = require('multer')

const directory = "./tmp/"
const fs = require('fs')

const upload = multer({
  dest: directory
})

const port = 9000;

var webhook = express();

// Clear /tmp folder every 30 mins
setInterval(function () {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(directory + file, err => {
        if (err) throw err;
      });
    }
  });
}, 1800000);

const client = new(require("easy-presence").EasyPresence)("499374732655984651");

const API = require('last.fm.api'),
  api = new API({
    apiKey: '6d6bf952135ec7a0ceee6fc67ef03768',
    apiSecret: '16904428e4a4de577339c4655b5a98fe'
  });

try {
  require('electron-reloader')(module)
} catch (_) {}

let server;

let tray = null

function createTray() {
  const icon = path.join(__dirname, '/logo.png') // required.
  const trayicon = nativeImage.createFromPath(icon)
  tray = new Tray(trayicon.resize({
    width: 16
  }))

  const contextMenu = Menu.buildFromTemplate([{
      label: 'Start Server',
      click: () => {
        createWindow()
        startServer();
      }
    },
    {
      label: 'Stop Server',
      click: () => {
        createWindow()
        stopServer();
      }
    },
    {
      label: 'Quit Application',
      click: () => {
        app.quit() // actually quit the app.
      }
    },
  ])

  tray.setContextMenu(contextMenu)
}

function createWindow() {
  if (!tray) createTray()
  app.dock.hide();
}

function startServer() {
  try {
    server = webhook.listen(port || 9000, () => {
      new Notification({
        title: "Server Started!",
        body: `Node.js server started on port ${port || 9000}.`
      }).show()
    })
  } catch {
    new Notification({
      title: "Server Failed to Start!",
      body: `Node.js server failed to started on port ${port || 9000}.`
    }).show()
  }
}

function stopServer() {
  try {
    server.close(function () {
      new Notification({
        title: "Server Stopped!",
        body: `Node.js server stopped on port ${port}.`
      }).show()
    });
  } catch {
    new Notification({
      title: "Server failed to Stop!",
      body: `Node.js server failed to stop on port ${port}.`
    }).show()
  }
}

webhook.post('/', upload.single('thumb'), async function (req, res, next) {

  var payload = JSON.parse(req.body.payload);

  console.log(`Received webhook for: ${payload.event}`)

  if (payload.event == "media.play" || payload.event == "media.resume" || payload.event == "media.rate") {

    let data = {
      artist: payload.Metadata.grandparentTitle,
      album: payload.Metadata.parentTitle,
      song: payload.Metadata.title,
    }

    let rating = payload.Metadata.userRating / 2;

    let ratingString;

    if (Number.isInteger(rating)) {
      let stars = '🌕'.repeat(rating);
      let emptyStars = '🌑'.repeat(5 - rating);
      ratingString = (stars + emptyStars);
    } else if (rating) {
      let score = rating - 0.5
      let stars = '🌕'.repeat(score);
      let middle = '🌗';
      let emptyStars = '🌑'.repeat(5 - (score + 1));
      ratingString = (stars + middle + emptyStars);
    } else {
      ratingString = "None Set!";
    }

    let albumData = await api.album.getInfo({
      artist: data.artist,
      album: data.album
    }).catch(err => {
      console.log(err)
    })

    let art;

    if (albumData && albumData.album && albumData.album.image && albumData.album.image[2] && albumData.album.image[2]['#text']) art = albumData.album.image[2]['#text']
    else art = "http://bobjames.com/wp-content/themes/soundcheck/images/default-album-artwork.png"

    let presence = {
      details: `Playing: ${data.song}`,
      state: `By: ${data.artist}`,
      assets: {
        large_image: art,
        large_text: `${data.album}`,
        small_image: "https://pbs.twimg.com/profile_images/935982169326985216/wNDmNBFa_400x400.jpg",
        small_text: "Plexamp"
      },
      buttons: [{
        label: `My Rating: ${ratingString}`,
        url: `https://www.last.fm/user/Cleo_ver`
      }, {
        label: "My Music Library",
        url: `https://www.last.fm/user/Cleo_ver`
      }],
      timestamps: {
        start: new Date(),
      }
    }

    client.setActivity(presence)

    new Notification({
      title: presence.details,
      body: presence.state,
      icon: art
    }).show()

  } else if (payload.event == "media.pause" || payload.event == "media.stop") {
    client.setActivity({
      details: `Playing: Nothing Playing`,
      buttons: [{
        label: "My Music Library",
        url: `https://www.last.fm/user/Cleo_ver`
      }],
    })

    new Notification({
      title: "Music Stoppled",
      body: "Nothing is playing now..."
    }).show()

  }

  res.sendStatus(200);

});

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  app.dock.hide()
})