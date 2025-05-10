/*
	Lens by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

var main = (function($) { var _ = {

	/**
	 * Settings.
	 * @var {object}
	 */
	settings: {

		// Preload all images.
			preload: false,

		// Slide duration (must match "duration.slide" in _vars.scss).
			slideDuration: 500,

		// Layout duration (must match "duration.layout" in _vars.scss).
			layoutDuration: 750,

		// Thumbnails per "row" (must match "misc.thumbnails-per-row" in _vars.scss).
			thumbnailsPerRow: 2,

		// Side of main wrapper (must match "misc.main-side" in _vars.scss).
			mainSide: 'right'

	},

	/**
     * Layout information provided by gallery.js.
     * @var {object | null} { columnASize: number, totalImages: number }
     */
    layoutInfo: null, // Initialize placeholder

	/**
	 * Window.
	 * @var {jQuery}
	 */
	$window: null,

	/**
	 * Body.
	 * @var {jQuery}
	 */
	$body: null,

	/**
	 * Main wrapper.
	 * @var {jQuery}
	 */
	$main: null,

	/**
	 * Thumbnails.
	 * @var {jQuery}
	 */
	$thumbnails: null,

	/**
	 * Viewer.
	 * @var {jQuery}
	 */
	$viewer: null,

	/**
	 * Toggle.
	 * @var {jQuery}
	 */
	$toggle: null,

	/**
	 * Nav (next).
	 * @var {jQuery}
	 */
	$navNext: null,

	/**
	 * Nav (previous).
	 * @var {jQuery}
	 */
	$navPrevious: null,

	/**
	 * Slides.
	 * @var {array}
	 */
	slides: [],

	/**
	 * Current slide index.
	 * @var {integer}
	 */
	current: null,

	/**
	 * Lock state.
	 * @var {bool}
	 */
	locked: false,

	/**
	 * Keyboard shortcuts.
	 * @var {object}
	 */
	keys: {

		// Escape: Toggle main wrapper.
			27: function() {
				_.toggle();
			},

		// Up: Move up.
			38: function() {
				_.up();
			},

		// Down: Move down.
			40: function() {
				_.down();
			},

		// Space: Next.
			32: function() {
				_.next();
			},

		// Right Arrow: Next.
			39: function() {
				_.next();
			},

		// Left Arrow: Previous.
			37: function() {
				_.previous();
			}

	},

	/**
	 * Initialize properties.
	 */
	initProperties: function() {

		// Window, body.
			_.$window = $(window);
			_.$body = $('body');

		// Thumbnails.
			_.$thumbnails = $('#thumbnails');

		// Viewer.
			_.$viewer = $(
				'<div id="viewer">' +
					'<div class="inner">' +
						'<div class="nav-next"></div>' +
						'<div class="nav-previous"></div>' +
						'<div class="toggle"></div>' +
					'</div>' +
				'</div>'
			).appendTo(_.$body);

		// Nav.
			_.$navNext = _.$viewer.find('.nav-next');
			_.$navPrevious = _.$viewer.find('.nav-previous');

		// Main wrapper.
			_.$main = $('#main');

		// Toggle.
			$('<div class="toggle"></div>')
				.appendTo(_.$main);

			_.$toggle = $('.toggle');

	},

	/**
	 * Initialize events.
	 */
	initEvents: function() {

		// Window.

			// Remove is-preload-* classes on load.
				_.$window.on('load', function() {

					_.$body.removeClass('is-preload-0');

					window.setTimeout(function() {
						_.$body.removeClass('is-preload-1');
					}, 100);

					window.setTimeout(function() {
						_.$body.removeClass('is-preload-2');
					}, 100 + Math.max(_.settings.layoutDuration - 150, 0));

				});

			// Disable animations/transitions on resize.
				var resizeTimeout;

				_.$window.on('resize', function() {

					_.$body.addClass('is-preload-0');
					window.clearTimeout(resizeTimeout);

					resizeTimeout = window.setTimeout(function() {
						_.$body.removeClass('is-preload-0');
					}, 100);

				});

		// Viewer.

			// Hide main wrapper on tap (<= medium only).
				_.$viewer.on('touchend', function() {

					if (breakpoints.active('<=medium'))
						_.hide();

				});

			// Touch gestures.
				_.$viewer
					.on('touchstart', function(event) {

							_.$viewer.touchPosX = event.originalEvent.touches[0].pageX;
							_.$viewer.touchPosY = event.originalEvent.touches[0].pageY;
							_.$viewer.isPinching = false; // Flag for pinching
							
							if (event.originalEvent.touches.length === 2) {
								//scroll mode :D
								let t1 = event.originalEvent.touches[0];
								let t2 = event.originalEvent.touches[1];
								_.$viewer.initialPinchDistance = Math.sqrt(
									Math.pow(t2.pageX - t1.pageX, 2) +
									Math.pow(t2.pageY - t1.pageY, 2)
								);
								if (_.current !== null && _.slides[_.current] && _.slides[_.current].$slideImage) {
									 _.$viewer.currentZoomImage = _.slides[_.current].$slideImage;
									 _.$viewer.currentImageScale = parseFloat(_.$viewer.currentZoomImage.css('transform').split('(')[1]) || 1;
									 if (_.$viewer.currentZoomImage) {
										_.$viewer.currentZoomImage.css('transition', 'none'); //No animation during pinch.
									}
								}
							} else {
								_.$viewer.initialPinchDistance = null;
								_.$viewer.currentZoomImage = null;
							}

					})
					.on('touchmove', function(event) {

						// No start position recorded? Bail.
							if (_.$viewer.touchPosX === null
							||	_.$viewer.touchPosY === null)
								return;

							if (event.originalEvent.touches.length === 2 && _.$viewer.initialPinchDistance && _.$viewer.currentZoomImage) {
								event.preventDefault(); // Prevent default browser zoom/scroll during our custom pinch
								event.stopPropagation();
					
								let t1 = event.originalEvent.touches[0];
								let t2 = event.originalEvent.touches[1];
								let currentPinchDistance = Math.sqrt(
									Math.pow(t2.pageX - t1.pageX, 2) +
									Math.pow(t2.pageY - t1.pageY, 2)
								);
					
								let scaleFactor = currentPinchDistance / _.$viewer.initialPinchDistance;
								let newScale = _.$viewer.currentImageScale * scaleFactor;
								newScale = Math.max(1, Math.min(newScale, 5));
					
								_.$viewer.currentZoomImage.css('transform', 'scale(' + newScale + ')');
								return;
							}
					
							if (event.originalEvent.touches.length === 1) {
								var diffX = _.$viewer.touchPosX - event.originalEvent.touches[0].pageX,
									diffY = _.$viewer.touchPosY - event.originalEvent.touches[0].pageY;
								var boundary = 20,
									delta = 50;
					
								// Swipe left (next).
								if ( (diffY < boundary && diffY > (-1 * boundary)) && (diffX > delta) )
									_.next();
					
								// Swipe right (previous).
								else if ( (diffY < boundary && diffY > (-1 * boundary)) && (diffX < (-1 * delta)) )
									_.previous();
					
								// Overscroll fix.
								var th = _.$viewer.outerHeight(),
									ts = (_.$viewer.get(0).scrollHeight - _.$viewer.scrollTop());
					
								if ((_.$viewer.scrollTop() <= 0 && diffY < 0) ||
									(ts > (th - 2) && ts < (th + 2) && diffY > 0)) {
					
									event.preventDefault();
									event.stopPropagation();
								}
							}

						})
						.on('touchend', function(event) {
							_.$viewer.initialPinchDistance = null;
							if (_.$viewer.currentZoomImage && event.originalEvent.touches.length < 2) {
								let currentTransform = _.$viewer.currentZoomImage.css('transform');
								const matrix = currentTransform.match(/matrix\((.+)\)/);
								const values = matrix[1].split(', ');
								_.$viewer.currentImageScale = parseFloat(values[0]);
							}
						});

		// Main.

			// Touch gestures.
				_.$main
					.on('touchstart', function(event) {

						// Bail on xsmall.
							if (breakpoints.active('<=xsmall'))
								return;

						// Record start position.
							_.$main.touchPosX = event.originalEvent.touches[0].pageX;
							_.$main.touchPosY = event.originalEvent.touches[0].pageY;

					})
					.on('touchmove', function(event) {

						// Bail on xsmall.
							if (breakpoints.active('<=xsmall'))
								return;

						// No start position recorded? Bail.
							if (_.$main.touchPosX === null
							||	_.$main.touchPosY === null)
								return;

						// Calculate stuff.
							var	diffX = _.$main.touchPosX - event.originalEvent.touches[0].pageX,
								diffY = _.$main.touchPosY - event.originalEvent.touches[0].pageY;
								boundary = 20,
								delta = 50,
								result = false;

						// Swipe to close.
							switch (_.settings.mainSide) {

								case 'left':
									result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX > delta);
									break;

								case 'right':
									result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX < (-1 * delta));
									break;

								default:
									break;

							}

							if (result)
								_.hide();

						// Overscroll fix.
							var	th = _.$main.outerHeight(),
								ts = (_.$main.get(0).scrollHeight - _.$main.scrollTop());

							if ((_.$main.scrollTop() <= 0 && diffY < 0)
							|| (ts > (th - 2) && ts < (th + 2) && diffY > 0)) {

								event.preventDefault();
								event.stopPropagation();

							}

					});
		// Toggle.
			_.$toggle.on('click', function() {
				_.toggle();
			});

			// Prevent event from bubbling up to "hide event on tap" event.
				_.$toggle.on('touchend', function(event) {
					event.stopPropagation();
				});

		// Nav.
			_.$navNext.on('click', function() {
				_.next();
			});

			_.$navPrevious.on('click', function() {
				_.previous();
			});

		// Keyboard shortcuts.

			// Ignore shortcuts within form elements.
				_.$body.on('keydown', 'input,select,textarea', function(event) {
					event.stopPropagation();
				});

			_.$window.on('keydown', function(event) {

				// Ignore if xsmall is active.
					if (breakpoints.active('<=xsmall'))
						return;

				// Check keycode.
					if (event.keyCode in _.keys) {

						// Stop other events.
							event.stopPropagation();
							event.preventDefault();

						// Call shortcut.
							(_.keys[event.keyCode])();

					}

			});

	},


/**
 * @param {array} imagesData
 */
initViewer: function(imagesData) {

    // Clear previous state
    _.$viewer.find('.slide').remove();
    _.slides = [];
    _.current = null;

    var $articles = _.$thumbnails.children('article');

    imagesData.forEach(function(imgData, index) {
        var $parentArticle = $articles.eq(index);
		var $thumbnail = $parentArticle.children('a.thumbnail');
		var fullImageUrl = $thumbnail.attr('href');
        var s = {
            $parent: $parentArticle,
            $slide: null,
            $slideImage: null,
            $slideCaption: null,
            url: fullImageUrl,
            loaded: false
        };

        s.$slide = $('<div class="slide"><div class="caption"></div><div class="image"></div></div>');
        s.$slideImage = s.$slide.children('.image');
        s.$slideImage
            .css('background-image', '')
            .css('background-position', (imgData.position || $thumbnail.data('position') || 'center'));

        s.$slideCaption = s.$slide.find('.caption');
        $parentArticle.children('h2, p').appendTo(s.$slideCaption);
        $parentArticle.attr('tabIndex', '-1');
        _.slides.push(s);
    });
},

	/**
	 * Initialize stuff.
	 */
	init: function() {

		// Breakpoints.
			breakpoints({
				xlarge:  [ '1281px',  '1680px' ],
				large:   [ '981px',   '1280px' ],
				medium:  [ '737px',   '980px'  ],
				small:   [ '481px',   '736px'  ],
				xsmall:  [ null,      '480px'  ]
			});

		// Everything else.
			_.initProperties();
			//_.initViewer();
			_.initEvents();

		// // Show first slide if xsmall isn't active.
		// 	breakpoints.on('>xsmall', function() {

		// 		if (_.current === null)
		// 			_.switchTo(0, true);

		// 	});

	},

	/**
	 * Switch to a specific slide.
	 * @param {integer} index Index.
	 */
	switchTo: function(index, noHide) {

		if (_.slides.length === 0 || index < 0 || index >= _.slides.length) {
			console.warn(`switchTo: Invalid index ${index} or no slides loaded.`);
			return;
		}

		// Already at index and xsmall isn't active? Bail.
		if (_.current == index && !breakpoints.active('<=xsmall') && _.$body.hasClass('fullscreen') === false) {return;}


		// Locked? Bail.
		if (_.locked)
			return;

		// Lock.
		_.locked = true;

		if (!noHide && breakpoints.active('<=medium')) {
			_.hide();
		}


		// Get slides.
		var	oldSlide = (_.current !== null && _.slides[_.current]) ? _.slides[_.current] : null,
			newSlide = _.slides[index];


		// Update current.
		_.current = index;

		// Deactivate old slide (if there is one).
		if (oldSlide) {
			oldSlide.$parent.removeClass('active');
			if (oldSlide.$slideImage && breakpoints.active('<=medium')) {
				// If the image has been scaled, animate it back to its original size.
				oldSlide.$slideImage.css({
					'transform': 'scale(1.2)',
					'transform-origin': 'center center',
					'transition': 'opacity 0.5s ease-in-out, transform 0.75s ease'
				});
			}
			oldSlide.$slide.removeClass('active');
		}

		// Activate new slide.

		// Thumbnail.
		newSlide.$parent
					.addClass('active')
					.focus();


		// Slide.
		var f = function() {

			// Old slide exists? Detach it.
			if (oldSlide && oldSlide.$slide)
				oldSlide.$slide.detach();


			// Attach new slide.
			newSlide.$slide.appendTo(_.$viewer);

			// New slide not yet loaded?
			if (!newSlide.loaded) {

				window.setTimeout(function() {

					// Mark as loading.
					newSlide.$slide.addClass('loading');

					// Wait for it to load.
					$('<img src="' + newSlide.url + '" />').on('load', function() {
					//window.setTimeout(function() { // Keep original artificial delay if desired, remove for speed

						// Set background image.
						newSlide.$slideImage
							.css('background-image', 'url(' + newSlide.url + ')');

						// Mark as loaded.
						newSlide.loaded = true;
						newSlide.$slide.removeClass('loading');

						// Mark as active.
						newSlide.$slide.addClass('active');

						// Unlock.
						window.setTimeout(function() {
							_.locked = false;
						}, 100);

					//}, 1000); // End of artificial delay
					});

				}, 100); // Keep initial loading delay

			}

			// Otherwise ... (already loaded)
			else {

				window.setTimeout(function() {

					// Mark as active.
						newSlide.$slide.addClass('active');

					// Unlock.
						window.setTimeout(function() {
							_.locked = false;
						}, 100);

				}, 100);

			}

	};

	// No old slide? Switch immediately.
	if (!oldSlide)
		(f)();
	// Otherwise, wait for old slide to disappear first.
	else
		window.setTimeout(f, _.settings.slideDuration);
	},


	/**
     * @param {function} callback
     */
	clearSlide: function(callback) {
		if (_.$viewer) {
			var $activeSlides = _.$viewer.find('.slide.active');
			if ($activeSlides.length > 0) { // Check if there are active slides
				$activeSlides.removeClass('active');
				setTimeout(function() {
					$activeSlides.remove(); // Remove the element(s) from the DOM
					// Execute the callback function now that clearing is done
					if (typeof callback === 'function') {
						callback();
					}
				}, _.settings.slideDuration); // Use the existing slide duration for timing
			} else {
				 // No active slide to clear, just run callback if provided
				 if (typeof callback === 'function') {
					 // Run callback immediately or with a minimal timeout if needed
					 setTimeout(callback, 0);
				 }
			}
		} else {
			// Viewer doesn't exist yet, run callback if provided
			if (typeof callback === 'function') {
				 setTimeout(callback, 0);
			 }
		}
	},


	/**
	 * Switches to the next slide.
	 */
	next: function() {
		if (_.current === null || !_.layoutInfo || _.slides.length === 0) return;

		var i, c = _.current, l = _.slides.length;
		if (c >= _.layoutInfo.columnASize) {
			if (c > (_.layoutInfo.columnASize + 0.5 * _.layoutInfo.columnBSize)) {
				i = c - _.layoutInfo.columnBSize + 1
			} else {
			i = c - _.layoutInfo.columnASize + 1}
		} else {
			if (c > (0.5 * _.layoutInfo.columnASize)) {
				i = c + _.layoutInfo.columnBSize
			} else {
				i = c + _.layoutInfo.columnASize}
		}
		if (i !== c) { // Only switch if index changed
            _.switchTo(i);
        }
	},

	/**
	 * Switches to the previous slide (respecting two-column layout).
	 */
	previous: function() {
        if (_.current === null || !_.layoutInfo || _.slides.length === 0) return;

		var i, c = _.current, l = _.slides.length;
		if (c >= _.layoutInfo.columnASize) {
			if (c > (_.layoutInfo.columnASize + 0.5 * _.layoutInfo.columnBSize)) {
				i = c - _.layoutInfo.columnBSize 
			} else {
			i = c - _.layoutInfo.columnASize}
		} else {
			if (c > (0.5 * _.layoutInfo.columnASize)) {
				i = c + _.layoutInfo.columnBSize - 1
			} else {
				i = c + _.layoutInfo.columnASize - 1}
		}
		if (i !== c) { // Only switch if index changed
            _.switchTo(i);
        }
	},

	/**
	 * Switches to slide "above" current (moves up within its column).
	 */
	up: function() {
		if (_.$body.hasClass('fullscreen')) return;
		if (_.current === null || !_.layoutInfo || _.slides.length === 0) return;
		
		var c = _.current, l = _.slides.length;
		if (c === 0 || c === _.layoutInfo.columnASize) {
			return;
		}
		_.switchTo(c - 1);
	},

	/**
	 * Switches to slide "below" current (moves down within its column).
	 */
	down: function() {
		if (_.$body.hasClass('fullscreen')) return;
		if (_.current === null || !_.layoutInfo || _.slides.length === 0) return;
		
		var c = _.current, l = _.slides.length;
		if (c === _.layoutInfo.columnASize - 1 || c === _.layoutInfo.columnASize + _.layoutInfo.columnBSize - 1) {
			return;
		}
		_.switchTo(c + 1);
	},

	

	/**
	 * Shows the main wrapper.
	 */
	show: function() {

		// Already visible? Bail.
			if (!_.$body.hasClass('fullscreen'))
				return;

		// Show main wrapper.
			_.$body.removeClass('fullscreen');

		// Focus.
			_.$main.focus();

	},

	/**
	 * Hides the main wrapper.
	 */
	hide: function() {

		// Already hidden? Bail.
			if (_.$body.hasClass('fullscreen'))
				return;

		// Hide main wrapper.
			_.$body.addClass('fullscreen');

		// Blur.
			_.$main.blur();

	},

	/**
	 * Toggles main wrapper.
	 */
	toggle: function() {

		if (_.$body.hasClass('fullscreen'))
			_.show();
		else
			_.hide();

	},

}; return _; })(jQuery); main.init();