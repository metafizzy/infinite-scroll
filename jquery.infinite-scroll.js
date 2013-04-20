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
			isLoading: false
		},

		// Private methods

		_init: function() {
			this.instanceId = INSTANCES++;
			this.page = this.options.page;
			this.path = this.options.path;
			this.fill = this.options.fill;

			this.$scroll = $(this.options.scrollSelector);
			this.$navigation = $(this.options.navigationSelector);
			this.$nextSelector = $(this.options.nextSelector);

			// If the path creation isn't overridden, create a path array by parsing the URL provided by the next selector
			var nextUrl = this.$nextSelector.attr("href");
			this.path = this.path || this._parsePath(nextUrl, this.page);

			// Setup a namespacing system for events so they can be added and removed without breaking other instances
			var EVENT_NAMESPACE = ".infinite-scroll" + this.instanceId;

			this.EVENTS = {
				// Triggered events
				LOADING_START: "loading" + EVENT_NAMESPACE,
				LOADING_COMPLETE: "loading" + EVENT_NAMESPACE,
				FINISHED: "finished" + EVENT_NAMESPACE,

				// Subscribed events
				RESIZE: "resize" + EVENT_NAMESPACE
			};

			if (this.fill) {
				this.$window.on(this.EVENTS.RESIZE, $.proxy(this._resize, this));
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

		_getUrl: function() {
			if ($.isFunction(this.path)) {
				return this.path(this.page);
			} else if ($.isArray(this.path)) {
				return this.path.join(this.page.toString());
			} else if (typeof this.path === "string") {
				return this.path;
			}
		},

		_getPage: function(url, data, dataType) {
			$.ajax({
				url: url,
				data: data,
				dataType: dataType,
				success: function(data) {
					console.log("Loaded:", data);
				},
				error: function(jqXHR) {
					console.log("Failed:", jqXHR);
				}
			});
		},

		_shouldLoad: function() {
			return true;
		},

		_debug: function() {
			// TODO: Write universal (that is IE8+) debugging method
		},

		/**
		 * Loads additional content into the scrolling area's viewport if it does not have a scrollbar present
		 *
		 * @event
		 * @private
		 */
		_resize: function() {
			// TODO: Load additional content if `this.$scroll` is not full
		},

		// Public methods

		/**
		 * Removes all event handlers and data for the plugin instance
		 */
		destroy: function() {
			this.$element.removeData(DATA_KEY);
			this.$window.off(this.EVENTS.RESIZE);
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
})(jQuery, window);

