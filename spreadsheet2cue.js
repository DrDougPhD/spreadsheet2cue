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
	/**
	 * Configuration of the cue filename to be downloaded.
	 * @memberof spreadsheet2cue
	 * @static
	 * @todo Add text input to specify download filename, with default
	 */
	download_filename: 'playlist.cue',

	/**
	 * Preprocess the pasted spreadsheet into a downloaded cue file.
	 * @function preprocess
	 * @memberof spreadsheet2cue
	 * @static
	 */
	preprocess: function(text, button) {
		// Trim away whitespace from textarea.
		var text = text.trim();
		if (text.length == 0){
			//TODO: alert user of their mistake
			return false;
		}

		// Check if header is included
		var lines = text.split('\n');
		if (spreadsheet2cue.isHeader(lines[0])) {
			lines.splice(0, 1);
		}

		// Convert raw text in textarea to a Cue object
		var cue = new Cue(lines);

		/* Create a file from Cue object and download it within JavaScript
		 * Adapted from http://stackoverflow.com/a/18197341
		 */
		button.setAttribute('href',
			'data:text/plain;charset=utf-8,' + encodeURIComponent(cue));
		button.setAttribute('download', spreadsheet2cue.download_filename);
		return true;
	},

	/**
	 * Detect if text is the header for the spreadsheet
	 * @function isHeader
	 * @memberof spreadsheet2cue
	 * @static
	 */
	isHeader: function(string) {
		//TODO: accept tab, comma, and semi-colon delimited text imputs
		var tab_split_string = string.split('\t');
		var is_album_header = 'album' === tab_split_string[1].toLowerCase();
		var is_artist_header = 'artist' === tab_split_string[2].toLowerCase();
		var is_song_header = 'song' === tab_split_string[3].toLowerCase();
		return (is_album_header && is_artist_header && is_song_header);
	},
};


window.onload = function() {
	/* The textarea of the page is used to paste in the user's song spreadsheet
	 * for conversion to a cue sheet.
	 */
	var textarea = document.getElementById("input");

	/* The anchor (it looks like a button) should be programmed to preprocess
	 * the textarea's content so that the cue file can be downloaded.
	 */
	var button = document.getElementById('button');


	// A placeholder fills the textarea when no text is in there.
	textarea.setAttribute('placeholder',
		'Paste tab-delimited text and press ENTER\n' +
		'0:02:05\tDrukqs\tAphex Twin\tAvril 14th\n' +
		'0:06:02\tFlavour\tCountry EP\tBent\tExercise 5'
	);

	// If the user presses the ENTER key in the textarea, interpret this as a
	// submit action.
	textarea.onkeyup = function(evt) {
		evt = evt || window.event;
		if (evt.keyCode == 13) {
			//TODO: (cosmetic) prevent newspace from being added if the user presses
			// enter
			spreadsheet2cue.preprocess(textarea.value, button);
			button.click();
		}
  };


	/**
	 * When the button is pressed, populate its href and download attributes
	 * with the encoded cue file.
	 */
	button.onclick = function() {
		return spreadsheet2cue.preprocess(textarea.value, button);
	}

};



/**
 * A Cue object, used to build the cue file that is to be downloaded.
 * @constructor
 * @param {string[]} lines - tab-delimited strings
 */
function Cue(lines) {
	// Keep track of the current index of the song being processed
	var current_index = moment.duration();

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
	'REM COMMENT "Created using spreadsheet2cue: ' +
		'https://github.com/DrDougPhD/spreadsheet2cue"\n' +
	'FILE "MyMixIsFire.wav" WAVE\n';

/** @function
 * @name toString
 * @desctription Convert the Cue object to the string format that would appear
 * in a cue file.
 * @returns {string}
 */
Cue.prototype.toString = function() {
	// initialize cue with the header
	var string = Cue.HEADER;

	// iterate over each song and add its string representation to the cue
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
	//TODO: accept tab, comma, and semi-colon delimited text imputs
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
