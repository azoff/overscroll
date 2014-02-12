(function () {

	"use strict";

	var casper = require('casper').create();

	// set up
	casper.start();
	casper.options.clientScripts = ['./test/lib/jquery.min.js'];
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

	casper.thenOpen('http://localhost:9000/test/resources/simple.html', function () {

		casper.test.comment('test scroll up');

		this.test.assertEquals(this.getScrollTop(), 0, 'init - check top');
		this.test.assertEquals(this.getScrollLeft(), 0, 'init - check left');

		this.mouse.down(0, 400);
		this.mouse.move(0, 300);
		this.mouse.up(0, 300);

		this.test.assertEquals(this.getScrollTop(), 100, 'dragged 100 px up - check top');
		this.test.assertEquals(this.getScrollLeft(), 0, 'dragged 100 px up - check left');

	});

	casper.thenOpen('http://localhost:9000/test/resources/simple.html', function () {

		casper.test.comment('test scroll left');

		this.test.assertEquals(this.getScrollTop(), 0, 'init - check top');
		this.test.assertEquals(this.getScrollLeft(), 0, 'init - check left');

		this.mouse.down(400, 0);
		this.mouse.move(300, 0);
		this.mouse.up(300, 0);

		this.test.assertEquals(this.getScrollTop(), 0, 'dragged 100 px left - check top');
		this.test.assertEquals(this.getScrollLeft(), 100, 'dragged 100 px left - check left');

	});

	casper.thenOpen('http://localhost:9000/test/resources/simple.html', function () {

		casper.test.comment('test scroll up+left');

		this.test.assertEquals(this.getScrollTop(), 0, 'init - check top');
		this.test.assertEquals(this.getScrollLeft(), 0, 'init - check left');

		this.mouse.down(400, 400);
		this.mouse.move(300, 300);
		this.mouse.up(300, 300);

		this.test.assertEquals(this.getScrollTop(), 100, 'dragged 100 px up+left - check top');
		this.test.assertEquals(this.getScrollLeft(), 100, 'dragged 100 px up+left - check left');

	});

	casper.run();

})();