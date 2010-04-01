/*!
 * Overscroll v1.3.0
 *  A jQuery Plugin for emulating the iPhone scrolling experience in a browser.
 *  http://azoffdesign.com/plugins/js/overscroll
 *
 * Intended for use with the latest jQuery
 *  http://code.jquery.com/jquery-latest.min.js
 *
 * Copyright 2010, Jonathan Azoff
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *  http://jquery.org/license
 *
 * Date: Wednesday, March 31st 2010
 */

/* 
 * Usage:
 * 
 * $(selector).overscroll([options]);
 *  "options" is an optional JavaScript object that you may pass if you would like to customize
 *  the experience of the overscroll element. Below is a list of properties that you may set on
 *  the options object and their respective effect:
 *   - options.showThumbs   {Boolean} Designates whether or not to show the scroll-bar thumbs
 *                                    on the scrollable container (default true).
 *   - options.openedCursor {String}  A url pointing at a .cur file to be used as the cursor when
 *                                    hovering over the overscrolled element (default 'opened.cur').
 *   - options.closedCursor {String}  A url pointing at a .cur file to be used as the cursor when
 *                                    dragging the overscrolled element (default 'closed.cur').
 *
 * Notes:
 * 
 * In order to get the most out of this plugin, make sure to only apply it to parent elements 
 * that are smaller than the collective width and/or height then their children. This way,
 * you can see the actual scroll effect as you pan the element.
 *
 * You MUST have two cursors to get the "hand" to show up, open, and close during the panning 
 * process. You can store the cursors wherever you want, just make sure to reference them in 
 * the code below. I have provided initial static linkages to these cursors for your 
 * convenience.        
 *
 * Changelog:
 *
 * 1.3.0
 *   - Merged iThumbs and Overscroll
 *   - Added the ability to pass in options
 *	 - Moved all code to GitHub
 *   - Several improvements to the thumb code
 *   - Greased up the scroll a bit more
 *   - Removed the jerky animation on mouse wheel
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
 */

/*jslint onevar: true, strict: true */
/*global jQuery: false */
"use strict"; 

(function($, o){

	// create overscroll
	o = $.fn.overscroll = function(options) {
		return this.each(function(){
			o.init($(this), options);
		});
	};
	
	$.extend(o, {
		
		// events handled by overscroll
		events: {
			wheel: "mousewheel DOMMouseScroll",
			start: "select mousedown touchstart",
			drag: "mousemove touchmove",
			end: "mouseup mouseleave touchend",
			scroll: "scroll",
			ignored: "dragstart drag"
		},
		
		// to save a couble bits
		div: "<div/>",
		
		// helper element used to determine container size
		clearfixElement: $(o.div).css({
			display: "block",
			clear: "both",
			"line-height": 0,
			height: 0,
			padding: 0,
			margin: 0
		}).html("."),
		
		// constants used to tune scrollability and thumbs
		constants: {
			scrollDuration: 800,
			captureThreshold: 4,
			wheelDeltaMod: -18,
			scrollDeltaMod: 5.7,
			thumbThickness: 8,
			thumbOpacity: 0.7
		},
		
		// main initialization function
		init: function(target, options, data) {
			
			data = {
				sizing: o.getSizing(target)
			};
			
			options = $.extend({
				openedCursor: "http://github.com/downloads/azoff/Overscroll/opened.cur",
				closedCursor: "http://github.com/downloads/azoff/Overscroll/closed.cur",
				showThumbs: true								
			}, (options || {}));
			
			target.css({"cursor":"url("+options.openedCursor+"), default", "overflow": "hidden"})
				.scrollTop(0).scrollLeft(0)
				.bind(o.events.wheel, data, o.wheel)
				.bind(o.events.start, data, o.start)
				.bind(o.events.end, data, o.stop)
				.bind(o.events.ignored, function(){return false;}); // disable proprietary drag handlers
				
			if(options.showThumbs) {
				
				data.thumbs = { visible: false };
								
				if(data.sizing.container.actual.width > data.sizing.container.current.width) {
					data.thumbs.horizontal = $(o.div).css(o.getThumbCss(data.sizing.thumbs.horizontal)).fadeTo(0, 0);
					target.append(data.thumbs.horizontal);	
				}
				
				if(data.sizing.container.actual.height > data.sizing.container.current.height) {
					data.thumbs.vertical = $(o.div).css(o.getThumbCss(data.sizing.thumbs.vertical)).fadeTo(0, 0);
					target.append(data.thumbs.vertical);				
				}

				data.marker = { target: target.children(":first-child") };
				data.marker.left = data.marker.target.position().left;
				data.marker.top = data.marker.target.position().top;

				target.bind(o.events.scroll, data, o.scroll);
			}
			
			data.target = target;
			data.options = options;
				
		},
		
		// handles mouse wheel scroll events
		wheel: function(event, delta) {
			
			if ( event.wheelDelta ) { delta = event.wheelDelta/12000; }
			if ( event.detail     ) { delta = -event.detail/3; }
			
			event.data.target.scrollTop(event.data.target.scrollTop() - (delta * o.constants.wheelDeltaMod));
			
			return false;
			
		},
		
		// starts the drag operation and binds the mouse move handler
		start: function(event) {
			
			event.data.target
				.css("cursor", "url("+event.data.options.closedCursor+"), default")
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
				
				if(event.data.thumbs && !event.data.thumbs.visible) {
					event.data.thumbs.visible = true;
					if(event.data.thumbs.vertical) {
						event.data.thumbs.vertical.stop(true, true).fadeTo("fast", o.constants.thumbOpacity);
					}
					if(event.data.thumbs.horizontal) {
						event.data.thumbs.horizontal.stop(true, true).fadeTo("fast", o.constants.thumbOpacity);
					}
				}
			}

			return true;
		
		},
		
		// called after a scroll event, moves the thumbs
		scroll: function(event, position) {
		
			position = event.data.marker.target.position();
			position.dx = (event.data.marker.left - position.left);
			position.dy = (event.data.marker.top - position.top);
			position.topHorizontal = position.dy + event.data.sizing.container.current.height - o.constants.thumbThickness;
			position.leftVertical = position.dx + event.data.sizing.container.current.width - o.constants.thumbThickness;
			
			if (event.data.thumbs.horizontal) {
				position.left = 
				position.dx * (1 + event.data.sizing.container.current.width / event.data.sizing.container.actual.width);
				event.data.thumbs.horizontal.css("margin", position.topHorizontal + "px 0 0 " + position.left + "px");	
			}
			
			if (event.data.thumbs.vertical) {
				position.top = 
				position.dy * (1 + event.data.sizing.container.current.height / event.data.sizing.container.actual.height);
				event.data.thumbs.vertical.css("margin", position.top + "px 0 0 " + position.leftVertical + "px");
			}

		},
		
		// ends the drag operation and unbinds the mouse move handler
		stop: function(event, dx, dy) {

			if( typeof event.data.position !== "undefined" ) {

				event.data.target
					.css("cursor", "url("+event.data.options.openedCursor+"), default")
					.unbind(o.events.drag, o.drag);
				
				if ( event.data.isDragging ) {	
					
					dx = o.constants.scrollDeltaMod * (event.pageX - event.data.capture.x);
					dy = o.constants.scrollDeltaMod * (event.pageY - event.data.capture.y);
					
					event.data.target.stop(true, true).animate({
						scrollLeft: this.scrollLeft - dx,
						scrollTop: this.scrollTop - dy
					},{ 
						queue: false, 
						duration: o.constants.scrollDuration, 
						easing: "cubicEaseOut",
						complete: function() {
							if(event.data.thumbs && event.data.thumbs.visible) {
								event.data.thumbs.visible = false;
								if(event.data.thumbs.vertical) {
									event.data.thumbs.vertical.stop(true, true).fadeTo("fast", 0);
								}
								if(event.data.thumbs.horizontal) {
									event.data.thumbs.horizontal.stop(true, true).fadeTo("fast", 0);
								}
							}
						}
					});
					
				}
				
				event.data.capture = event.data.position = undefined;
			}
			
			return !event.data.isDragging;
		},
		
		// gets sizing for the container and thumbs
		getSizing: function(container, sizing) {
			
			container.css({
				overflow: "visible", 
				height: "auto", 
				position: "absolute", 
				visibility: "hidden"
			}).append(o.clearfixElement);
			
			sizing = {
				container: {
					actual: {
						height: container.height()
					}
				}	
			};
			
			sizing.container.actual.width = container.css({width: "auto", height: ""}).width();
			
			o.clearfixElement.remove();
			
			container.css({overflow: "hidden", width: "", position: "", visibility: "visible"});
			
			sizing.container.current = {
				width: container.width(),
				height: container.height()
			};
			
			sizing.thumbs = {
				horizontal: {
					width: sizing.container.current.width * sizing.container.current.width / sizing.container.actual.width,
					height: o.constants.thumbThickness,
					corner: o.constants.thumbThickness / 2
				},
				vertical: {
					width: o.constants.thumbThickness,
					height: sizing.container.current.height * sizing.container.current.height / sizing.container.actual.height,
					corner: o.constants.thumbThickness / 2
				}
			};
			
			return sizing;
			
		},
		
		// gets the CSS object for a thumb
		getThumbCss: function(size) {
		
			return {
				position: "absolute",
				"background-color": "black",
				width: size.width + "px",
				height: size.height + "px", 
				"-moz-border-radius": size.corner + "px",
				"-webkit-border-radius":  size.corner + "px", 
				"border-radius":  size.corner + "px" 
			};
			
		}
		
	});

	// jQuery adapted Penner animation
	//    created by Jamie Lemon
	$.extend($.easing, {
		
		cubicEaseOut: function(p, n, firstNum, diff) {
			var c = firstNum + diff;
			return c*((p=p/1-1)*p*p + 1) + firstNum;
		}
		
	});

})(jQuery);