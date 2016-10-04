/**
 * @file Utility functions that were not written by me.
 */

/** Pad a number with zeros.
 * e.g. var fu = paddy(14, 5);				// '00014'
 *      var bar = paddy(2, 4, '#');		// '###2'
 * @function paddy
 * @static
 * @copyright http://stackoverflow.com/a/9744576/412495
 */
function paddy (n, p, c) {
	var pad_char = typeof c !== 'undefined' ? c : '0';
	var pad = new Array(1 + p).join(pad_char);
	return (pad + n).slice(-pad.length);
};

