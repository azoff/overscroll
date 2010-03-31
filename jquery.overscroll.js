/*!
 * jQuery.overscroll JavaScript Plugin v1.2.1
 * http://azoffdesign.com/plugins/js/overscroll
 *
 * Intended for use with the latest jQuery
 * http://code.jquery.com/jquery-latest.min.js
 *
 * Copyright 2010, Jonathan Azoff
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Date: Wednesday, March 10th 2010
 *
 * Changelog:
 *
 * 1.2.1
 *   - Made "smart" click support "smarter" :)
 *   - Added JSLint validation to the build process
 *	 - Removed unused variables and cleaned up code
 * 1.2.0
 *   - Updated license to match the jQuery license (thanks Jesse)
 *   - Added vertical scroll wheel support (thanks Pwakman)
 *   - Added support to ignore proprietary drag events (thanks Raphael)
 *   - Added "smart" click support for clickable elements (thanks Mark)
 * 1.1.2
 *   - Added the correct click handling to the scroll operation (thanks Evilc)
 * 1.1.1
 *   - Made scroll a bit smoother (thanks Nick)
 * 1.1.0
 *   - Optimized scrolling-internals so that it is both smoother and more memory efficient 
 *     (relies entirely on event model now). 
 *   - Added the ability to scroll horizontally (if the overscrolled element has wider children).
 * 1.0.3
 *   - Extended the easing object, as opposed to the $ object (thanks Andre)
 * 1.0.2
 *   - Fixed timer to actually return milliseconds (thanks Don)
 * 1.0.1
 *   - Fixed bug with interactive elements and made scrolling smoother (thanks Paul and Aktar)
 *
 * Notes:
 * 
 * In order to get the most out of this plugin, make sure to only apply it to parent elements 
 * that are smaller than the collective width and/or height then their children. This way,
 * you can see the actual scroll effect as you pan the element.
 *
 * You MUST have two cursors to get the hand to show up, open, and close during the panning 
 * process. You can put the cursors wherever you want, just make sure to reference them in 
 * the code below. I have provided initial static linkages to these cursors for your 
 * convenience (see below).
 *
 */

/*jslint onevar: true, strict: true */
/*global jQuery: false */
"use strict"; 

(function($, o){

	// create overscroll
	o = $.fn.overscroll = function() {
		return this.each(o.init);
	};
	
	$.extend(o, {
		
		// overscroll icons
		icons: {
			open: "http://static.azoffdesign.com/misc/open.cur",
			closed: "http://static.azoffdesign.com/misc/closed.cur"
		},
		
		// events handled by overscroll
		events: {
			wheel: "mousewheel DOMMouseScroll",
			start: "select mousedown touchstart",
			drag: "mousemove touchmove",
			end: "mouseup mouseleave touchend",
			ignored: "dragstart drag"
		},
		
		// main initialization function
		init: function(data, target, size) {
			data = {};
			
			target = $(this)
				.css({"cursor":"url("+o.icons.open+"), default", "overflow": "hidden"})
				.bind(o.events.wheel, data, o.wheel)
				.bind(o.events.start, data, o.start)
				.bind(o.events.end, data, o.stop)
				.bind(o.events.ignored, function(){return false;}); // disable proprietary drag handlers
			
			data.target = target;	
		},
		
		// handles mouse wheel scroll events
		wheel: function(event, delta) {
			
			if ( event.wheelDelta ) { delta = event.wheelDelta/12000; }
			if ( event.detail     ) { delta = -event.detail/3; }
			
			event.data.target.stop(true, true).animate({
				scrollTop: this.scrollTop - (delta * o.constants.wheelDeltaMod)
			},{ 
				queue: false, 
				duration: o.constants.scrollDuration, 
				easing: "cubicEaseOut" 
			});
			
			return false;
			
		},
		
		// starts the drag operation and binds the mouse move handler
		start: function(event) {
			
			event.data.target
				.css("cursor", "url("+o.icons.closed+"), default")
				.bind(o.events.drag, event.data, o.drag)
				.stop(true, true);
			
			event.data.position = { 
				x: event.pageX,
				y: event.pageY
			};
			
			event.data.capture = {};
			
			event.data.isDragging = false;
			
			return false;
		},
		
		// updates the current scroll location during a mouse move
		drag: function(event) {
			this.scrollLeft -= (event.pageX - event.data.position.x);
			this.scrollTop -= (event.pageY - event.data.position.y);
			event.data.position.x = event.pageX;
			event.data.position.y = event.pageY;
			
			if (typeof event.data.capture.index === "undefined" || --event.data.capture.index === 0 ) {
				event.data.isDragging = true;
				event.data.capture = {
					x: event.pageX,
					y: event.pageY,
					index: o.constants.captureThreshold
				};
			}

			return true;
		},
		
		// ends the drag operation and unbinds the mouse move handler
		stop: function(event) {

			if( typeof event.data.position !== "undefined" ) {

				event.data.target
					.css("cursor", "url("+o.icons.open+"), default")
					.unbind(o.events.drag, o.drag);

				if ( event.data.isDragging ) {	
					
					var dx = o.constants.scrollDeltaMod * (event.pageX - event.data.capture.x),
						dy = o.constants.scrollDeltaMod * (event.pageY - event.data.capture.y);
					event.data.target.stop(true, true).animate({
						scrollLeft: this.scrollLeft - dx,
						scrollTop: this.scrollTop - dy
					},{ 
						queue: false, 
						duration: o.constants.scrollDuration, 
						easing: "cubicEaseOut"
					});
					
				}
				
				event.data.capture = event.data.position = undefined;
			}
			
			return !event.data.isDragging;
		},
		
		// determines what elements are clickable
		clickableRegExp: (/input|textarea|select|a/i),
		
		constants: {
			scrollDuration: 800,
			captureThreshold: 4,
			wheelDeltaMod: -200,
			scrollDeltaMod: 4.7
		}
		
	});

	// jQuery adapted Penner animation
	//    created by Jamie Lemon
	$.extend( $.easing, {
		
		cubicEaseOut: function(p, n, firstNum, diff) {
			var c = firstNum + diff;
			return c*((p=p/1-1)*p*p + 1) + firstNum;
		}
		
	});

})(jQuery);
