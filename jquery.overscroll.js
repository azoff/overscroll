/**@license
 * Overscroll v1.5.0
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
 *  http://azof.fr/pYCzuM
 *
 * Date: Saturday, November 5th 2011
 */

/*jslint onevar: true, strict: true */

/*global window, jQuery */

(function (w, m, $, o) {
    
    "use strict";

    // adds overscroll from a jQuery object
    o = $.fn.overscroll = function (options) {
        options = options || {};
        return this.each(function () {
            o.init($(this), options);
        });
    };

    // removes overscroll from a jQuery object
    $.fn.removeOverscroll = function (options) {
        return this.each(function () {
            var remover = $(this).data(o.removerKey);            
            if ($.isFunction(remover)) {
                remover();
            }
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
        div: '<div/>',
        removerKey: 'overscroll-remover',

        // constants used to tune scroll-ability and thumbs
        constants: {
            driftFrequency: 40,
            // 20 FPS
            driftSequences: 22,
            driftDecay: 1.15,
            driftTimeout: 100,
            timeout: 400,
            captureThreshold: 3,
            wheelDelta: 20,
            scrollDelta: 15,
            thumbThickness: 6,
            thumbOpacity: 0.7
        },

        // main initialization function
        init: function (target, options) {

            var data = {
                sizing: o.getSizing(target),
                flags: {}, cleaned: {}
            };

            data.options = options = $.extend({
                showThumbs: true,
                persistThumbs: false,
                wheelDirection: 'vertical',
                cursor: w.opera ? 'move' : 'all-scroll',
                wheelDelta: o.constants.wheelDelta,
                scrollDelta: o.constants.scrollDelta,
                direction: 'multi',
                cancelOn: ''
            }, options);

            // check for inconsistent directional restrictions
            if (options.direction !== 'multi' && options.direction !== options.wheelDirection) {
                options.wheelDirection = options.direction;
            }

            options.scrollDelta = m.abs(options.scrollDelta);
            options.wheelDelta = m.abs(options.wheelDelta);

            // remove any old bindings and set up a deconstructor
            target.removeOverscroll();
            target.data(o.removerKey, o.remover(target, data));

            data.target = target.css({
                position: 'relative',
                overflow: 'hidden',
                cursor: options.cursor
            }).on(o.events.wheel, data, o.wheel)
              .on(o.events.start, data, o.start)
              .on(o.events.end, data, o.stop)
              .on(o.events.ignored, false);
              
            if (options.showThumbs) {

                data.thumbs = {};

                if (data.sizing.container.scrollWidth > 0 && options.direction !== 'vertical') {
                    data.thumbs.horizontal = $(o.div).css(o.getThumbCss(data.sizing.thumbs.horizontal))
                                .css({ opacity: options.persistThumbs ? o.constants.thumbOpacity : 0 });
                    target.prepend(data.thumbs.horizontal);
                }

                if (data.sizing.container.scrollHeight > 0 && options.direction !== 'horizontal') {
                    data.thumbs.vertical = $(o.div).css(o.getThumbCss(data.sizing.thumbs.vertical))
                                .css({ opacity: options.persistThumbs ? o.constants.thumbOpacity : 0 });
                    target.prepend(data.thumbs.vertical);
                }

            }
            
            // if scroll offsets are defined, apply them here
            if (options.scrollLeft) {
                target.scrollLeft(options.scrollLeft);
            }
            if (options.scrollTop) {
                target.scrollTop(options.scrollTop);
            }
            
            o.moveThumbs(data, target.scrollLeft(), target.scrollTop());

        },

        remover: function (target, data) {
            return function () {
                target
                  .removeAttr('style')
                  .removeData(o.removerKey)
                  .off(o.events.wheel, o.wheel)
                  .off(o.events.start, o.start)
                  .off(o.events.end, o.stop)
                  .off(o.events.ignored, false);
                if (data.thumbs) {
                    if (data.thumbs.horizontal) {
                        data.thumbs.horizontal.remove();
                    }
                    if (data.thumbs.vertical) {
                        data.thumbs.vertical.remove();
                    }
                }
            };
        },

        triggerEvent: function (event, data) {
            data.target.trigger('overscroll:' + event);
        },

        // toggles the drag mode of the target
        toggleThumbs: function (data, dragging) {
            if (data.thumbs && !data.options.persistThumbs) {
                if (dragging) {
                    if (data.thumbs.vertical) {
                        data.thumbs.vertical.stop(true, true).fadeTo("fast", o.constants.thumbOpacity);
                    }
                    if (data.thumbs.horizontal) {
                        data.thumbs.horizontal.stop(true, true).fadeTo("fast", o.constants.thumbOpacity);
                    }
                } else {
                    if (data.thumbs.vertical) {
                        data.thumbs.vertical.fadeTo("fast", 0);
                    }
                    if (data.thumbs.horizontal) {
                        data.thumbs.horizontal.fadeTo("fast", 0);
                    }
                }
            }
        },

        // sets a position object
        setPosition: function (event, position, index) {
            position.x = event.pageX;
            position.y = event.pageY;
            position.time = o.time();
            position.index = index;
            return position;
        },

        // handles mouse wheel scroll events
        wheel: function (event, delta) { var 
            
            data = event.data, 
            
            original = event.originalEvent;

            event.preventDefault();

            o.clearInterval(data.target);

            if (original.wheelDelta) {
                delta = original.wheelDelta / (w.opera ? - 120 : 120);
            }

            if (original.detail) {
                delta = -original.detail / 3;
            }

            if (!data.wheelCapture) {
                data.wheelCapture = { timeout: null };
                o.toggleThumbs(data, true);
                data.target.stop(true, data.flags.dragging = true);
            }

            delta *= data.options.wheelDelta;

            if (data.options.wheelDirection === 'horizontal') {
                this.scrollLeft -= delta;
            } else {
                this.scrollTop -= delta;
            }

            o.moveThumbs(data, this.scrollLeft, this.scrollTop);

            if (data.wheelCapture.timeout) {
                w.clearTimeout(data.wheelCapture.timeout);
            }

            data.wheelCapture.timeout = w.setTimeout(function (d) {
                o.toggleThumbs(data, data.wheelCapture = data.flags.dragging = null);
            }, o.constants.timeout);

        },

        // handles a scroll event
        moveThumbs: function (data, left, top) {

            var thumbs, sizing, ml, mt;

            if (data.options.showThumbs) {

                thumbs = data.thumbs;
                sizing = data.sizing;

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
        start: function (event) {
            
            var data = event.data, target = data.target, flags = data.flags;

            o.clearInterval(data.target);

            data.startTarget = $(event.target);

            if (!data.startTarget.is(data.options.cancelOn)) {
                o.normalizeEvent(event);
                flags.dragging = flags.dragged = false;
                target.bind(o.events.drag, data, o.drag).stop(true, true);
                data.position = o.setPosition(event, {});
                data.capture = o.setPosition(event, {}, 2);
                o.triggerEvent('dragstart', data);
            }

        },

        // updates the current scroll location during a mouse move
        drag: function (event) {

            var data = event.data, flags = data.flags;

            o.normalizeEvent(event);

            if (!flags.dragged) {
                o.toggleThumbs(data, true);
            }
            
            flags.dragged = true;            

            if (data.options.direction !== 'vertical') {
                this.scrollLeft -= (event.pageX - data.position.x);
            }

            if (data.options.direction !== 'horizontal') {
                this.scrollTop -= (event.pageY - data.position.y);
            }

            o.moveThumbs(data, this.scrollLeft, this.scrollTop);

            o.setPosition(event, data.position);

            if (--data.capture.index <= 0) {
                flags.dragging = true;
                o.setPosition(event, data.capture, o.constants.captureThreshold);
            }

        },

        normalizeEvent: function (event) {
            var ios, original = event.originalEvent;
            if (original.changedTouches) {
                ios = original.changedTouches;
                event.pageX = ios.pageX;
                event.pageY = ios.pageY;
            }
        },

        time: function () {
            return (new Date()).getTime();
        },

        // defers target click event's for one iteration
        deferClick: function (target) {
            var events = target.data('events');
            if (events && events.click && events.click.length) {
                events = events.click.slice();
                target.unbind('click').one('click', function (event) {
                    event.preventDefault();
                    $.each(events, function (i, event) {
                        target.click(event);
                    });
                });
            }
        },

        // ends the drag operation and unbinds the mouse move handler
        stop: function (event) {

            var data = event.data, target = data.target, flags = data.flags;

            if (data.position) {

                target.unbind(o.events.drag, o.drag);

                o.triggerEvent('dragend', data);

                if (flags.dragging) {
                    o.drift(this, event, function () {                        
                        o.toggleThumbs(data, flags.dragging = false);
                    });
                } else {
                    o.toggleThumbs(data, false);
                }

                // only if we moved, and the mouse down is the same as
                // the mouse up target do we defer the event
                if (flags.dragged && $(event.target).is(data.startTarget)) {
                    o.deferClick(data.startTarget);
                    data.startTarget = flags.dragged = null;
                }

                data.capture = data.position = undefined;

            }

        },

        clearInterval: function (target) {
            target = $(target);
            var interval = target.data('overscroll-interval');
            if (interval) {
                w.clearInterval(interval);
            }
            target.data('overscroll-interval', null);
        },

        setInterval: function (target, interval) {
            o.clearInterval(target);
            $(target).data('overscroll-interval', interval);
        },

        // sends the overscrolled element into a drift
        drift: function (target, event, callback) {

            var data = event.data, dx, dy, xMod, yMod,
                scrollLeft = target.scrollLeft, scrollTop = target.scrollTop, 
                decay = o.constants.driftDecay;

            // only drift on intended drifts
            if ((o.time() - data.capture.time) > o.constants.driftTimeout) {
                return callback.call(null, data);
            }

            o.normalizeEvent(event);
            
            dx = data.options.scrollDelta * (event.pageX - data.capture.x);
            dy = data.options.scrollDelta * (event.pageY - data.capture.y);
            xMod = dx / o.constants.driftSequences;
            yMod = dy / o.constants.driftSequences;

            if (data.options.direction !== 'vertical') {
                scrollLeft -= dx;
            }

            if (data.options.direction !== 'horizontal') {
                scrollTop -= dy;
            }

            o.triggerEvent('driftstart', event.data);

            o.setInterval(target, w.setInterval(function () {

                var done = true, min = 1, max = -1;

                if (yMod > min && target.scrollTop > scrollTop || yMod < max && target.scrollTop < scrollTop) {
                    done = false;
                    target.scrollTop -= yMod;
                    yMod /= decay;
                }

                if (xMod > min && target.scrollLeft > scrollLeft || xMod < max && target.scrollLeft < scrollLeft) {
                    done = false;
                    target.scrollLeft -= xMod;
                    xMod /= decay;
                }

                o.moveThumbs(data, target.scrollLeft, target.scrollTop);

                if (done) {
                    o.clearInterval(target);
                    o.triggerEvent('driftend', data);
                    callback.call(null, data);
                }

            }, o.constants.driftFrequency));

        },

        // gets sizing for the container and thumbs
        getSizing: function (container) { 
            
            var sizing = {}, parent = container.get(0);
            container = sizing.container = {
                width: container.width(),
                height: container.height()
            };

            container.scrollWidth = container.width >= parent.scrollWidth ? container.width : parent.scrollWidth;
            container.scrollHeight = container.height >= parent.scrollHeight ? container.height : parent.scrollHeight;

            sizing.thumbs = {
                horizontal: {
                    width: container.width * container.width / container.scrollWidth,
                    height: o.constants.thumbThickness,
                    corner: o.constants.thumbThickness / 2,
                    left: 0,
                    top: container.height - o.constants.thumbThickness
                },
                vertical: {
                    width: o.constants.thumbThickness,
                    height: container.height * container.height / container.scrollHeight,
                    corner: o.constants.thumbThickness / 2,
                    left: container.width - o.constants.thumbThickness,
                    top: 0
                }
            };

            return sizing;

        },

        // gets the CSS object for a thumb
        getThumbCss: function (size) {

            return {
                position: "absolute",
                "background-color": "black",
                width: size.width + "px",
                height: size.height + "px",
                "margin": size.top + "px 0 0 " + size.left + "px",
                "-moz-border-radius": size.corner + "px",
                "-webkit-border-radius": size.corner + "px",
                "border-radius": size.corner + "px",
                "z-index": "999"
            };

        }

    });

})(window, Math, jQuery);
