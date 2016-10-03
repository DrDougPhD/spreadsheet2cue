window.onload = function() {
	var text_area = document.getElementById("input");
	text_area.onkeyup = function(evt) {
		evt = evt || window.event;
		if (evt.keyCode == 13) {
      //TODO: remove the added newspace?
			process(this.value);
		}
  };
};

function process(text){
  var lines = text.split('\n');
  var songs = [];
  for(var i=0; i<lines.length; i++){
    var trimmed_line = lines[i].trim();
    if (trimmed_line.length > 0) {
      songs.push(
        process_line(lines[i])
      );
    }
  }
  cue_text = songs2cue(songs);
  download("playlist.txt", cue_text);
};

/* Split line into each element:
 *   1. Song duration
 *   2. Album
 *   3. Artist
 *   4. Song title
 *  >4. Misc
 */
var HEADER_KEYS = [
  "duration",
  "album",
  "artist",
  "title"
];
function process_line(line){
  elements = line.split('\t');
  song = {};  
  console.log("Line length: " + line.length);
  for(var i=0; i<elements.length; i++){
    if (i < HEADER_KEYS.length){
      song[HEADER_KEYS[i]] = elements[i];
      console.log(HEADER_KEYS[i] + ":\t" + elements[i]);
    }
  }
  // Convert to a time duration.
  song.duration = moment.duration(song.duration);
  console.log(song.duration);
  return song;
};

function songs2cue(songs){
  var text = 'REM GENRE Alternative' + '\n' +
    'REM DATE 2016' + '\n' +
    'REM DJ "Diabeatz"' + '\n' +
    'REM RADIO "KMNR 89.7 FM"' + '\n' +
    'REM WEBSTREAM "https://boombox.kmnr.org/webstream.ogg.m3u"' + '\n' +
    'REM COMMENT "Tune in to KMNR 89.7 FM every Friday 2pm-4pm CST to hear my show! Call/text in at 504-656-6735! After Jan 2017, I may have a different show slot, though.""' + '\n' +
    'PERFORMER "Diabeatz"' + '\n' +
    'TITLE "PhD: Piled Higher & Deeper"' + '\n' +
    'FILE "ThisUpload.wav" WAVE';
  var current_timespot = moment.duration();
  for (var i=0; i<songs.length; i++){
    // 01, 02, ..., 09, 10, 11, ...
    var track_no = paddy(i, 2);
    var s = songs[i];
    text += '\n' +
      '  TRACK ' + track_no + ' AUDIO' + '\n' +
      '    TITLE "' + s.title + '"\n' +
      '    PERFORMER "' + s.artist + '"\n' +
      '    INDEX 01 ' + duration2cue_index(current_timespot);
    current_timespot.add(s.duration);
    console.log(duration2cue_index(s.duration));
  }
  return text;
};

function duration2cue_index(duration){
  return paddy(duration.minutes(), 2) + 
    ':' + paddy(duration.seconds(), 2) + 
    ':00';
};

// Create a file containing the text and download it
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

/* Pad a number with zeros.
 * Credit: http://stackoverflow.com/a/9744576/412495
 * e.g. var fu = paddy(14, 5); // 00014
 *      var bar = paddy(2, 4, '#'); // ###2
 */
function paddy(n, p, c) {
    var pad_char = typeof c !== 'undefined' ? c : '0';
    var pad = new Array(1 + p).join(pad_char);
    return (pad + n).slice(-pad.length);
}
