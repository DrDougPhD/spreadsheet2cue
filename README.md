# spreadsheet2cue
Create a cue sheet from a spreadsheet containing song titles, artists, durations, and other data.

### Live Demo

You can check out a live demo at https://drdougphd.github.io/spreadsheet2cue/

### Is it accurate?

The time indexes in the resulting cue file depend on the song durations provided.
If your mix is a simple concatenation of music files, then you're cue file will be quite accurate.
However, if one song is fading into another one, then the cue indexes won't be that accurate.
You'll just have to hand-tweak the index points if you really care about it that much.

### Why this exists: Laziness

I created this tiny project because of my use of MixCloud.
Every once in a while, I like to make mixes of the music that I enjoy (I usually do this in Audacity, not too familiar with other mixing software).
If I'm particularly proud of a mix, I'll upload it to MixCloud.
Now, MixCloud allows one to annotate their mix by specifying which songs (performed by which artist) plays at what time in the mix.
This can either be done via manual data entry (tedious), or automatically by uploading certain filetypes that dictate where each song occurs in the mix.

Since I do my mixes in Audacity, I'm unable to conveniently export the filetypes Mixcloud accepts.
However, I do typically keep track of my songs in a Google Spreadsheet (here's a [template](https://docs.google.com/spreadsheets/d/1KFc3_fG-gEt1iNHFQ2XHjc_vs-x6qjUY00yMbZx_jwE/edit?usp=sharing)\).
With this spreadsheet, I can create a [Cue file](https://en.wikipedia.org/wiki/Cue_sheet_\(computing\)) to upload to Mixcloud.
Easy peasy, right?

And thus, out of my laziness to manually mark which songs occur at what time, a software program is written.
