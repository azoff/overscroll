/**
 * A wrapper function to make easy drifts.
 * Works as a nodejs or browser module.
 * @author vardump
 * @param  {object} options {
      startCoordinates: { //optional
        x: Number,
        y: Number
      },
      degree: Number,  // degree of direction to drift.
      distance: Number,   // distance in pixel
      duration: Number,   // duration of drift in seconds
      start: Function,    // Callback for start, arguments x,y
      way: Function,      // Callback for the way, arguments x,y
      finished: Function, // Callback when finished, arguments x,y
      waitFinished: Number// time to wait between last way() and finished call
    }
 */
function drift(options, window) {

	"use strict";

	var MOVE_INTERVAL = 2; //ms
	var speed = options.distance / options.duration;
	options.degree = ((Math.PI * 2) / 360) * options.degree;
	var stepX = Math.sin(options.degree);
	var stepY = -Math.cos(options.degree);

	var moveCoeficent = (MOVE_INTERVAL / 1000) * speed;
	var interval;
	var x, y;
	var counter = 0;
	options.duration = options.duration * 1000;

	var limit = Math.floor(options.duration / MOVE_INTERVAL);

	// if no start point was given, start at 0
	if (options.hasOwnProperty('startCoordinates')) {
		if (options.startCoordinates.hasOwnProperty('x') &&
			options.startCoordinates.hasOwnProperty('y') &&
			typeof options.startCoordinates.x === 'number' &&
			typeof options.startCoordinates.y === 'number') {
			x = options.startCoordinates.x;
			y = options.startCoordinates.y;
		} else {
			x = 0;
			y = 0;
		}
	} else {
		x = 0;
		y = 0;
	}

	stepX = stepX * moveCoeficent;
	stepY = stepY * moveCoeficent;

	//start
	if (options.hasOwnProperty('start') &&
		typeof options.start === 'function') {
		//call start callback
		options.start(x, y);
	}

	var returnVal = true;

	interval = setInterval(function () {
		//console.log(stepX, stepY);
		if (counter <= limit) {
			x += stepX;
			y += stepY;
			//call the way callback
			options.way(x, y);
			counter += 1;
		} else {
			if (options.hasOwnProperty('waitFinished')) {
				setTimeout(function () {
					options.finished(x, y);
				}, options.waitFinished);
			} else {
				options.finished(x, y);
			}
			if (window) {
				window.clearInterval(interval);
			} else {
				clearInterval(interval);
			}
			returnVal = true;
		}
	}, MOVE_INTERVAL);
	return returnVal;
}

//the frontend doesnt know any module ..
if (typeof module !== 'undefined') {
	module.exports = drift;
}
