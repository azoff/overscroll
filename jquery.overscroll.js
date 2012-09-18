/**
 * Overscroll v1.6.4
 *  A jQuery Plugin that emulates the iPhone scrolling experience in a browser.
 *  http://azoffdesign.com/overscroll
 *
 * Intended for use with the latest jQuery
 *  http://code.jquery.com/jquery-latest.js
 *
 * Copyright 2012, Jonathan Azoff
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *  http://jquery.org/license
 *
 * For API documentation, see the README file
 *  http://azof.fr/pYCzuM
 *
 * Date: Thursday, October 10 2012
 */

/*jslint onevar: true, strict: true */

/*global window, document, setTimeout, clearTimeout, jQuery */

(function(global, dom, browser, math, wait, cancel, namespace, $, none){

	// We want to run this plug-in in strict-mode
	// so that we may benefit from any optimizations
	// strict execution
	'use strict';

	// The key used to bind-instance specific data to an object
	var datakey = 'overscroll',

	// runs feature detection for overscroll
	compat = (function(){
		var b  = $.browser, fallback,
		agent = browser.userAgent,
		style  = dom.createElement(datakey).style,
		prefix = b.webkit ? 'webkit' : (b.mozilla ? 'moz' : (b.msie ? 'ms' : (b.opera ? 'o' : ''))),
		cssprefix = prefix ? ['-','-'].join(prefix) : '';
		compat = { prefix: prefix, overflowScrolling: false };
		$.each(prefix ? [prefix, ''] : [prefix], function(i, prefix){
			var animator = prefix ? (prefix + 'RequestAnimationFrame') : 'requestAnimationFrame',
			scroller = prefix ? (prefix + 'OverflowScrolling') : 'overflowScrolling';

			// check to see if requestAnimationFrame is available
			if (global[animator] !== none) {
				compat.animate = function(callback){
					global[animator].call(global, callback);
				};
			}

			// check to see if overflowScrolling is available
			if (style[scroller] !== none) {
				// Chrome 19 introduced overflow scrolling. Unfortunately, their touch
				// implementation is incomplete. Hence, we act like it is not supported
				// for chrome. #59
				if (agent.indexOf('Chrome') < 0) {
					compat.overflowScrolling = cssprefix + 'overflow-scrolling';
				}
			}
		});

		// check to see if the client supports touch
		compat.touchEvents = 'ontouchstart' in global;

		// fallback to set timeout for no animation support
		if (!compat.animate) {
			compat.animate = function(callback) {
				wait(callback, 1000/60);
			};
		}

		// firefox and webkit browsers support native grabbing cursors
		if (prefix === 'moz' || prefix === 'webkit') {
			compat.cursorGrab     = cssprefix + 'grab';
			compat.cursorGrabbing = cssprefix + 'grabbing';

		// other browsers can user google's assets
		} else {
			fallback = 'https://mail.google.com/mail/images/2/';
			compat.cursorGrab     = 'url('+fallback+'openhand.cur), default';
			compat.cursorGrabbing = 'url('+fallback+'closedhand.cur), default';
		}
		return compat;
	})(),

	// These are all the events that could possibly
	// be used by the plug-in
	events = {
		drag:       'mousemove touchmove',
		end:        'mouseup mouseleave click touchend touchcancel',
		hover:      'mouseenter mouseleave',
		ignored:    'select dragstart drag',
		scroll:     'scroll',
		start:      'mousedown touchstart',
		wheel:      'mousewheel DOMMouseScroll'
	},

	// These settings are used to tweak drift settings
	// for the plug-in
	settings = {
		captureThreshold:   3,
		driftDecay:         1.1,
		driftSequences:     22,
		driftTimeout:       100,
		scrollDelta:        15,
		thumbOpacity:       0.7,
		thumbThickness:     6,
		thumbTimeout:       400,
		wheelDelta:         20
	},

	// These defaults are used to complement any options
	// passed into the plug-in entry point
	defaults = {
		cancelOn:       'select,input,textarea',
		direction:      'multi',
		dragHold:       false,
		hoverThumbs:    false,
		scrollDelta:    settings.scrollDelta,
		showThumbs:     true,
		persistThumbs:  false,
		wheelDelta:     settings.wheelDelta,
		wheelDirection: 'vertical',
		zIndex:         999
	},

	// Triggers a DOM event on the overscrolled element.
	// All events are namespaced under the overscroll name
	triggerEvent = function (event, target) {
		target.trigger('overscroll:' + event);
	},

	// Utility function to return a timestamp
	time = function() {
		return (new Date()).getTime();
	},

	// Captures the position from an event, modifies the properties
	// of the second argument to persist the position, and then
	// returns the modified object
	capturePosition = function (event, position, index) {
		position.x = event.pageX;
		position.y = event.pageY;
		position.time = time();
		position.index = index;
		return position;
	},

	// Used to move the thumbs around an overscrolled element
	moveThumbs = function (thumbs, sizing, left, top) {

		var ml, mt;

		if (thumbs && thumbs.added) {
			if (thumbs.horizontal) {
				ml = left * (1 + sizing.container.width / sizing.container.scrollWidth);
				mt = top + sizing.thumbs.horizontal.top;
				thumbs.horizontal.css('margin', mt + 'px 0 0 ' + ml + 'px');
			}
			if (thumbs.vertical) {
				ml = left + sizing.thumbs.vertical.left;
				mt = top * (1 + sizing.container.height / sizing.container.scrollHeight);
				thumbs.vertical.css('margin', mt + 'px 0 0 ' + ml + 'px');
			}
		}

	},

	// Used to toggle the thumbs on and off
	// of an overscrolled element
	toggleThumbs = function (thumbs, options, dragging) {
		if (thumbs && thumbs.added && !options.persistThumbs) {
			if (dragging) {
				if (thumbs.vertical) {
					thumbs.vertical.stop(true, true).fadeTo('fast', settings.thumbOpacity);
				}
				if (thumbs.horizontal) {
					thumbs.horizontal.stop(true, true).fadeTo('fast', settings.thumbOpacity);
				}
			} else {
				if (thumbs.vertical) {
					thumbs.vertical.fadeTo('fast', 0);
				}
				if (thumbs.horizontal) {
					thumbs.horizontal.fadeTo('fast', 0);
				}
			}
		}
	},

	// Defers click event listeners to after a mouseup event.
	// Used to avoid unintentional clicks
	deferClick = function (target) {
		var clicks, key = 'events';
		var events = $._data ? $._data(target[0], key) : target.data(key);
		if (events && events.click) {
			clicks = events.click.slice();
			target.off('click').one('click', function(event){
				$.each(clicks, function(i, click){
					target.click(click);
				}); return false;
			});
		}
	},

	// Toggles thumbs on hover. This event is only triggered
	// if the hoverThumbs option is set
	hover = function (event) {
		var data = event.data,
		thumbs   = data.thumbs,
		options  = data.options,
		dragging = event.type === 'mouseenter';
		toggleThumbs(thumbs, options, dragging);
	},

	// This function is only ever used when the overscrolled element
	// scrolled outside of the scope of this plugin.
	scroll = function (event) {
		var data = event.data;
		if (!data.flags.dragged) {
			moveThumbs(data.thumbs, data.sizing, this.scrollLeft, this.scrollTop);
		}
	},

	// handles mouse wheel scroll events
	wheel = function (event) {

		// prevent any default wheel behavior
		event.preventDefault();

		var data = event.data,
		options = data.options,
		sizing = data.sizing,
		thumbs = data.thumbs,
		wheel = data.wheel,
		flags = data.flags, delta,
		original = event.originalEvent;

		// stop any drifts
		flags.drifting = false;

		// calculate how much to move the viewport by
		// TODO: let's base this on some fact somewhere...
		if (original.wheelDelta) {
			delta = original.wheelDelta / (compat.prefix === 'o' ? -120 : 120);
		} if (original.detail) {
			delta = -original.detail / 3;
		} delta *= options.wheelDelta;

		// initialize flags if this is the first tick
		if (!wheel) {
			data.target.data(datakey).dragging = flags.dragging = true;
			data.wheel = wheel = { timeout: null };
			toggleThumbs(thumbs, options, true);
		}

		// actually modify scroll offsets
		if (options.wheelDirection === 'horizontal') {
			this.scrollLeft -= delta;
		} else {
			this.scrollTop -= delta;
		}

		if (wheel.timeout) { cancel(wheel.timeout); }

		moveThumbs(thumbs, sizing, this.scrollLeft, this.scrollTop);

		wheel.timeout = wait(function() {
			data.target.data(datakey).dragging = flags.dragging = false;
			toggleThumbs(thumbs, options, data.wheel = null);
		}, settings.thumbTimeout);

	},

	// updates the current scroll offset during a mouse move
	drag = function (event) {

		event.preventDefault();

		var data = event.data,
		touches  = event.originalEvent.touches,
		options  = data.options,
		sizing   = data.sizing,
		thumbs   = data.thumbs,
		position = data.position,
		flags    = data.flags,
		target   = data.target.get(0);


		// correct page coordinates for touch devices
		if (compat.touchEvents && touches && touches.length) {
			event = touches[0];
		}

		if (!flags.dragged) {
			toggleThumbs(thumbs, options, true);
		}

		flags.dragged = true;

		if (options.direction !== 'vertical') {
			target.scrollLeft -= (event.pageX - position.x);
		}

		if (data.options.direction !== 'horizontal') {
			target.scrollTop -= (event.pageY - position.y);
		}

		capturePosition(event, data.position);

		if (--data.capture.index <= 0) {
			data.target.data(datakey).dragging = flags.dragging = true;
			capturePosition(event, data.capture, settings.captureThreshold);
		}

		moveThumbs(thumbs, sizing, target.scrollLeft, target.scrollTop);

	},

	// sends the overscrolled element into a drift
	drift = function (target, event, callback) {

		var data   = event.data, dx, dy, xMod, yMod,
		capture    = data.capture,
		options    = data.options,
		sizing     = data.sizing,
		thumbs     = data.thumbs,
		elapsed    = time() - capture.time,
		scrollLeft = target.scrollLeft,
		scrollTop  = target.scrollTop,
		decay      = settings.driftDecay;

		// only drift if enough time has passed since
		// the last capture event
		if (elapsed > settings.driftTimeout) {
			return callback(data);
		}

		// determine offset between last capture and current time
		dx = options.scrollDelta * (event.pageX - capture.x);
		dy = options.scrollDelta * (event.pageY - capture.y);

		// update target scroll offsets
		if (options.direction !== 'vertical') {
			scrollLeft -= dx;
		} if (options.direction !== 'horizontal') {
			scrollTop -= dy;
		}

		// split the distance to travel into a set of sequences
		xMod = dx / settings.driftSequences;
		yMod = dy / settings.driftSequences;

		triggerEvent('driftstart', data.target);

		data.drifting = true;

		// animate the drift sequence
		compat.animate(function render() {
			if (data.drifting) {
				var min = 1, max = -1;
				data.drifting = false;
				if (yMod > min && target.scrollTop > scrollTop || yMod < max && target.scrollTop < scrollTop) {
					data.drifting = true;
					target.scrollTop -= yMod;
					yMod /= decay;
				}
				if (xMod > min && target.scrollLeft > scrollLeft || xMod < max && target.scrollLeft < scrollLeft) {
					data.drifting = true;
					target.scrollLeft -= xMod;
					xMod /= decay;
				}
				moveThumbs(thumbs, sizing, target.scrollLeft, target.scrollTop);
				compat.animate(render);
			} else {
				triggerEvent('driftend', data.target);
				callback(data);
			}
		});

	},

	// starts the drag operation and binds the mouse move handler
	start = function (event) {

		var data = event.data,
		target   = data.target,
		start    = data.start = $(event.target),
		flags    = data.flags;

		// stop any drifts
		flags.drifting = false;

		// only start drag if the user has not explictly banned it.
		if (start.size() && !start.is(data.options.cancelOn)) {

			// without this the simple "click" event won't be recognized on touch clients
			if (!compat.touchEvents) {
				event.preventDefault();
			}

			target.css('cursor', compat.cursorGrabbing);
			target.data(datakey).dragging = flags.dragging = flags.dragged = false;

			// apply the drag listeners to the doc or target
			if(data.options.dragHold) {
				$(document).on(events.drag, data, drag);
			} else {
				target.on(events.drag, data, drag);
			}

			data.position = capturePosition(event, {});
			data.capture = capturePosition(event, {}, settings.captureThreshold);
			triggerEvent('dragstart', target);
		}

	},

	// ends the drag operation and unbinds the mouse move handler
	stop = function (event) {

		var data = event.data,
		target = data.target,
		options = data.options,
		flags = data.flags,
		thumbs = data.thumbs,

		// hides the thumbs after the animation is done
		done = function () {
			if (thumbs && !options.hoverThumbs) {
				toggleThumbs(thumbs, options, false);
			}
		};

		// remove drag listeners from doc or target
		if(options.dragHold) {
			$(document).unbind(events.drag, drag);
		} else {
			target.unbind(events.drag, drag);
		}

		// only fire events and drift if we started with a
		// valid position
		if (data.position) {

			triggerEvent('dragend', target);

			// only drift if a drag passed our threshold
			if (flags.dragging) {
				drift(target.get(0), event, done);
			} else {
				done();
			}

		}

		// only if we moved, and the mouse down is the same as
		// the mouse up target do we defer the event
		if (flags.dragging && data.start.is(event.target)) {
			deferClick(data.start);
		}

		// clear all internal flags and settings
		target.data(datakey).dragging =
			data.start     =
			data.capture   =
			data.position  =
			flags.dragged  =
			flags.dragging = false;

		// set the cursor back to normal
		target.css('cursor', compat.cursorGrab);

	},

	// Ensures that a full set of options are provided
	// for the plug-in. Also does some validation
	getOptions = function(options) {

		// fill in missing values with defaults
		options = $.extend({}, defaults, options);

		// check for inconsistent directional restrictions
		if (options.direction !== 'multi' && options.direction !== options.wheelDirection) {
			options.wheelDirection = options.direction;
		}

		// ensure positive values for deltas
		options.scrollDelta = math.abs(options.scrollDelta);
		options.wheelDelta  = math.abs(options.wheelDelta);

		// fix values for scroll offset
		options.scrollLeft = options.scrollLeft === none ? null : math.abs(options.scrollLeft);
		options.scrollTop  = options.scrollTop  === none ? null : math.abs(options.scrollTop);

		return options;

	},

	// Returns the sizing information (bounding box) for the
	// target DOM element
	getSizing = function (target) {

		var $target  = $(target),
		width        = $target.width(),
		height       = $target.height(),
		scrollWidth  = width >= target.scrollWidth ? width : target.scrollWidth,
		scrollHeight = height >= target.scrollHeight ? height : target.scrollHeight,
		hasScroll    = scrollWidth > width || scrollHeight > height;

		return {
			valid: hasScroll,
			container: {
				width: width,
				height: height,
				scrollWidth: scrollWidth,
				scrollHeight: scrollHeight
			},
			thumbs: {
				horizontal: {
					width: width * width / scrollWidth,
					height: settings.thumbThickness,
					corner: settings.thumbThickness / 2,
					left: 0,
					top: height - settings.thumbThickness
				},
				vertical: {
					width: settings.thumbThickness,
					height: height * height / scrollHeight,
					corner: settings.thumbThickness / 2,
					left: width - settings.thumbThickness,
					top: 0
				}
			}
		};

	},

	// Attempts to get (or implicitly creates) the
	// remover function for the target passed
	// in as an argument
	getRemover = function (target, orCreate) {

		var $target = $(target), thumbs,
		data        = $target.data(datakey) || {},
		style       = $target.attr('style'),
		fallback    = orCreate ? function () {

			data = $target.data(datakey);
			thumbs = data.thumbs;

			// restore original styles (if any)
			if (style) {
				$target.attr('style', style);
			} else {
				$target.removeAttr('style');
			}

			// remove any created thumbs
			if (thumbs) {
				if (thumbs.horizontal) { thumbs.horizontal.remove(); }
				if (thumbs.vertical)   { thumbs.vertical.remove();   }
			}

			// remove any bound overscroll events and data
			$target
				.removeData(datakey)
				.off(events.wheel,      wheel)
				.off(events.start,      start)
				.off(events.end,        stop)
				.off(events.ignored,    false);

		} : $.noop;

		return $.isFunction(data.remover) ? data.remover : fallback;

	},

	// Genterates CSS specific to a particular thumb.
	// It requires sizing data and options
	getThumbCss = function(size, options) {
		return {
			position: 'absolute',
			opacity: options.persistThumbs ? settings.thumbOpacity : 0,
			'background-color': 'black',
			width: size.width + 'px',
			height: size.height + 'px',
			'border-radius': size.corner + 'px',
			'margin': size.top + 'px 0 0 ' + size.left + 'px',
			'z-index': options.zIndex
		};
	},

	// Creates the DOM elements used as "thumbs" within
	// the target container.
	createThumbs = function(target, sizing, options) {

		var div = '<div/>',
		thumbs  = {},
		css     = false;

		if (sizing.container.scrollWidth > 0 && options.direction !== 'vertical') {
			css = getThumbCss(sizing.thumbs.horizontal, options);
			thumbs.horizontal = $(div).css(css).prependTo(target);
		}

		if (sizing.container.scrollHeight > 0 && options.direction !== 'horizontal') {
			css = getThumbCss(sizing.thumbs.vertical, options);
			thumbs.vertical = $(div).css(css).prependTo(target);
		}

		thumbs.added = !!css;

		return thumbs;

	},

	// This function takes a jQuery element, some
	// (optional) options, and sets up event metadata
	// for each instance the plug-in affects
	setup = function(target, options) {

		// create initial data properties for this instance
		options = getOptions(options);
		var sizing = getSizing(target),
		thumbs, data = {
			options: options, sizing: sizing,
			flags: { dragging: false },
			remover: getRemover(target, true)
		};

		// only apply handlers if the overscrolled element
		// actually has an area to scroll
		if (sizing.valid) {
			// provide a circular-reference, enable events, and
			// apply any required CSS
			data.target = target = $(target).css({
				position: 'relative',
				overflow: 'hidden',
				cursor: compat.cursorGrab
			}).on(events.wheel, data, wheel)
			  .on(events.start, data, start)
			  .on(events.end, data, stop)
			  .on(events.scroll, data, scroll)
			  .on(events.ignored, false);

			// apply the stop listeners for drag end
			if(options.dragHold) {
				$(document).on(events.end, data, stop);
			} else {
				data.target.on(events.end, data, stop);
			}

			// apply any user-provided scroll offsets
			if (options.scrollLeft !== null) {
				target.scrollLeft(options.scrollLeft);
			} if (options.scrollTop !== null) {
				target.scrollTop(options.scrollTop);
			}

			// add thumbs and listeners (if we're showing them)
			if (options.showThumbs) {
				data.thumbs = thumbs = createThumbs(target, sizing, options);
				if (thumbs.added) {
					moveThumbs(thumbs, sizing, target.scrollLeft(), target.scrollTop());
					if (options.hoverThumbs) {
						target.on(events.hover, data, hover);
					}
				}
			}

			target.data(datakey, data);
		}

	},

	// Removes any event listeners and other instance-specific
	// data from the target. It attempts to leave the target
	// at the state it found it.
	teardown = function(target) {
		getRemover(target)();
	},

	// This is the entry-point for enabling the plug-in;
	// You can find it's exposure point at the end
	// of this closure
	overscroll = function(options) {
		return this.removeOverscroll().each(function() {
			setup(this, options);
		});
	},

	// This function applies touch-specific CSS to enable
	// the behavior that Overscroll emulates. This function is
	// called instead of overscroll if the device supports it
	touchscroll = function(options) {
		return this.removeOverscroll().each(function() {
			var target = $(this).data(datakey, {
				remover: getRemover(this)
			}).css(compat.overflowScrolling, 'touch')
			  .css('overflow', 'auto');
			options = getOptions(options);
			if (options.scrollLeft !== null) {
				target.scrollLeft(options.scrollLeft);
			} if (options.scrollTop !== null) {
				target.scrollTop(options.scrollTop);
			}
		});
	},

	// This is the entry-point for disabling the plug-in;
	// You can find it's exposure point at the end
	// of this closure
	removeOverscroll = function() {
		return this.each(function () {
			teardown(this);
		});
	};

	// Extend overscroll to expose settings to the user
	overscroll.settings = settings;

	// Extend jQuery's prototype to expose the plug-in.
	// If the supports native overflowScrolling, overscroll will not
	// attempt to override the browser's built in support
	$.extend(namespace, {
		overscroll:         compat.overflowScrolling ? touchscroll : overscroll,
		removeOverscroll:   removeOverscroll
	});

})(window, document, navigator, Math, setTimeout, clearTimeout, jQuery.fn, jQuery);
