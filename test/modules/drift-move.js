// var options = {
//   startCoordinates: { //optional
//     x: Number,
//     y: Number
//   },
//   degree: Number,  // degree of direction to drift.
//   speed: Number,      // speed in pixels per second
//   duration: Number,   // duration of drift in seconds
//   start: Function,    // Callback for start, arguments x,y
//   way: Function,      // Callback for the way, arguments x,y
//   finished: Function, // Callback when finished, arguments x,y
//   waitFinished: Number// time to wait between last way() and finished call
// }



function drift (options) {
  var MOVE_INTERVAL = 16.6666666; //ms
  var speed = options.distance / options.duration;
  options.degree = ((Math.PI * 2) / 360) * options.degree;
  var stepX = Math.sin(options.degree);
  var stepY = -Math.cos(options.degree);
  console.log(stepX, stepY);
  var moveCoeficent = (MOVE_INTERVAL / 1000) * speed;
  var interval;
  var x, y;
  var counter = 0;
  options.duration = options.duration * 1000;
  var limit = Math.floor(options.duration / MOVE_INTERVAL);
  var that = this;

  // if no start point was given, start at 0
  if (options.hasOwnProperty('startCoordinates')) {
    if (options.startCoordinates.hasOwnProperty('x')
      && options.startCoordinates.hasOwnProperty('y')
      && typeof options.startCoordinates.x === 'number'
      && typeof options.startCoordinates.y === 'number') {
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
  console.log(stepX, stepY);

  //start
  if (options.hasOwnProperty('start')
    && typeof options.start === 'function') {
    //call start callback
    options.start(x, y);
  }

  interval = setInterval(function () {
    //console.log(stepX, stepY);
    if (counter <= limit) {
      x += stepX;
      y += stepY;
      //call the way callback
      options.way(x, y);
      counter += 1;
    } else {
      clearInterval(interval);
      if (options.hasOwnProperty('waitFinished')) {
        setTimeout(function () {
          options.finished.call(that, x, y);
        }, options.waitFinished);
      } else {
        options.finished.call(that, x, y);
      }
    }
  }, MOVE_INTERVAL);

}

//the frontend doesnt know any module ..
if (typeof module !== 'undefined') {
    module.exports = drift;
}
