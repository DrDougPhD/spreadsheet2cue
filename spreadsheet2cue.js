// Namespace for this project.
var spreadsheet2cue = {
	/**
	 * Configuration parameters
	 */
	download_filename: 'playlist.cue',

	/**
	 * Utility functions
	 */
	isNotPopulated: function (text) {
		return text.length == 0;
	},

};

window.onload = function() {

	/* The textarea of the page is used to paste in the user's song spreadsheet
	 * for conversion to a cue sheet.
	 */
	var textarea = spreadsheet2cue.textarea = document.getElementById("input");

	// A placeholder fills the textarea when no text is in there.
	textarea.setAttribute('placeholder',
		'Paste tab-delimited text and press ENTER\n' +
		'0:02:05	Drukqs	Aphex Twin	Avril 14th\n' +
		'0:06:02	Flavour Country EP	Bent	Exercise 5'
	);

	// If the user presses the ENTER key in the textarea, interpret this as a
	// submit action.
	textarea.onkeyup = function(evt) {
		// Trim away whitespace from textarea.
		textarea.value = textarea.value.trim();

		evt = evt || window.event;
		if (evt.keyCode == 13) {
			//TODO: (cosmetic) prevent newspace from being added if the user presses
			// enter
			process();
		}
  };

	// If the user has not pasted text into the textarea, we do not want to
	// process the placeholder text.

};

function process(){
	var text = spreadsheet2cue.textarea.value.trim();
	if (spreadsheet2cue.isNotPopulated(text)){
		console.log("The user has not pasted any content.");
		return false;
	}
	

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
  download(cue_text);
	return true;
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
function download(text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', spreadsheet2cue.download_filename);

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
