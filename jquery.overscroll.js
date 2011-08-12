/*
 * Overscroll v1.4.7
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
 * Date: Thursday, August 11th 2011
 */

/*jslint onevar: true, strict: true */

/*global window, jQuery */

"use strict";

(function (w, m, $, o) {

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

        checkIosDevice: function () {
            if (o.isIOS === undefined) {
                o.isIOS = /iP((hone)|(ad)|(od))/.test(navigator.platform);
            }
            return o.isIOS;
        },

        // main initialization function
        init: function (target, options) {

            var data = {
                sizing: o.getSizing(target)
            };

            options = $.extend({
                showThumbs: true,
                wheelDirection: 'vertical',
                cursor: 'move',
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

            target.css({
                'position': 'relative',
                'overflow': 'hidden',
                'cursor': options.cursor
            }).bind(o.events.wheel, data, o.wheel).bind(o.events.start, data, o.start).bind(o.events.end, data, o.stop).bind(o.events.ignored, false);
            // disable proprietary drag handlers
            if (options.showThumbs) {

                data.thumbs = {};

                if (data.sizing.container.scrollWidth > 0 && options.direction !== 'vertical') {
                    data.thumbs.horizontal = $(o.div).css(o.getThumbCss(data.sizing.thumbs.horizontal)).fadeTo(0, 0);
                    target.prepend(data.thumbs.horizontal);
                }

                if (data.sizing.container.scrollHeight > 0 && options.direction !== 'horizontal') {
                    data.thumbs.vertical = $(o.div).css(o.getThumbCss(data.sizing.thumbs.vertical)).fadeTo(0, 0);
                    target.prepend(data.thumbs.vertical);
                }

            }

            data.target = target;
            data.options = options;

        },

        remover: function (target, data) {
            return function () {
                target.css({
                    overflow: 'auto',
                    cursor: 'default'
                }).unbind(o.events.wheel, o.wheel)
				.unbind(o.events.start, data, o.start)
				.unbind(o.events.end, data, o.stop)
				.unbind(o.events.ignored, false);
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
            if (data.thumbs) {
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
        wheel: function (event, delta) {

            o.clearInterval(event.data.target);

            if (event.wheelDelta) {
                delta = event.wheelDelta / (w.opera ? - 120 : 120);
            }

            if (event.detail) {
                delta = -event.detail / 3;
            }

            if (!event.data.wheelCapture) {
                event.data.wheelCapture = {
                    timeout: null
                };
                o.toggleThumbs(event.data, true);
                event.data.target.stop(true, true).data('dragging', true);
            }

            delta *= event.data.options.wheelDelta;

            if (event.data.options.wheelDirection === 'horizontal') {
                this.scrollLeft -= delta;
            } else {
                this.scrollTop -= delta;
            }

            o.moveThumbs(event, this.scrollLeft, this.scrollTop);

            if (event.data.wheelCapture.timeout) {
                clearTimeout(event.data.wheelCapture.timeout);
            }

            event.data.wheelCapture.timeout = setTimeout(function (d) {
                event.data.wheelCapture = undefined;
                o.toggleThumbs(event.data, false);
                event.data.target.data('dragging', false);
            }, o.constants.timeout);

        },

        // handles a scroll event
        moveThumbs: function (event, left, top, thumbs, sizing, ml, mt) {

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
        start: function (event) {

            o.clearInterval(event.data.target);

            event.data.startTarget = $(event.target);

            if (!event.data.startTarget.is(event.data.options.cancelOn)) {
                o.normalizeEvent(event);
                event.data.target.bind(o.events.drag, event.data, o.drag).stop(true, true).data('dragging', false).data('dragged', false);
                event.data.position = o.setPosition(event, {});
                event.data.capture = o.setPosition(event, {}, 2);
                o.triggerEvent('dragstart', event.data);
            }

        },

        // updates the current scroll location during a mouse move
        drag: function (event, ml, mt, left, top) {

            o.normalizeEvent(event);

            event.data.target.data('dragged', true);

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

            if (--event.data.capture.index <= 0) {
                event.data.target.data('dragging', true);
                o.setPosition(event, event.data.capture, o.constants.captureThreshold);
            }

        },

        normalizeEvent: function (event) {
            if (o.checkIosDevice()) {
                var iosEvent = event.originalEvent.changedTouches[0];
                event.pageX = iosEvent.pageX;
                event.pageY = iosEvent.pageY;
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
        stop: function (event, dx, dy, d) {

            if (event.data.position) {

                event.data.target.unbind(o.events.drag, o.drag);

                o.triggerEvent('dragend', event.data);

                if (event.data.target.data('dragging')) {
                    o.drift(this, event, function (data) {
                        data.target.data('dragging', false);
                        o.toggleThumbs(data, false);
                    });
                } else {
                    o.toggleThumbs(event.data, false);
                }

                // only if we moved, and the mouse down is the same as
                // the mouse up target do we defer the event
                if (event.data.target.data('dragged') && $(event.target).is(event.data.startTarget)) {
                    event.data.target.data('dragged', false);
                    o.deferClick(event.data.startTarget);
                    event.data.startTarget = null;
                }

                event.data.capture = event.data.position = undefined;

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

            // only drift on intended drifts
            if ((o.time() - event.data.capture.time) > o.constants.driftTimeout) {
                return callback.call(null, event.data);
            }

            o.normalizeEvent(event);

            var dx = event.data.options.scrollDelta * (event.pageX - event.data.capture.x),
                dy = event.data.options.scrollDelta * (event.pageY - event.data.capture.y),
                scrollLeft = target.scrollLeft,
                scrollTop = target.scrollTop,
                xMod = dx / o.constants.driftSequences,
                yMod = dy / o.constants.driftSequences,
                decay = o.constants.driftDecay;

            if (event.data.options.direction !== 'vertical') {
                scrollLeft -= dx;
            }

            if (event.data.options.direction !== 'horizontal') {
                scrollTop -= dy;
            }

            o.triggerEvent('driftstart', event.data);

            o.setInterval(target, w.setInterval(function () {

                var done = true,
                    min = 1,
                    max = -1;

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

                o.moveThumbs(event, target.scrollLeft, target.scrollTop);

                if (done) {
                    o.clearInterval(target);
                    o.triggerEvent('driftend', event.data);
                    callback.call(null, event.data);
                }

            }, o.constants.driftFrequency));

        },

        // gets sizing for the container and thumbs
        getSizing: function (container) {

            var sizing = {}, parent = container.get(0);

            sizing.container = {
                width: container.width(),
                height: container.height()
            };

            sizing.container.scrollWidth = (parent.scrollWidth == sizing.container.width ? 0 : parent.scrollWidth);
            sizing.container.scrollHeight = (parent.scrollHeight == sizing.container.height ? 0 : parent.scrollHeight);

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
