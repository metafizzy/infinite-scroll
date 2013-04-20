/*jshint undef: true */

(function($, window, undefined) {
	"use strict";

	var EVENT_NAMESPACE = ".infinite-scroll";

	var EVENTS = {
		// Triggered events
		loadingStart: "loading" + EVENT_NAMESPACE,
		loadingComplete: "loading" + EVENT_NAMESPACE,
		finished: "finished" + EVENT_NAMESPACE

		// Subscribed events
	};

	$.infiniteScroll = function(options, element) {
		this.$element = $(element);
		this.options = $.extend({}, this.defaults, options);
	};

	$.defaults = {
		navigationSelector: "",
		nextSelector: "",
		itemSelector: "",
		debug: false,
		path: undefined

		// TODO: Rethink plugin ("behavior") loader to allow for multiple plugins
	};

	$.infiniteScroll.prototype = {
		// Private methods

		_init: function() {
			this.pageNumber = 1;
		},

		_getPath: function(pageNumber) {
			// TODO: Create heuristics similar to what is in Infinite-Scroll 
			return ["/page/", "?query=value"];
		},

		_getUrl: function() {
			return this._getPath(this.pageNumber).join(this.pageNumber);
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

		_debug: function() {
			// TODO: Write universal (that is IE8+) debugging method
		},

		// Public methods

		destroy: function() {

		},

		pause: function() {

		},

		resume: function() {

		}
	};

	$.fn.infiniteScroll = function(options) {
		var type = typeof options;
		var instance = this.data("infiniteScroll");

		switch (type) {
			case "string":
				var args = Array.prototype.slice.call(arguments, 1);
				instance[options].apply(instance, args);
				break;
			default:
			case "object":
				if (!instance) {
					instance = new $.infiniteScroll(options, this);
				}
				break;
		}
	};
})(jQuery, window);

