Overscroll v1.6.4
=================
Thursday, October 10 2012

Overscroll is a jQuery Plugin and [polyfill](http://remysharp.com/2010/10/08/what-is-a-polyfill) for mobile safari's [overflow-scrolling](http://johanbrook.com/browsers/native-momentum-scrolling-ios-5/) style. It is intended for use on desktop browsers, with [the latest version of jQuery](http://code.jquery.com/jquery-latest.js).

Homepage: <http://azoffdesign.com/overscroll>

License
-------
Copyright 2012, Jonathan Azoff

Dual licensed under the MIT or GPL Version 2 licenses.

<http://jquery.org/license>

Usage
-----
```javascript
$(selector).overscroll([options]);
```

+ `selector`
    The jQuery selector, targeting an element to apply overscroll to
+ `options`
    An optional JavaScript object that you may pass if you would like to customize the experience of the overscroll element. Below is a list of properties that you may set on the options object and their respective effect.
    * `options.showThumbs` `{Boolean: true}`
        - Designates whether or not to show the scroll-bar thumbs on the scrollable container
    * `options.persistThumbs` `{Boolean: false}`
        - Designates whether or not to fade the thumbs in and out
    * `options.hoverThumbs` `{Boolean: false}`
        - Designates whether or not to fade the thumbs in and out on hover
    * `options.scrollLeft` `{Integer: undefined}`
        - Start the overscrolled element at a particular left offset. Defers to the browser default if not set
    * `options.scrollTop` `{Integer: undefined}`
        - Start the overscrolled element at a particular top offset. Defers to the browser default if not set
    * `options.direction` `{String: 'auto'}`
        - The scroll direction of the overscrolled element, by default it will auto-detect the available directions. You can also restrict direction by setting this property equal to 'vertical' or 'horizontal'
    * `options.cancelOn` `{String: "select,input,textarea"}`
        - An optional jQuery selector to ignore on drag events. Note: must match an element inside the overscrolled element.
    * `options.wheelDirection` `{String: 'vertical'}`
        - The direction scrolled when the mouse wheel is triggered. Options are 'horizontal' for left/right scrolling and 'vertical' for up/down scrolling.
    * `options.wheelDelta` `{Number: 20}`
        - The amount of drift to apply per mouse wheel 'tick'
    * `options.scrollDelta` `{Number: 5.7}`
        - The amount of drift to apply per drag interval
    * `options.zIndex` `{Number: 999}`
        - The z-index applied to the thumb elements
    * `options.dragHold` `{Boolean: false}`
        - Locks onto the overscrolled element when dragging and doesn't let go when the mouse moves away from it.

```javascript
$(selector).removeOverscroll();
```

+ Returns an overscrolled element to its pre-overscroll state. This is essentially a deconstructor for overscrolled elements.

Global Settings
------
Due to popular demand, overscroll also exposes some of its internal constants for advanced tweaking. You can modify any of these settings via `jQuery.fn.overscroll.settings`, here are the defaults:

```javascript
jQuery.fn.overscroll.settings = {
    captureThreshold:   3,   // The number of mouse move events before considering the gesture a "drag"
    driftDecay:         1.1, // The linear-friction coefficient for drift decay (must be > 1)
    driftSequences:     22,  // The number of animation frames to constrain a drift to
    driftTimeout:       100, // The amount of time to imply the user is no longer trying to drift (in ms)
    thumbOpacity:       0.7, // The default active opacity for the thumbs
    thumbThickness:     6,   // The thickness, in pixels, of the generated thumbs
    thumbTimeout:       400, // The amount of time to wait before fading out thumbs
}
```


Events
------
Apart from regular DOM events, overscrolled elements emit events to capture dragging and drifting boundaries. To listen to these events, simply listen for one of the following events on an overscrolled element:

+ `overscroll:dragstart`
    * The beginning of the drag event, happens when a user drags the overscrolled elemnent
+ `overscroll:dragend`
    * The end of the drag event, happens after the drag, but before the drift
+ `overscroll:driftstart`
    * Happens right after `overscroll:dragend`, but only if the drag had enough inertia
+ `overscroll:driftend`
    * The end of a drift, happens after the drift effect completes

Here is an example using jQuery's [on()](http://api.jquery.com/on/) method, listening for drag start:

```javascript
$('#selector').overscroll().on('overscroll:dragstart', function(){ console.log('Drag started!') });
```

Notes
-----
In order to get the most out of this plugin, make sure to only apply it to parent elements that are smaller than the collective width and/or height then their children. This way, you can see the actual scroll effect as you pan the element.

While you can programatically control whether or not overscroll allows horizontal and/or vertical scroll, it is best practice to size the child elements accordingly (via CSS) and not depend on programatic restrictions.

As of 1.3.1, if you would like to add click handlers to links inside of overscroll, you can dynamially check the state of the overscrolled element via the jQuery's [data()](http://api.jquery.com/bind/) method. This ability should allow you to prevent default behavior of a click handler if a drag state is detected. For example, an overscrolled jQuery element `elm` can be checked for drag state via `elm.data("overscroll").dragging`.

As of 1.4.4 you can call the `overscroll` constructor on a jQuery element as much as you like, without worrying about memory leaks. What this means is that you may dynamically add elements to the overscrolled element, and then re-call the `overscroll` method to take into account the new height. This would have been done programatically if DOM Elements supported the resize event, alas only the window object supports this event.

A Note About AMD
----------------
Full disclosure, I have no interest in supporting [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD). It seems great, I'm sure lots of people use it - but [its goals](http://requirejs.org/docs/whyamd.html) seem tangential to making Overscroll a better plug-in. It's hard enough keeping up with browsers, no sense in making Overscroll anything more than what it is: a jQuery plug-in. If you want to turn Overscroll into an AMD module, than I wholly encourage you to do so! Just fork the project and shoot me a link so that I can reference it here.

Change Log
----------
 * __1.6.4__
  - Fixed bug in deferClick logic. #65
  - Add support for scroll offset on iOS. #72
  - Default cancelOn to "select, input, textarea". #70
  - README and source cleanup
 * __1.6.3__
  - Fixed Chrome 19's bad overflow-scrolling implementation. #59
  - Only apply overscroll if there is content to scroll. (thanks @tsneed290) #57
 * __1.6.2__
  - Explicit check for start element. #48
  - Added support for android devices. #51
  - Added dragHold feature support. #49
 * __1.6.1__
  - Fixed feature detection and dragging data flag. #41
  - Don't prevent default until after checking cancel on. #42
 * __1.6.0__
  - Major re-factor on code structure to improve readability (more modular, added comments)
  - Migrated drift function to use requestAnimationFrame
  - Exposed global settings, for even finer-grained control of plug-in execution
  - Added restoration of original style information on removeOverscroll (thanks @coeamyd) #38
 * __1.5.2__
  - Added zIndex option for configuring thumb elements' z-index #33
  - Added handling of external scroll event for repositioning thumbs #34
  - Added `hoverThumbs` option to show thumbs on hover (thanks @groenroos) #32
  - Migrated to new  jQuery plugin standard
       + <https://github.com/jquery/plugins.jquery.com/blob/master/docs/package.md>
 * __1.5.1__
  - Added CSS "grab" cursors to scrolled elements #31
  - Fixed click deference on event targets #30
  - Native scrolling support for touch enabled devices #29
 * __1.5.0__
  - Updated code to support jQuery v1.7
  - Fixed mouse wheel support #27
  - Fixed double event calling bug when overscroll is rebound #28
 * __1.4.9__
  - Data reference optimization in often called methods
  - Renamed demo file
  - Prevent default behavior on mouse wheel to prevent window scroll
  - Less assumptions made in removeOverscroll
  - Migrated to function form of "use strict"
  - Added persistent thumb support #26
  - Ensured that events are removed on Overscroll re-binding #21
 * __1.4.8__
  - Fixed incorrect iOS event detection and normalization #24
  - Cleaned up sizing method
  - Added scrollLeft and scrollTop options
 * __1.4.7__
  - Fixed formatting in README
  - Added a z-index to the thumb CSS
 * __1.4.6__
  - Fixed regression in direction restriction #23
  - Added click insulation on drag events #22
  - Fixed bug when calculating container scrollWidth/Height (thanks Riccardo "Rial" Re)
 * __1.4.5__
  - Changed compiler to uglifyjs
        + <https://github.com/mishoo/UglifyJS>
  - Took advantage of `noop` shortcut
  - Applied first git tag (1.4.5)
  - Merged drift fix (thanks esseb)
        + <https://github.com/esseb/Overscroll/commit/8570a3cb564bbf7943c33cc6483036f1a7d8d81e>
 * __1.4.4__
  - Maintain state on elements that have a pre-existing scroll offset
  - Added deconstructor `jQuery.fn.removeOverscroll`
 * __1.4.3__
  - Improved iOS detection algorithm
  - Fixed a typo in README.md #14
  - Removed 'onDriftEnd' and added real events #13
 * __1.4.2__
  - Fixed bug in chrome due to ambiguous positioning
  - Added the cancelOn option (thanks Herhor) #5
  - Fixed iOS start handler bug (thanks kkriehl) #9
  - Added Opera support
 * __1.4.1__
  - Fixed a null pointer exception that occurs when thumbs are hidden (thanks Henning)
 * __1.4.0__
  - Deprecated remote cursors in lieu of the native alternative
  - Moved thumb start handler to start of drag (more like iOS behavior)
  - Fixed bug with scroll event binding when no thumbs are present
  - Improved drift mechanism by using a native animation over jQuery
  - Added iOS support (thanks to Riccardo "Rial" Re) #7
 * __1.3.5__
  - Added the ability to toggle mouse wheel scroll direction via options.wheelDirection (thanks Volderr) #4
  - Fixed bug with mouse wheel scroll direction (thanks Volderr)
  - Cached the cursor CSS
 * __1.3.4__
  - Added the ability to call a function at the end of the drift via options.onDriftEnd (thanks Volderr) #4
 * __1.3.3__
  - Added the ability to control the drift delta (drift strength per scroll tick) via options.[wheel|scroll]Delta (thanks Volderr) #3
  - Made mouse wheel scrolling more efficient via deferred fade out call
 * __1.3.2__
  - Updated documentation, added README file for Github
  - Fixed undefined error on mouse wheel scroll for horizontal scrollers. (thanks Volderr) #1
  - Added the ability to restrict scroll direction via options.direction
 * __1.3.1__
  - Made the dragging state externally visible via .data("dragging")
 * __1.3.0__
  - Merged iThumbs and Overscroll
  - Added the ability to pass in options
  - Moved all code to GitHub
  - Several improvements to the thumb code
  - Greased up the scroll a bit more
  - Removed the jerky animation on mouse wheel
  - Added caching for cursors
 * __1.2.1__
  - Made "smart" click support "smarter" :)
  - Added JSLint validation to the build process
  - Removed unused variables and cleaned up code
 * __1.2.0__
  - Updated license to match the jQuery license (thanks Jesse)
  - Added vertical scroll wheel support (thanks Pwakman)
  - Added support to ignore proprietary drag events (thanks Raphael)
  - Added "smart" click support for clickable elements (thanks Mark)
 * __1.1.2__
  - Added the correct click handling to the scroll operation (thanks Evilc)
 * __1.1.1__
  - Made scroll a bit smoother (thanks Nick)
 * __1.1.0__
  - Optimized scrolling-internals so that it is both smoother and more memory efficient (relies entirely on event model now). 
  - Added the ability to scroll horizontally (if the overscrolled element has wider children).
 * __1.0.3__
  - Extended the easing object, as opposed to the $ object (thanks Andre)
 * __1.0.2__
  - Fixed timer to actually return milliseconds (thanks Don)
 * __1.0.1__
  - Fixed bug with interactive elements and made scrolling smoother (thanks Paul and Aktar)