window.onload = function (e) {

  var canvas = document.querySelector('.drift-canvas');
  var ctx = canvas.getContext('2d');
  var shape = {
    type:'circle',
    x: 200,
    y: 200,
    xdir: 1,
    ydir: 1,
    radius: 25,
    fill:'green',
    stroke:'black'
  };

  function drawCircle (x, y, color) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.fillStyle = color || shape.fill;
    ctx.strokeStyle = shape.stroke;
    ctx.arc(x + shape.radius + 2, y + shape.radius + 2, shape.radius, Math.PI * 2, false);
    ctx.stroke();
    ctx.fill();
  }


  //start drifting
  setInterval (function () {
    drift({
    startCoordinates: { //optional
      x: shape.x,
      y: shape.y
    },
    degree: 270,  // 90 means move right
    distance: 50,      // speed in pixels per second
    duration: 0.02,   // duration of drift in seconds
    start: function (x,y) {
      drawCircle(x, y, 'green');
    },    // Callback for start, arguments x,y
    way: function (x,y) {
      drawCircle(x,y, 'red');
    },      // Callback for the way, arguments x,y
    finished: function (x,y) {
      drawCircle(x,y,'black');
    }, // Callback when finished, arguments x,y
    waitFinished: 0// time to wait between last way() and finished call
  });
  }, 1000);

};