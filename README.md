# Plexamp Discord Rich Presence

## Video Example:
[![Example Video](https://i3.ytimg.com/vi/_bgM8pSqb8w/maxresdefault.jpg)](https://www.youtube.com/watch?v=_bgM8pSqb8w)


## Explanation:

WIP Electron app which uses Plex’s webhook functionality to update your discord status, this means you can also get updates while not listening on the same device / same network!~

(As long as you have the program running on a device on the same local network as your Plex instance and discord opened and logged in on that device)

Super super work in progress, as you may have noticed, time in discord does gets reset on updates, as well as the album art sometimes failing to be fetched (in this case it will fallback to a “no album art” image).

The time could easily be correct (and even show “x:xx time left”) if I could find some way to get the remaining time from the Plex player, it is not included in the webhook payload so id have to use the Plex api, which I haven’t been able to figure out (If you know how I could get this I’d love to know <3)

The reason for the album art failing to fetch is that it is currently using the last.fm api to find an image link for the album art, which fails to find songs sometimes or just decides to return empty data. The images are fetched and cached from Plex webhook payload in its current state, although discord rich presences require a url to be passed. As the file is stored locally I cannot easily send it out to discord without it being insecure and exposing your Plex or device ip.

You may also notice a delay sometimes between Ples and it updating in discord, this is a discord limit where rich presence statuses can only be updated once ever 15 or so seconds, since you normally listen to music over 15 seconds you shouldn't notice the delay in normal use. To my understanding even if it does not update it queues the update to happen as soon as it can so there is no worry in missing updates to the status due to this.

### As for the app itself:

Its very bare bones at the moment, I originally made it a nodeJS console application which I only planned to use myself before deciding to make it more user friendly and release it on GitHub once I get the quirks worked out.

The “Set Port” option is just the local ip, as well as the port you’d like to start up the webhook receiver server on, you add this ip/port in Plex as well so Plex knows where to send the update.

“Start” starts the webhook receiving server, and stop closes it down

(As well the stars in discord are fetched and updated based on the starts you set in Plex, used the moon emoji so I could display half stars better ;p)

No release or anything at the moment since its still very beta-ish and honestly confusing and breaks sometimes as some error catching and events are missing, but for what its worth it works 95% of the time id say.

I wish I knew why Plex does not send out “event.play” webhook’s sometimes, It happens on some random albums / songs for me, or if I try and play a song I just played a few seconds ago, I think its setup so you don’t get repeats in your play history, although I’m unsure. In these cases pausing and unpausing fixes the issue as I have event.resume setup to update the rich status as well which is always sent by plex.
