var casper = require('casper').create(),
    drift  = require('./test/modules/drift-move');

// set up
casper.start();
casper.options.clientScripts = ['./test/lib/jquery.js'];
casper.options.waitTimeout = 10000;
casper.viewport(500, 500);


// add helper methods
casper.getScrollTop = function () {
  return this.evaluate(function () {
    return $('#overscroll').scrollTop();
  });
};

casper.getScrollLeft = function () {
  return this.evaluate(function () {
    return $('#overscroll').scrollLeft();
  });
};

function testDrift (test) {
  casper.thenOpen('http://localhost:9000/test/resources/simple.html', function () {

    casper.test.comment('test drift down');

    this.test.assertEquals(this.getScrollTop(), 0, 'init - check top');
    this.test.assertEquals(this.getScrollLeft(), 0, 'init - check left');

    var that = this;
    var start;

    var distance  = test.distance;
    var duration  = test.duration;
    var degree    = test.degree;
    var target    = test.target;
    
    casper.waitFor(function () {
      start = new Date().getMilliseconds();
      var result = drift({
        startCoordinates: { //optional
          x: 10,
          y: 400
        },
        degree: degree,  // 90 means move right
        distance: distance,      // speed in pixels per second
        duration: duration,   // duration of drift in seconds
        start: function (x,y) {
          casper.test.comment('down ' + x + ' ' + y);
          that.mouse.down(x, y);
        },    // Callback for start, arguments x,y
        way: function (x,y) {
          casper.test.comment('move ' + x + ' ' + y);
          that.mouse.move(x, y);
        },      // Callback for the way, arguments x,y
        finished: function (x,y) {
          casper.test.comment('up ' + x + ' ' + y);
          that.mouse.up(x, y);
        }
      }, window);
      
      return result;
    }, function () {
      console.log('time needed', new Date().getMilliseconds() - start);
      var pre = distance + ' px, ' + degree + 'º, ' + duration + ' ms';
      that.test.assertEquals(that.getScrollLeft(), target.direct.x, pre + ' direct after drift - x');
      that.test.assertEquals(that.getScrollTop(), target.direct.y, pre + ' direct after drift - y');
      casper.wait(1000, function () {
        that.test.assertEquals(that.getScrollLeft(), target.delay.x, pre + ' 1 sec after drift - x');
        that.test.assertEquals(that.getScrollTop(), target.delay.y, pre + ' 1 sec after drift - y');
      });
    });


  });
}

var tests = [
  {
    target: {
      direct: {
        x: 0,
        y: 77
      },
      delay: {
        x: 0,
        y: 110
      }     
    },
    distance: 50,
    duration: 0.02,
    degree: 0
  },
  {
    target: {
      direct: {
        x: 0,
        y: 165
      },
      delay: {
        x: 0,
        y: 236
      }     
    },
    distance: 100,
    duration: 0.02,
    degree: 0
  },
  {
    target: {
      direct: {
        x: 0,
        y: 247
      },
      delay: {
        x: 0,
        y: 363
      }     
    },
    distance: 150,
    duration: 0.02,
    degree: 0
  }
];

tests.forEach(function (test) {
  testDrift(test);
});


casper.run();