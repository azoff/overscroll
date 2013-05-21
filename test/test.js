var x = require('casper').selectXPath;
var casper = require('casper').create();

casper.options.viewportSize = {
	width: 600,
	height: 600
};

casper.start('http://localhost:9000/demo.html');


casper.then(function () {
	this.captureSelector("screenshot0.png", "html");
});

casper.then(function () {
	this.mouse.down(500, 500);
	this.mouse.up(200, 200);
});

casper.then(function () {
	this.captureSelector("screenshot1.png", "html");
});

casper.run(function () {
	this.test.renderResults(true);
});