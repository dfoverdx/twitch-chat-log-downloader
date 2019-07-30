Twitch Chat Log Downloader
==========================

A quick and dirty tool for downloading a Twitch VODs chat and outputting to a csv (spreadsheet that you can open in
Excel, Google Sheets, etc).

Outputted columns:
* VOD timestamp
* Message time (UTC timestamp)
* Username
* Twitch ID (id number used by Twitch)
* Message
* Account create date

Batches of messages are loaded in sequence with 0.3 second delays to avoid Twitch from throttling you.

Installation
------------
```
git clone https://github.com/dfoverdx/twitch-chat-log-downloader.git
cd twitch-chat-log-downloader
npm install
```

Usage
-----

```
npm start -- <vodId> [-o <output-file-name> | -s]
```

Get the `vodId` by opening the VOD up in a browser, and then copying the number that follows
`https://www.twitch.tv/videos/`.

You can specify the output filename with the optional `-o` parameter.  If left blank, the outputted file will be named
`output-<vodID>.csv`.  If you do not wish to output to a file, use the `-s` parameter and it will log to std (the 
console) instead.