Overscroll v1.7.7
=================
Wednesday, February 12th, 2014

Overscroll is a jQuery Plugin and [polyfill](http://remysharp.com/2010/10/08/what-is-a-polyfill) for mobile safari's [overflow-scrolling](http://johanbrook.com/browsers/native-momentum-scrolling-ios-5/) style. It is intended for use on desktop browsers, with [the latest version of jQuery](http://code.jquery.com/jquery-latest.js).

Homepage: <http://azoff.github.io/overscroll/>


License
-------
Copyright 2014, Jonathan Azoff

Licensed under the MIT license.

<https://github.com/azoff/overscroll/blob/master/mit.license>

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
    * `options.captureWheel` `{Boolean: true}`
        - Designates whether or not to react to mouse wheel events
    * `options.wheelDirection` `{String: 'multi'}`
        - The direction scrolled when the mouse wheel is triggered. Options are 'multi' for multi-directional scrolling, 'horizontal' for left/right scrolling, and 'vertical' for up/down scrolling.
    * `options.wheelDelta` `{Number: 20}`
        - The amount of drift to apply per mouse wheel 'tick'
    * `options.scrollDelta` `{Number: 5.7}`
        - The amount of drift to apply per drag interval
    * `options.zIndex` `{Number: 999}`
        - The z-index applied to the thumb elements
    * `options.dragHold` `{Boolean: false}`
        - Locks onto the overscrolled element when dragging and doesn't let go when the mouse moves away from it.
    * `options.ignoreSizing` `{Boolean: false}`
        - Applies overscroll to the selected element even if it has no area to scroll

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

Finer Points
------------
In order to get the most out of this plugin, make sure to only apply it to parent elements that are smaller than the collective width and/or height of their children. This way, you can see the actual scroll effect as you pan the element.

While you can programatically control whether or not overscroll allows horizontal and/or vertical scroll, it is best practice to size the child elements accordingly (via CSS) and not depend on programatic restrictions.

As of 1.3.1, if you would like to add click handlers to links inside of overscroll, you can dynamially check the state of the overscrolled element via the jQuery's [data()](http://api.jquery.com/bind/) method. This ability should allow you to prevent default behavior of a click handler if a drag state is detected. For example, an overscrolled jQuery element `elm` can be checked for drag state via `elm.data("overscroll").dragging`.

As of 1.4.4, you can call the `overscroll` constructor on a jQuery element as much as you like, without worrying about memory leaks. What this means is that you may dynamically add elements to the overscrolled element, and then re-call the `overscroll` method to take into account the new height. This would have been done programatically if DOM Elements supported the resize event, alas only the window object supports this event.

As of 1.7.0, you can scroll in multiple directions using the mouse wheel. You can also disable mouse wheel support.

As of 1.7.4, Overscroll runs on the jQuery 2.x.x variants - hence, older browsers are no longer supported.

Contributing
------------
I <3 pull requests. If you want to contribute, please fork the code and submit a pull request. If you want to take an active role maintaining overscroll, just let me know - I would wholeheartedly appreciate the help.

Support
-------

If you're having problems with using the project, use the support forum at CodersClan.

<a href="http://codersclan.net/forum/index.php?repo_id=18"><img src="http://www.codersclan.net/graphics/getSupport_blue_big.png" width="160"></a>

A Note About AMD
----------------
I have no interest in supporting [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD). It seems great and I'm sure lots of people use it. However, [its goals](http://requirejs.org/docs/whyamd.html) seem tangential to making Overscroll a better plug-in. It's hard enough keeping up with browsers, no sense in making Overscroll anything more than what it is: a jQuery plug-in. If you want to turn Overscroll into an AMD module, than I wholly encourage you to do so! Just fork the project and shoot me a link so that I can reference it here!
