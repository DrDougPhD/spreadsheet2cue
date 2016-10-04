// Namespace for this project.
var spreadsheet2cue = {
	/****************************
	 * Configuration parameters
	 ****************************/
	download_filename: 'playlist.txt',

	CUE_HEADER: '' +
		'REM GENRE Alternative' + '\n' +
		'REM DATE 2016' + '\n' +
		'REM DJ "Diabeatz"' + '\n' +
		'REM RADIO "KMNR 89.7 FM"' + '\n' +
		'REM WEBSTREAM "https://boombox.kmnr.org/webstream.ogg.m3u"' + '\n' +
		'REM COMMENT "Tune in to KMNR 89.7 FM every Friday 2pm-4pm CST to hear my show! Call/text in at 504-656-6735! After Jan 2017, I may have a different show slot, though."' + '\n' +
		'PERFORMER "Diabeatz"' + '\n' +
		'TITLE "PhD: Piled Higher & Deeper"' + '\n' +
		'FILE "ThisUpload.wav" WAVE',


	/** Create a file and download it.
	 */
	download: function(text) {
	  var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	  element.setAttribute('download', spreadsheet2cue.download_filename);

	  element.style.display = 'none';
		document.body.appendChild(element);

	  element.click();

	  document.body.removeChild(element);
	},

	/*********************
	 * Utility functions
	 *********************/
	songs2cue: function(songs) {
		var text = this.CUE_HEADER;
		var current_index = moment.duration();
		for (var i=0; i<songs.length; i++){
			// 01, 02, ..., 09, 10, 11, ...
			var track_no = spreadsheet2cue.paddy(i, 2);
			var s = songs[i];
			text += '\n' +
				'  TRACK ' + track_no + ' AUDIO' + '\n' +
				'    TITLE "' + s.title + '"\n' +
				'    PERFORMER "' + s.artist + '"\n' +
				'    INDEX 01 ' + spreadsheet2cue.dur2index(current_index);
			current_index.add(s.duration);
			console.debug('Cue index: ' + spreadsheet2cue.dur2index(s.duration));
		}
	  return text;
	},


	/** Pad a number with zeros.
	 * Credit: http://stackoverflow.com/a/9744576/412495
	 * e.g. var fu = paddy(14, 5);				// '00014'
	 *      var bar = paddy(2, 4, '#');		// '###2'
	 */
	paddy: function (n, p, c) {
		var pad_char = typeof c !== 'undefined' ? c : '0';
		var pad = new Array(1 + p).join(pad_char);
		return (pad + n).slice(-pad.length);
	},

	/** Convert a moment.duration object to the cue index string of the format
	 *	"MM:SS:FF", where
	 *		MM is minutes,
	 *		SS is seconds,
	 *		FF is frames (there are 75 frames to 1 second).
	 */
	dur2index: function (duration){
		var p = this.paddy;
		return p(duration.minutes(), 2) + ':' + p(duration.seconds(), 2) + ':00';
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

	/* DEBUGGING ONLY */
	textarea.value = "" +
		"0:04:39	Different Trains / Electric Counterpoint	Steve Reich	Electric Counterpoint - Fast (movement 3)\n" +
		"0:02:05	Drukqs	Aphex Twin	Avril 14th\n" +
		"0:06:02	Flavour Country EP	Bent	Exercise 5\n" +
		"0:07:56	Red Extensions of Me	The Flashbulb	Lucid Bass I\n" +
		"0:06:51	Different Trains / Electric Counterpoint	Steve Reich	Electric Counterpoint - Fast (movement 1)\n" +
		"0:05:44	Albedo 0.39	Vangelis	Alpha";

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

};

function process(){
	var text = spreadsheet2cue.textarea.value.trim();
	if (text.length == 0){
		console.debug("The user has not pasted any content.");
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

  cue_text = spreadsheet2cue.songs2cue(songs);
  spreadsheet2cue.download(cue_text);
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
	console.debug('Line length: ' + line.length);
	for(var i=0; i<elements.length; i++){
		if (i < HEADER_KEYS.length){
			song[HEADER_KEYS[i]] = elements[i];
			console.debug(HEADER_KEYS[i] + ':\t' + elements[i]);
		}
	}
	// Convert to a time duration.
	song.duration = moment.duration(song.duration);
	console.debug(song.duration);
	return song;
};


