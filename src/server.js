const express = require('express')
const multer = require('multer')
var ip = require("ip");

window.$ = window.jQuery = require('jquery');

const directory = "./tmp/"
const fs = require('fs')

const upload = multer({
    dest: directory
})

var app = express();

console.log("Started Rich Presence Server");


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

const client = new(require("easy-presence").EasyPresence)("499374732655984651"); // replace this with your Discord Client ID.

const API = require('last.fm.api'),
    api = new API({
        apiKey: '6d6bf952135ec7a0ceee6fc67ef03768',
        apiSecret: '16904428e4a4de577339c4655b5a98fe'
    });

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');

const snackbar = document.getElementById("snackbar");
const ipAddr = document.getElementById("ip-address");

const album_art = document.getElementById("album-art");
const now_playing = document.getElementById("now-playing");
const toast = document.getElementById("toast-body");


ipAddr.innerHTML = ip.address() + ":"

const port = document.getElementById("port");

// if the start button is pressed run a function called start() 
startButton.addEventListener('click', startServer);
stopButton.addEventListener('click', stopServer);

let server;

function startServer() {
    try {
        server = app.listen(port.value || 9000, () => {
            console.log(`Node.js server started on port ${port.value || 9000}.`)
            toast.innerHTML = `Node.js server started on port ${port.value || 9000}.`
            $('.toast').toast('show');
        })
    } catch {
        console.log(`Node.js server failed to started on port ${port.value || 9000}.`)
        toast.innerHTML = `Node.js server failed to started on port ${port.value || 9000}.`
        $('.toast').toast('show');
    }
}

function stopServer() {
    try {
        server.close(function () {
            console.log(`Node.js server stopped on port ${port.value}.`)
            toast.innerHTML = `Node.js server stopped on port ${port.value}.`
            $('.toast').toast('show');
        });
    } catch {
        console.log(`Node.js server failed to stop on port ${port.value}.`)
        toast.innerHTML = `Node.js server failed to stop on port ${port.value}.`
        $('.toast').toast('show');
    }
}

app.post('/', upload.single('thumb'), async function (req, res, next) {

    var payload = JSON.parse(req.body.payload);

    console.log('Got webhook for', payload.event);

    toast.innerHTML = `Got webhook for ${payload.event}`
    $('.toast').toast('show');

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
        }).catch(err => {})

        let art;

        if (albumData && albumData.album && albumData.album.image && albumData.album.image[2] && albumData.album.image[2]['#text']) art = albumData.album.image[2]['#text']
        else art = "http://bobjames.com/wp-content/themes/soundcheck/images/default-album-artwork.png"

        console.log("Setting Rich Presence");

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
                // end: new Date() + 1000 * 60 * 60
            }
        }

        client.setActivity(presence)

        album_art.src = art;
        now_playing.innerHTML = `Playing: ${data.song}\nBy: ${data.artist}`;

    } else if (payload.event == "media.pause" || payload.event == "media.stop") {
        client.setActivity({
            details: `Playing: Nothing Playing`,
            buttons: [{
                label: "My Music Library",
                url: `https://www.last.fm/user/Cleo_ver`
            }],
        })
    }

    res.sendStatus(200);

});