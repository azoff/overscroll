var casper = require('casper').create();

// set up
casper.start();
casper.options.clientScripts = ['./test/lib/jquery.js'];
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

casper.run();