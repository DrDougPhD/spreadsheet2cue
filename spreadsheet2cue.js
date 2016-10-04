/**
 * Create a cue file from a spreadsheet of songs.
 * @file spreadsheet2cue.js
 * @author Doug McGeehan <djmvfb@mst.edu>
 * @copyright Doug McGeehan 2016
 * @see {@link http://wiki.hydrogenaud.io/index.php?title=Cue_sheet}
 */

/**
 * Namespace for the spreadsheet2cue project
 * @namespace spreadsheet2cue
 */
var spreadsheet2cue = {
	/////////////////////////////////////////////////////////////////////////////
	// Configuration parameters
	/////////////////////////////////////////////////////////////////////////////
	/**
	 * Configuration of the cue filename to be downloaded.
	 * @memberof spreadsheet2cue
	 * @static
	 */
	download_filename: 'playlist.txt',


	/**
	 * Create a file and download it within JavaScript.
	 * Adapted from http://stackoverflow.com/a/18197341
	 * @function download
	 * @memberof spreadsheet2cue
	 * @static
	 */
	download: function(filename, text) {
	  var element = document.getElementById('button');
		element.setAttribute('href',
			'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	  element.setAttribute('download', filename);

		/*
	  element.style.display = 'none';
		document.body.appendChild(element);

	  element.click();

	  document.body.removeChild(element);
		*/
	},
};

window.onload = function() {
	//TODO: add onclick to the anchor

	/* The textarea of the page is used to paste in the user's song spreadsheet
	 * for conversion to a cue sheet.
	 */
	var textarea = spreadsheet2cue.textarea = document.getElementById("input");

	// A placeholder fills the textarea when no text is in there.
	textarea.setAttribute('placeholder',
		'Paste tab-delimited text and press ENTER\n' +
		'0:02:05\tDrukqs\tAphex Twin\tAvril 14th\n' +
		'0:06:02\tFlavour\tCountry EP\tBent\tExercise 5'
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


/**
 * @function process
 * @description Process the pasted spreadsheet into a downloaded cue file.
 */
function process(){
	var text = spreadsheet2cue.textarea.value.trim();
	if (text.length == 0){
		//TODO: alert user of their mistake
		return false;
	}

	var cue = new Cue(text);
  spreadsheet2cue.download(spreadsheet2cue.download_filename, cue);
	return true;
};


/**
 * A Cue object, used to build the cue file that is to be downloaded.
 * @constructor
 * @param {string} raw_text - tab-delimited, multiline string
 */
function Cue(raw_text) {
	// Keep track of the current index of the song being processed
	var current_index = moment.duration();

	var lines = raw_text.split('\n');
	this.songs = [];

	// Iterate over each line in the raw text
	for(var i=0; i<lines.length; i++){
		var trimmed_line = lines[i].trim();
		if (trimmed_line.length > 0) {
			var track = new CueTrack(lines[i]);

			track.index = moment.duration(current_index);
			current_index.add(track.duration);

			// Track numbers start from 1 in a cue file.
			track.track_no = i+1;

			this.songs.push(track);
		}
	}
};

/**
 * The header string of the cue file.
 * @static
 */
Cue.HEADER = '' +
	'REM GENRE Alternative' + '\n' +
	'REM DATE 2016' + '\n' +
	'REM DJ "Diabeatz"' + '\n' +
	'REM RADIO "KMNR 89.7 FM"' + '\n' +
	'REM WEBSTREAM "https://boombox.kmnr.org/webstream.ogg.m3u"' + '\n' +
	'REM COMMENT "Tune in to KMNR 89.7 FM every Friday 2pm-4pm CST to hear my show! Call/text in at 504-656-6735! After Jan 2017, I may have a different show slot, though."' + '\n' +
	'PERFORMER "Diabeatz"' + '\n' +
	'TITLE "PhD: Piled Higher & Deeper"' + '\n' +
	'FILE "ThisUpload.wav" WAVE\n';

/** @function
 * @name toString
 * @desctription Convert the Cue object to the string format that would appear
 * in a cue file.
 * @returns {string}
 */
Cue.prototype.toString = function() {
	var string = Cue.HEADER;
 	for (var i=0; i<this.songs.length; i++) {
		string += this.songs[i];
	}
	return string;
};


/**
 * Instantiate a CueTrack object from a tab-delimited string of the format
 * "0:02:05	Drukqs	Aphex Twin	Avril 14th\n"
 * @class
 * @param {string} tab_delimited_string - tab-delimited string containing song details
 */
function CueTrack(tab_delimited_string) {
	var s = tab_delimited_string.split('\t');

	/*
	 * It is assumed that the format of the input string is like so:
	 *   1. Song duration
	 *   2. Album
	 *   3. Artist
	 *   4. Song title
	 *   5+. Misc
	 */
	this.duration = moment.duration(s[0]);
	this.album = s[1];
	this.artist = s[2];
	this.title = s[3];

	// These attrs will be populated later
	this.index = null;
	this.track_no = null;
};

/** @function
 * @name timeFormat
 * @desctription Convert a moment.duration object to the cue index string of 
 * the format "MM:SS:FF", where MM is minutes, SS is seconds, and FF is frames
 * (there are 75 frames to 1 second).
 * @param {moment.duration} duration - the moment.duration object to stringify
 * @returns {string}
 */
CueTrack.prototype.timeFormat = function(duration) {
	return paddy(duration.minutes(), 2) + ':' + 
		paddy(duration.seconds(), 2) + ':00';
};

/** @function
 * @name toString
 * @desctription Convert the CueTrack to the string format that would appear
 * in a cue file.
 * @returns {string}
 */
CueTrack.prototype.toString = function() {
	return '' +
		'  TRACK ' + paddy(this.track_no, 2) + ' AUDIO' + '\n' +
		'    TITLE "' + this.title + '"\n' +
		'    PERFORMER "' + this.artist + '"\n' +
		'    INDEX 01 ' + this.timeFormat(this.index) + '\n';
};
