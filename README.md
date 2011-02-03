Overscroll v1.4.2
=================
Thursday, February 17th 2011

Overscroll is a jQuery Plugin that emulates the iPhone scrolling experience in a browser. It is intended for use with the latest version of jQuery http://code.jquery.com/jquery-latest.js

Homepage: <http://azoffdesign.com/overscroll>
 
License
-------
Copyright 2011, Jonathan Azoff

Dual licensed under the MIT or GPL Version 2 licenses.

<http://jquery.org/license>

Usage
-----
<pre>$(selector).overscroll([options]);</pre>

+ `selector`
    The jQuery selector, targeting an element to apply overscroll to
+ `options`
    An optional JavaScript object that you may pass if you would like to customize the experience of the overscroll element. Below is a list of properties that you may set on the options object and their respective effect.
    * `options.showThumbs` `{Boolean: true}`
        - Designates whether or not to show the scroll-bar thumbs on the scrollable container
    * `options.cursor` `{String: 'move'}`
        - The cursor to use when hovering over the overscrolled element. For options, see <http://tinyurl.com/4g2qpnx>
	* `options.cursor` `{String: 'auto'}`
        - The scroll direction of the overscrolled element, by default it will auto-detect the available directions. You can also restrict direction by setting this property equal to 'vertical' or 'horizontal'
    * `options.cancelOn` `{String: ""}`
		- An optional jQuery selector to ignore on drag events. Note: must match an element inside the overscrolled element.
    * `options.wheelDirection` `{String: 'vertical'}`
        - The direction scrolled when the mouse wheel is triggered. Options are 'horizontal' for left/right scrolling and 'vertical' for up/down scrolling.
    * `options.wheelDelta` `{Number: 20}`
        - The amount of drift to apply per mouse wheel 'tick'
    * `options.scrollDelta` `{Number: 5.7}`
        - The amount of drift to apply per drag interval
    * `options.onDriftEnd` `{Function: $.noop}`
        - A function to be called at the end of every drift 

Notes
-----
In order to get the most out of this plugin, make sure to only apply it to parent elements that are smaller than the collective width and/or height then their children. This way, you can see the actual scroll effect as you pan the element.

While you can programatically control whether or not overscroll allows horizontal and/or vertical scroll, it is best practice to size the child elements accordingly (via CSS) and not depend on programatic restrictions.

As of 1.3.1, if you would like to add click handlers to links inside of overscroll, you can dynamially check the state of the overscrolled element via the jQuery.data method. This ability should allow you to exit a click handler if a drag state is detected. For example, an overscrolled jQuery element "elm" can be checked for drag state via elm.data("dragging").  

Change Log
----------

 * ###1.4.2
   - Fixed bug in chrome due to ambiguous positioning
   - Added the cancelOn option (thanks Herhor)
       + <https://github.com/azoff/Overscroll/issues/5>
   - Fixed iOS start handler bug (thanks kkriehl)
	   + <https://github.com/azoff/Overscroll/issues/9>
   - Added Opera support
 * ###1.4.1
   - Fixed a null pointer exception that occurs when thumbs are hidden (thanks Henning)
 * ###1.4.0
   - Deprecated remote cursors in lieu of the native alternative
   - Moved thumb start handler to start of drag (more like iOS behavior)
   - Fixed bug with scroll event binding when no thumbs are present
   - Improved drift mechanism by using a native animation over jQuery
   - Added iOS support (thanks to Riccardo "Rial" Re)
       + <http://github.com/azoff/Overscroll/issues/7>
 * ###1.3.5
    - Added the ability to toggle mouse wheel scroll direction via options.wheelDirection (thanks Volderr)
       + <http://github.com/azoff/Overscroll/issues/4>
    - Fixed bug with mouse wheel scroll direction (thanks Volderr)
    - Cached the cursor CSS
 * ###1.3.4
   - Added the ability to call a function at the end of the drift via options.onDriftEnd 
      + <http://github.com/azoff/Overscroll/issues/4> (thanks Volderr)
 * ###1.3.3
    - Added the ability to control the drift delta (drift strength per scroll tick) via options.[wheel|scroll]Delta
       + <http://github.com/azoff/Overscroll/issues/3> (thanks Volderr)
    - Made mouse wheel scrolling more efficient via deferred fade out call
 * ###1.3.2
   - Updated documentation, added README file for Github
   - Fixed undefined error on mouse wheel scroll for horizontal scrollers.
      + <http://github.com/azoff/Overscroll/issues/1> (thanks Volderr)
   - Added the ability to restrict scroll direction via options.direction
 * ###1.3.1
   - Made the dragging state externally visible via .data("dragging")
 * ###1.3.0
   - Merged iThumbs and Overscroll
   - Added the ability to pass in options
   - Moved all code to GitHub
   - Several improvements to the thumb code
   - Greased up the scroll a bit more
   - Removed the jerky animation on mouse wheel
   - Added caching for cursors
 * ###1.2.1
   - Made "smart" click support "smarter" :)
   - Added JSLint validation to the build process
   - Removed unused variables and cleaned up code
 * ###1.2.0
   - Updated license to match the jQuery license (thanks Jesse)
   - Added vertical scroll wheel support (thanks Pwakman)
   - Added support to ignore proprietary drag events (thanks Raphael)
   - Added "smart" click support for clickable elements (thanks Mark)
 * ###1.1.2
   - Added the correct click handling to the scroll operation (thanks Evilc)
 * ###1.1.1
   - Made scroll a bit smoother (thanks Nick)
 * ###1.1.0
   - Optimized scrolling-internals so that it is both smoother and more memory efficient (relies entirely on event model now). 
   - Added the ability to scroll horizontally (if the overscrolled element has wider children).
 * ###1.0.3
   - Extended the easing object, as opposed to the $ object (thanks Andre)
 * ###1.0.2
   - Fixed timer to actually return milliseconds (thanks Don)
 * ###1.0.1
   - Fixed bug with interactive elements and made scrolling smoother (thanks Paul and Aktar)