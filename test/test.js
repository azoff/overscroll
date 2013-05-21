var casper = require('casper').create();

casper.start();

casper.options.viewportSize = {
	width: 600,
	height: 600
};

casper.thenOpen('http://localhost:9000/demo.html', function () {

	this.capture('test.png');

	this.mouse.down(500, 500);
	this.mouse.move(200, 200);
	this.mouse.up(200, 200);

	this.capture('test1.png');

});

casper.run();