/*jshint undef: true */

(function($, window, undefined) {
	"use strict";

	var INSTANCES = 0;

	var DATA_KEY = "infiniteScroll";

	$.infiniteScroll = function(options, element) {
		this.$container = $(element);
		this.$window = $(window);
		this.$document = $(document);
		this.options = $.extend({}, this.defaults, options);

		this._init();
	};

	$.defaults = {
		scrollSelector: "",
		navigationSelector: "",
		nextSelector: "",
		itemSelector: "",
		debug: false,
		page: 1,
		path: undefined,
		fill: true,
		pixelThreshold: 0,
		dataType: "html"

		// TODO: Rethink plugin ("behavior") loader to allow for multiple plugins
	};

	$.infiniteScroll.prototype = {
		state: {
			isPaused: false,
			isLoading: false,
			instanceId: undefined
		},

		// Private methods

		_init: function() {
			this.state.instanceId = INSTANCES++;
			this.page = this.options.page;
			this.path = this.options.path;
			this.fill = this.options.fill;

			this.$scroll = $(this.options.scrollSelector);
			this.$navigation = $(this.options.navigationSelector);
			this.$nextSelector = $(this.options.nextSelector);

			// If the path creation isn't overridden, create a path array by parsing the URL provided by the next selector
			var nextUrl = this.$nextSelector.attr("href");
			this.path = this.path || this._parsePath(nextUrl, this.page);

			this.$navigation.hide();

			// Setup a namespacing system for events so they can be added and removed without breaking other instances
			var EVENT_NAMESPACE = ".infinite-scroll" + this.state.instanceId;

			this.EVENTS = {
				// Triggered events
				LOADING_START: "loading-start" + EVENT_NAMESPACE,
				LOADING_END: "loading-end" + EVENT_NAMESPACE,
				FINISHED: "finished" + EVENT_NAMESPACE,

				// Subscribed events
				RESIZE: "resize" + EVENT_NAMESPACE,
				SCROLL: "scroll" + EVENT_NAMESPACE
			};

			this.$scroll.on(this.EVENTS.SCROLL, $.proxy(this._scroll, this));

			if (this.fill) {
				this.$window.on(this.EVENTS.RESIZE, $.proxy(this._resize, this));
				// Trigger a resize (within our namespace) to kickstart a check to fill in content if needed
				this.$window.trigger(this.EVENTS.RESIZE);
			}
		},

		/**
		 * Parses a URL into component parts that can be used to create URLs to load other pages
		 *
		 * @param path {String}
		 * @param page {Number}
		 * @returns {Array}
		 * @private
		 */
		_parsePath: function(path, page) {
			// TODO: Create heuristics similar to what is in Infinite-Scroll 
			return path.split(page);
		},

		/**
		 * Returns a URL for the supplied page
		 *
		 * @param page {Number}
		 * @returns {String}
		 * @private
		 */
		_getUrl: function(page) {
			if ($.isFunction(this.path)) {
				return this.path(page);
			} else if ($.isArray(this.path)) {
				return this.path.join(page.toString());
			} else if (typeof this.path === "string") {
				return this.path;
			}

			return "";
		},

		_getPage: function(url, dataType) {
			var pluginContext = this;

			this.$container.trigger(pluginContext.EVENTS.LOADING_START);

			$.ajax({
				url: url,
				dataType: dataType
			}).done(function(data) {
				pluginContext._debug("Loaded", data);
			}).fail(function(jqXHR, textStatus, errorThrown) {
				// TODO: Provide check to determine if the plugin should terminate
				pluginContext._debug("Failed to load:", jqXHR.url, errorThrown);
			}).then(function() {
				pluginContext.state.isLoading = false;
				pluginContext.$container.trigger(pluginContext.EVENTS.LOADING_END);
			});
		},

		/**
		 * Calculates the amount of pixels remaining until the scrolling area has reached the bottom.
		 *
		 * @returns {number} The number of pixels until the bottom has been reached
		 * @private
		 */
		_getRemainingPixels: function() {
			if ($.isWindow(this.$scroll)) {
				return this.$document.height() - this.$scroll.scrollTop() - this.$window.height();
			} else {
				// TODO: Write code to calculate remaining pixels from inside of an HTML element

				return 0;
			}
		},

		/**
		 * Determine if the scrollable area has enough content to have a scrollbar
		 *
		 * @returns {boolean}
		 * @private
		 */
		_isScrollViewFull: function() {
			// TODO: Determine if the scrollable area has a scrollbar
			return false;
		},

		/**
		 * Determine if the scrollbar is within the threshold of the bottom of the scrollable area
		 *
		 * @returns {boolean}
		 * @private
		 */
		_isNearBottom: function() {
			// Get the number of pixels until the bottom of the scrolling area is reached, and scroll if it is
			return (this._getRemainingPixels() < this.options.pixelThreshold);
		},

		/**
		 * Determines if additional content should be loaded based on the direction of the scroll and position of the
		 * scrollbar within scrolling element. Also checks if the scrollbar is present on the scrolling element.
		 *
		 * @returns {boolean}
		 * @private
		 */
		_shouldLoad: function() {
			if (!this.state.isPaused && !this.state.isLoading) {
				// Load if the scroll bar is near the bottom of the view or the view is not full enough for a scrollbar
				return (this._isNearBottom() || !this._isScrollViewFull());
			}

			return false;
		},

		/**
		 * Wrapper method to handle inconsistencies between browsers when using logging methods. Anything passed into
		 * the method will be passed along to the `console.log` method
		 *
		 * @param {...} varargs All arguments are passed into `console.log`
		 * @private
		 */
		_debug: function(varargs) {
			if (true !== this.options.debug) {
				return;
			}

			if (typeof console !== "undefined" && typeof console.log === "function") {
				console.log(Array.prototype.slice.call(arguments));
			} else if (!Function.prototype.bind && typeof console !== "undefined" && typeof console.log === "object") {
				// IE 8
				Function.prototype.call.call(console.log, console, Array.prototype.slice.call(arguments));
			}
		},

		/**
		 * Handles the window's resize event and will load additional content if needed.
		 *
		 * @event
		 * @private
		 */
		_resize: function() {
			if (this._shouldLoad()) {
				var url = this._getUrl(++this.page);
				var contents = this._getPage(url, this.options.dataType);

				this.$container.append(contents);
			}
		},

		/**
		 * Handles the scroll event generated by the scrolling element. Will load additional content if necessary.
		 *
		 * @event
		 * @private
		 */
		_scroll: function() {
			if (this._shouldLoad()) {
				var url = this._getUrl(++this.page);
				var contents = this._getPage(url, this.options.dataType);

				this.$container.append(contents);
			}
		},

		// Public methods

		/**
		 * Removes all event handlers and data for the plugin instance
		 */
		destroy: function() {
			this.$container.removeData(DATA_KEY);
			this.$window.off(this.EVENTS.RESIZE);
			this.$scroll.off(this.EVENTS.SCROLL);
		},

		/**
		 * Stops the plugin from loading any new pages, or otherwise altering any plugin state. The plugin can be
		 * @see {@link resume}
		 */
		pause: function() {
			this.state.isPaused = true;
		},

		/**
		 * Allows the plugin to continue operating after having been paused
		 * @see {@link pause}
		 */
		resume: function() {
			this.state.isPaused = false;
		}
	};

	$.fn.infiniteScroll = function(options) {
		var type = typeof options;
		var instance = this.data(DATA_KEY);

		switch (type) {
			case "string":
				var args = Array.prototype.slice.call(arguments, 1);
				instance[options].apply(instance, args);
				break;
			default:
			case "object":
				if (!instance) {
					instance = new $.infiniteScroll(options, this);
					this.data(DATA_KEY, instance);
				}
				break;
		}
	};


	// Make console.log safe to use in all browsers
	// Based off of Gist by sx, in turn based on Paul Irish's log(): https://gist.github.com/sx/1793447
	(function(logger) {
		logger.info = logger.info || $.noop;
		logger.error = logger.error || logger.info;
	})(function() {
		try {
			console.log();
			return window.console;
		} catch (exception) {
			window.console = {};
			return window.console;
		}
	})();
})(jQuery, window);

