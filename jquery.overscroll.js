/*!
 * Overscroll v1.4.3
 *  A jQuery Plugin that emulates the iPhone scrolling experience in a browser.
 *  http://azoffdesign.com/overscroll
 *
 * Intended for use with the latest jQuery
 *  http://code.jquery.com/jquery-latest.js
 *
 * Copyright 2011, Jonathan Azoff
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *  http://jquery.org/license
 *
 * For API documentation, see the README file
 *  https://github.com/azoff/Overscroll/blob/master/README.md
 *
 * Date: Saturday, April 23rd 2011
 */

/*jslint onevar: true, strict: true */
/*global window, jQuery */
"use strict"; 

(function(w, m, $, o){

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
			ignored: "dragstart drag"
		},
		
		// to save a couple bits
		div: "<div/>",
		noop: function(){return false;},
		
		// constants used to tune scroll-ability and thumbs
		constants: {
            driftFrequency: 40, // 20 FPS
			driftSequences: 22,
            driftDecay: 1.15,
			timeout: 400,
			captureThreshold: 3,
			wheelDelta: 20,
			scrollDelta: 15,
			thumbThickness: 8,
			thumbOpacity: 0.7,
			boundingBox: 1000000
		},

        checkIosDevice: function() {
            if (o.isIOS === undefined) {				
                o.isIOS = /iP((hone)|(ad)|(od))/.test(navigator.platform);
            }
            return o.isIOS;
        },
		
		// main initialization function
		init: function(target, options, data) {
			
			data = { sizing: o.getSizing(target) };
			
			options = $.extend({
				showThumbs: true,
				wheelDirection: 'vertical',
                cursor: 'move',
				wheelDelta: o.constants.wheelDelta,
				scrollDelta: o.constants.scrollDelta,
				direction: 'multi',
				cancelOn: ''
			}, (options || {}));
			
			options.scrollDelta = m.abs(options.scrollDelta);
			options.wheelDelta = m.abs(options.wheelDelta);
			
			target.css({
			    'position': 'relative',
                'overflow': 'hidden',
                'cursor': options.cursor
            })
            .bind(o.events.wheel, data, o.wheel)
		    .bind(o.events.start, data, o.start)
			.bind(o.events.end, data, o.stop)
			.bind(o.events.ignored, o.noop); // disable proprietary drag handlers
				
			if(options.showThumbs) {
				
				data.thumbs = {};
								
				if(data.sizing.container.scrollWidth > 0 && options.direction !== 'vertical') {
					data.thumbs.horizontal = $(o.div).css(o.getThumbCss(data.sizing.thumbs.horizontal)).fadeTo(0, 0);
					target.prepend(data.thumbs.horizontal);	
				}
				
				if(data.sizing.container.scrollHeight > 0 && options.direction !== 'horizontal') {
					data.thumbs.vertical = $(o.div).css(o.getThumbCss(data.sizing.thumbs.vertical)).fadeTo(0, 0);
					target.prepend(data.thumbs.vertical);				
				}

			}
			
			data.target = target;
			data.options = options;
				
		},
		
		triggerEvent: function(event, data) {
			data.target.trigger('overscroll:' + event);
		},
		
		// toggles the drag mode of the target
		toggleThumbs: function(data, dragging) {
	        if(data.thumbs) {
                if(dragging) {
                    if(data.thumbs.vertical) {
                        data.thumbs.vertical.stop(true, true).fadeTo("fast", o.constants.thumbOpacity);
                    }
                    if(data.thumbs.horizontal) {
                        data.thumbs.horizontal.stop(true, true).fadeTo("fast", o.constants.thumbOpacity);
                    }
                } else {
                    if(data.thumbs.vertical) {
                        data.thumbs.vertical.fadeTo("fast", 0);
                    }
                    if(data.thumbs.horizontal) {
                        data.thumbs.horizontal.fadeTo("fast", 0);
                    }
                }
		    }
		},
		
		// sets a position object
		setPosition: function(event, position, index) {
		    position.x = event.pageX;
		    position.y = event.pageY;
		    position.index = index;
		    return position;
		},
		
		// handles mouse wheel scroll events
		wheel: function(event, delta) {

            o.clearInterval();

			if ( event.wheelDelta ) { 
		        delta = event.wheelDelta/ (w.opera ? -120 : 120);
		    }
		    
		    if ( event.detail ) { 
		        delta = -event.detail/3; 
		    }
		    
		    if(!event.data.wheelCapture) {
		        event.data.wheelCapture = { timeout: null };
		        o.toggleThumbs(event.data, true);
		        event.data.target.stop(true, true).data('dragging', true);
		    }
		    
		    delta *= event.data.options.wheelDelta;
		    
		    if(event.data.options.wheelDirection === 'horizontal') {
		        this.scrollLeft -= delta;
		    } else {
		        this.scrollTop -= delta;
		    }

            o.moveThumbs(event, this.scrollLeft, this.scrollTop);
		    
		    if(event.data.wheelCapture.timeout) {
		        clearTimeout(event.data.wheelCapture.timeout);
		    }
		    
		    event.data.wheelCapture.timeout = setTimeout(function(d){
		        event.data.wheelCapture = undefined;
		        o.toggleThumbs(event.data, false);
		        event.data.target.data('dragging', false);
		    }, o.constants.timeout);
		
			return false;
			
		},
		
		// handles a scroll event
		moveThumbs: function(event, left, top, thumbs, sizing, ml, mt) {

            if (event.data.options.showThumbs) {

                thumbs = event.data.thumbs;
                sizing = event.data.sizing;

                if (thumbs.horizontal) {
                    ml = left * (1 + sizing.container.width / sizing.container.scrollWidth);
                    mt = top + sizing.thumbs.horizontal.top;
                    thumbs.horizontal.css("margin", mt + "px 0 0 " + ml + "px");
                }

                if (thumbs.vertical) {
                    ml = left + sizing.thumbs.vertical.left;
                    mt = top * (1 + sizing.container.height / sizing.container.scrollHeight);
                    thumbs.vertical.css("margin", mt + "px 0 0 " + ml + "px");
                }

            }
        
        },
		
		// starts the drag operation and binds the mouse move handler
		start: function(event) {

            o.clearInterval();

            if (!$(event.target).is(event.data.options.cancelOn)) {               
                o.normalizeEvent(event);
                event.data.target.bind(o.events.drag, event.data, o.drag).stop(true, true).data('dragging', false);
                event.data.position = o.setPosition(event, {});
                event.data.capture = o.setPosition(event, {}, 2);
				o.triggerEvent('dragstart', event.data);
                return false;
            }
			
		},
		
		// updates the current scroll location during a mouse move
		drag: function(event, ml, mt, left, top) {

            o.normalizeEvent(event);

            if (!event.data.target.data('dragging')) {
                 o.toggleThumbs(event.data, true);
            }

			if (event.data.options.direction !== 'vertical') {
			   this.scrollLeft -= (event.pageX - event.data.position.x);
			}

			if (event.data.options.direction !== 'horizontal') {
			   this.scrollTop -= (event.pageY - event.data.position.y);
			}

            o.moveThumbs(event, this.scrollLeft, this.scrollTop);
			
			o.setPosition(event, event.data.position);
			
			if (--event.data.capture.index <= 0 ) {
			    event.data.target.data('dragging', true);
			    o.setPosition(event, event.data.capture, o.constants.captureThreshold);
			}

			return true;
		
		},

        normalizeEvent: function(event) {
            if (o.checkIosDevice()) {
                var iosEvent = event.originalEvent.changedTouches[0];
                event.pageX = iosEvent.pageX;
                event.pageY = iosEvent.pageY;
            }
        },
		
		// ends the drag operation and unbinds the mouse move handler
		stop: function(event, dx, dy, d) {

			if(event.data.position) {

				event.data.target.unbind(o.events.drag, o.drag);
				
				o.triggerEvent('dragend', event.data);
				
				if(event.data.target.data('dragging')) {
				 
				    o.drift(this, event, function(data){
                        data.target.data('dragging', false);
                        o.toggleThumbs(data, false);
                    });

				} else {
				     o.toggleThumbs(event.data, false);
				}
                
                event.data.capture = event.data.position = undefined;
                
			}
			
			return !event.data.target.data('dragging');
		},

        clearInterval: function() {
            if (o.driftInterval) { w.clearInterval(o.driftInterval); }
        },

        setInterval: function(interval) {
            o.driftInterval = interval;
        },

        // sends the overscrolled element into a drift
        drift: function(target, event, callback) {

            o.normalizeEvent(event);

            var dx = event.data.options.scrollDelta * (event.pageX - event.data.capture.x),
                dy = event.data.options.scrollDelta * (event.pageY - event.data.capture.y),
                scrollLeft = target.scrollLeft, scrollTop = target.scrollTop,
                xMod = dx/o.constants.driftSequences,
                yMod = dy/o.constants.driftSequences,
                decay = o.constants.driftDecay;

            if(event.data.options.direction !== 'vertical') {
                scrollLeft -= dx;
            }

            if(event.data.options.direction !== 'horizontal') {
                scrollTop -= dy;
            }

			o.triggerEvent('driftstart', event.data);

            o.setInterval(w.setInterval(function() {

                var done = true, min = 1, max = -1;

                if (yMod > min && target.scrollTop > scrollTop ||
                    yMod < max && target.scrollTop < scrollTop) {
                    done = false;
                    target.scrollTop -= yMod;
                    yMod /= decay;
                }

                if (xMod > min && target.scrollLeft > scrollLeft ||
                    xMod < max && target.scrollLeft < scrollLeft) {
                    done = false;
                    target.scrollLeft -= xMod;
                    xMod /= decay;
                }

                o.moveThumbs(event, target.scrollLeft, target.scrollTop);

                if (done) {
                    o.clearInterval();
					o.triggerEvent('driftend', event.data);
                    callback.call(null, event.data);
                }

            }, o.constants.driftFrequency));

        },
		
		// gets sizing for the container and thumbs
		getSizing: function(container, sizing) {
		
			sizing = { };
			
			sizing.container = {
				width: container.width(),
				height: container.height()
			};
			
			container.scrollLeft(o.constants.boundingBox).scrollTop(o.constants.boundingBox);
			sizing.container.scrollWidth = container.scrollLeft();
			sizing.container.scrollHeight = container.scrollTop();							
			container.scrollTop(0).scrollLeft(0);
					
			sizing.thumbs = {
				horizontal: {
					width: sizing.container.width * sizing.container.width / sizing.container.scrollWidth,
					height: o.constants.thumbThickness,
					corner: o.constants.thumbThickness / 2,
					left: 0,
					top: sizing.container.height - o.constants.thumbThickness
				},
				vertical: {
					width: o.constants.thumbThickness,
					height: sizing.container.height * sizing.container.height / sizing.container.scrollHeight,
					corner: o.constants.thumbThickness / 2,
					left: sizing.container.width - o.constants.thumbThickness,
					top: 0
				}
			};
			
			sizing.container.width -= sizing.thumbs.horizontal.width;
			sizing.container.height -= sizing.thumbs.vertical.height;
			
			return sizing;
			
		},
		
		// gets the CSS object for a thumb
		getThumbCss: function(size) {
		
			return {
				position: "absolute",
				"background-color": "black",
				width: size.width + "px",
				height: size.height + "px",
				"margin": size.top + "px 0 0 " + size.left + "px",
				"-moz-border-radius": size.corner + "px",
				"-webkit-border-radius":  size.corner + "px", 
				"border-radius":  size.corner + "px"
			};
			
		}
		
	});

})(window, Math, jQuery);