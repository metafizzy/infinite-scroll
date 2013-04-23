/*jshint undef: true */

(function($, window, undefined) {
	"use strict";

	var INSTANCES = 0;

	var DATA_KEY = "infiniteScroll";

	$.infiniteScroll = function(options, element) {
		this.$element = $(element);
		this.$window = $(window);
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
		fill: true

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
		},

		_getPage: function(url, data, dataType) {
			var pluginContext = this;

			this.$element.trigger(pluginContext.EVENTS.LOADING_START);

			$.ajax({
				url: url,
				data: data,
				dataType: dataType
			}).done(function(data, textStatus, jqXHR) {
				pluginContext._debug("Loaded" + jqXHR.url);
				console.log("Loaded:", data);
			}).fail(function(jqXHR, textStatus, errorThrown) {
				console.log("Failed to load", jqXHR.url, errorThrown);
				// TODO: Provide check to determine if the plugin should terminate
			}).then(function() {
				pluginContext.state.isLoading = false;
				pluginContext.$element.trigger(pluginContext.EVENTS.LOADING_END);
			});
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
				// TODO: Write logic to determine if content should be loaded
				// TODO: Check if the scrollbar is close enough to the bottom of the scrollable area
				// TODO: Check if the scrollable area is large enough to have scrollbar
				return true;
			}

			return false;
		},

		/**
		 * Wrapper method to handle inconsistencies between browsers when using logging methods. Anything passed into
		 * the method will be passed along to the `console.log` method
		 *
		 * @private
		 */
		_debug: function() {
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
				// TODO: Load additional content if `this.$scroll` is not full
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
				// TODO: Determine the direction (up or down) and load content
			}
		},

		// Public methods

		/**
		 * Removes all event handlers and data for the plugin instance
		 */
		destroy: function() {
			this.$element.removeData(DATA_KEY);
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

