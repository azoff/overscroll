(function () {

	"use strict";

	var casper = require('casper').create(),
		drift = require('./test/modules/drift-move');

	// set up
	casper.start();
	casper.options.clientScripts = ['./test/lib/jquery.min.js'];
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

	function testDrift(test, direction) {
		casper.thenOpen('http://localhost:9000/test/resources/simple.html', function () {

			this.test.assertEquals(this.getScrollTop(), 0, 'init - check top');
			this.test.assertEquals(this.getScrollLeft(), 0, 'init - check left');

			var that = this;

			var distance = test.distance;
			var duration = test.duration;
			var degree = test.degree;
			var target = test.target;

			var pre = distance + ' px, ' + degree + 'º, ' + duration + ' s';
			casper.test.comment('drift ' + (direction ? direction + ', ' : '') + pre);

			var startCoordinates = {};
			if (test.hasOwnProperty('startCoordinates')) {
				startCoordinates = {
					x: test.startCoordinates[0],
					y: test.startCoordinates[1]
				};
			} else {
				startCoordinates = {
					x: 20,
					y: 400
				};
			}

			casper.waitFor(function () {
				return drift({
					startCoordinates: startCoordinates,
					degree: degree,  // 90 means move right
					distance: distance,      // speed in pixels per second
					duration: duration,   // duration of drift in seconds
					start: function (x, y) {
						//casper.test.comment('down ' + x + ' ' + y);
						that.mouse.down(x, y);
					},    // Callback for start, arguments x,y
					way: function (x, y) {
						//casper.test.comment('move ' + x + ' ' + y);
						that.mouse.move(x, y);
					},      // Callback for the way, arguments x,y
					finished: function (x, y) {
						//casper.test.comment('up ' + x + ' ' + y);
						that.mouse.up(x, y);
					}
				}, window);
			}, function () {
				that.test.assertEquals(
					that.getScrollLeft(),
					target.direct[0],
					'x = ' + target.direct[0] + ', direct after drift'
				);
				that.test.assertEquals(
					that.getScrollTop(),
					target.direct[1],
					'y = ' + target.direct[1] + ', direct after drift'
				);
				casper.wait(1000, function () {
					that.test.assertEquals(
						that.getScrollLeft(),
						target.delay[0],
						'x = ' + target.direct[0] + ', 1 sec after drift'
					);
					that.test.assertEquals(
						that.getScrollTop(),
						target.delay[1],
						'y = ' + target.direct[1] + ', 1 sec after drift'
					);
				});
			});


		});
	}

	var driftUp = [
		{
			target: {
				direct: [0, 81],
				delay: [0, 110]
			},
			distance: 50
		},
		{
			target: {
				direct: [0, 165],
				delay: [0, 236]
			},
			distance: 100
		},
		{
			target: {
				direct: [0, 247],
				delay: [0, 363]
			},
			distance: 150
		}
	];

	driftUp.forEach(function (test) {
		// same options for all tests
		// don't need to be repeated!
		test.startCoordinates = [20, 400];
		test.duration = 0.02;
		test.degree = 0;

		testDrift(test, 'up');
	});

	var driftLeft = [
		{
			target: {
				direct: [81, 0],
				delay: [110, 0]
			},
			distance: 50
		},
		{
			target: {
				direct: [165, 0],
				delay: [236, 0]
			},
			distance: 100
		},
		{
			target: {
				direct: [247, 0],
				delay: [363, 0]
			},
			distance: 150
		}
	];

	driftLeft.forEach(function (test) {
		test.startCoordinates = [400, 20];
		test.duration = 0.02;
		test.degree = 270;

		testDrift(test, 'left');
	});

	casper.run();

})();