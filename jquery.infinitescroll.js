(function(window, $, undefined)
{
	"use strict";

	$.infinitescroll = function infscr(options, element)
	{
		this.element = $(element);

		// Flag the object in the event of a failed creation
		if (!this._create(options)) {
			this.failed = true;
		}
	};

	$.infinitescroll.defaults = {
		loading : {
			finished : undefined,
			finishedMsg : "<em></em>",
			img : undefined,
			msg : null,
			msgText : "<em></em>",
			selector : null,
			speed : 'fast',
			start : undefined
		},

		state : {
			isDuringAjax : false,
			isInvalidPage : false,
			isDestroyed : false,
			isDone : false, // For when it goes all the way through the archive.
			isPaused : false,
			currPage : 1,
			params : undefined
		},

		errorCallback : function()
		{
		},

		successCallback : function()
		{
		},

		datasourceFn : undefined,

		debug : false,
		behavior : undefined,
		binder : $(window), // used to cache the selector for the element that
		overflowDiv : $(document),// infinite scroll in modal popups or in iframes
		
		extraScrollPx : 150,
		animate : false,
		dataType : 'datasource',
		bufferPx : 40,
		prefill : false,
		scrollTop : false,
		data : undefined,
		infid : 0, // Instance ID
		maxPage : undefined
	// to manually control maximum page (when maxPage is undefined, maximum page
	// limitation is not work)
	};

	$.infinitescroll.prototype = {
		// Bind or unbind from scroll
		_binding : function infscr_binding(binding)
		{
			var instance = this, opts = instance.options;

			opts.v = '2.0b2.120520';

			// if behavior is defined and this function is extended, call that
			// instead of default
			if (!!opts.behavior && instance['_binding_' + opts.behavior] !== undefined) {
				instance['_binding_' + opts.behavior].call(instance);
				return;
			}

			if (binding !== 'bind' && binding !== 'unbind') {
				instance._debug('Binding value  ' + binding + ' not valid');
				return false;
			}

			if (binding === 'unbind') {
				(instance.options.binder).unbind('smartscroll.infscr.' + instance.options.infid);
			} else {
				(instance.options.binder)[binding]('smartscroll.infscr.' + instance.options.infid, function()
				{
					instance.scroll();
				});
			}

			instance._debug('Binding', binding);
		},

		// Fundamental aspects of the plugin are initialized
		_create : function infscr_create(options)
		{
			// Add custom options to defaults
			var opts = $.extend(true, {}, $.infinitescroll.defaults, options);
			var instance = this;
			instance.options = opts;
			var $window = opts.binder;

			var callback = opts.successCallback;

			// Validate selectors
			if (!instance._validate(options)) {
				return false;
			}

			opts.loading.selector = opts.loading.selector || instance.element;

			// Define loading.msg
			if (opts.loading.img) {
				opts.loading.msg = opts.loading.msg
						|| $('<div id="infscr-loading"><img alt="Loading..." src="' + opts.loading.img + '" /><div>'
								+ opts.loading.msgText + '</div></div>');

				// Preload loading.img
				(new Image()).src = opts.loading.img;
			} else {
				opts.loading.msg = opts.loading.msg || $('<div id="infscr-loading">' + opts.loading.msgText + '</div>');
			}

			// determine loading.start actions
			opts.loading.start = opts.loading.start || function()
			{
				opts.loading.msg.appendTo(opts.loading.selector).show(opts.loading.speed, $.proxy(function()
				{
					instance.beginDataSource(opts);
				}, instance));
			};

			// determine loading.finished actions
			opts.loading.finished = opts.loading.finished || function()
			{
				opts.loading.msg.fadeOut(opts.loading.speed);
			};

			// callback loading
			opts.successCallback = function(instance, data)
			{
				if (!!opts.behavior && instance['_successCallback_' + opts.behavior] !== undefined) {
					instance['_successCallback_' + opts.behavior].call(instance.element[0], data);
				}

				if (callback) {
					callback.call(instance, opts, data);
				}

				var $window = instance.options.binder;
				var $document = instance.options.overflowDiv;

				if ($document.height() <= $window.height()) {
					instance.scroll();
				}
			};

			if (options.debug) {
				// Tell IE9 to use its built-in console
				if (Function.prototype.bind && (typeof console === 'object' || typeof console === 'function')
						&& typeof console.log === "object") {
					[ "log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd" ].forEach(
							function(method)
							{
								console[method] = instance.call(console[method], console);
							}, Function.prototype.bind);
				}
			}

			instance._setup();

			// Setups the prefill method for use
			if (opts.prefill) {
				instance.scroll();
			}

			// Return true to indicate successful creation
			return true;
		},

		// Console log wrapper
		_debug : function infscr_debug()
		{
			var instance = this;
			if (true !== instance.options.debug) {
				return;
			}

			if (typeof console !== 'undefined' && typeof console.log === 'function') {
				// Modern browsers
				// Single argument, which is a string
				if ((Array.prototype.slice.call(arguments)).length === 1
						&& typeof Array.prototype.slice.call(arguments)[0] === 'string') {
					console.log((Array.prototype.slice.call(arguments)).toString());
				} else {
					console.log(Array.prototype.slice.call(arguments));
				}
			} else if (!Function.prototype.bind && typeof console !== 'undefined' && typeof console.log === 'object') {
				// IE8
				Function.prototype.call.call(console.log, console, Array.prototype.slice.call(arguments));
			}
		},

		// Custom error
		_error : function infscr_error(state)
		{
			if (state === 'end') {
				this._showdonemsg();
			}
			this._binding('unbind');

		},

		// Load Callback
		_loadcallback : function infscr_loadcallback(data)
		{
			var instance = this, opts = instance.options, callback = instance.options.successCallback; // GLOBAL
			// OBJECT
			// FOR
			// CALLBACK

			// if behavior is defined and this function is extended, call that
			// instead of default
			if (!!opts.behavior && instance['_loadcallback_' + opts.behavior] !== undefined) {
				instance['_loadcallback_' + opts.behavior].call(instance, data);
				return;
			}

			// loadingEnd function
			opts.loading.finished.call(instance.element[0], opts);

			// smooth scroll to ease in the new content
			if (opts.animate) {
				var scrollTo = opts.binder.scrollTop() + $('#infscr-loading').height() + opts.extraScrollPx + 'px';
				$('html,body').animate({
					scrollTop : scrollTo
				}, 800, function()
				{
					opts.state.isDuringAjax = false;
				});
			}

			if (!opts.animate) {
				// once the call is done, we can allow it again.
				opts.state.isDuringAjax = false;
			}

			callback(instance, data);
		},

		_nearbottom : function infscr_nearbottom()
		{
			var instance = this;
			var opts = instance.options;
			var pixelsFromWindowTop = opts.binder.scrollTop() + opts.binder.height();
			var pixelsFromWindowTopToBottom = opts.overflowDiv.height() - pixelsFromWindowTop;

			// if behavior is defined and this function is extended, call that
			// instead of default
			if (!!opts.behavior && instance['_nearbottom_' + opts.behavior] !== undefined) {
				return instance['_nearbottom_' + opts.behavior].call(instance);
			}

			instance._debug('math:', pixelsFromWindowTopToBottom, opts.bufferPx);

			// if distance remaining in the scroll (including buffer) is less
			// than the original next to bottom....
			return pixelsFromWindowTopToBottom < opts.bufferPx;
		},

		_neartop : function infscr_neartop()
		{
			var instance = this;
			var opts = instance.options;
			var pixelsFromWindowTop = opts.binder.scrollTop();

			// if behavior is defined and this function is extended, call that
			// instead of default
			if (!!opts.behavior && instance['_neartop_' + opts.behavior] !== undefined) {
				return instance['_neartop_' + opts.behavior].call(instance);
			}

			instance._debug('math:', pixelsFromWindowTop, opts.bufferPx);

			// if distance remaining in the scroll (including buffer) is less
			// than the original next to top....
			return pixelsFromWindowTop < opts.bufferPx;
		},

		// Pause / temporarily disable plugin from firing
		_pausing : function infscr_pausing(pause)
		{
			var instance = this, opts = instance.options;

			// if behavior is defined and this function is extended, call that
			// instead of default
			if (!!opts.behavior && instance['_pausing_' + opts.behavior] !== undefined) {
				instance['_pausing_' + opts.behavior].call(instance, pause);
				return;
			}

			// If pause is not 'pause' or 'resume', toggle it's value
			if (pause !== 'pause' && pause !== 'resume' && pause !== null) {
				instance._debug('Invalid argument. Toggling pause value instead');
			}

			pause = (pause && (pause === 'pause' || pause === 'resume')) ? pause : 'toggle';

			switch (pause) {
				case 'pause':
					opts.state.isPaused = true;
					break;

				case 'resume':
					opts.state.isPaused = false;
					break;

				case 'toggle':
					opts.state.isPaused = !opts.state.isPaused;
					break;
			}

			instance._debug('Paused', opts.state.isPaused);
			return false;
		},

		// Behavior is determined If the behavior option is undefined, it will
		// set to default and bind to scroll
		_setup : function infscr_setup()
		{
			var instance = this, opts = instance.options;

			// if behavior is defined and this function is extended, call that
			// instead of default
			if (!!opts.behavior && instance['_setup_' + opts.behavior] !== undefined) {
				instance['_setup_' + opts.behavior].call(instance);
				return;
			}

			instance._binding('bind');

			return false;
		},

		// Show done message
		_showdonemsg : function infscr_showdonemsg()
		{
			var instance = this, opts = instance.options;

			// if behavior is defined and this function is extended, call that
			// instead of default
			if (!!opts.behavior && instance['_showdonemsg_' + opts.behavior] !== undefined) {
				instance['_showdonemsg_' + opts.behavior].call(instance);
				return;
			}

			opts.loading.msg.find('img').hide().parent().find('div').html(opts.loading.finishedMsg).animate({
				opacity : 1
			}, 2000, function()
			{
				$(this).parent().fadeOut(opts.loading.speed);
			});
		},

		// grab each selector option and see if any fail
		_validate : function infscr_validate(opts)
		{
			var instance = this;
			for ( var key in opts) {
				if (key.indexOf && key.indexOf('Selector') > -1 && $(opts[key]).length === 0) {
					instance._debug('Your ' + key + ' found no elements.');
					return false;
				}
			}

			return true;
		},

		/*
		 * ---------------------------- Public methods
		 * ----------------------------
		 */

		// Bind to scroll
		bind : function infscr_bind()
		{
			this._binding('bind');
		},

		// Destroy current instance of plugin
		destroy : function infscr_destroy()
		{
			var instance = this;
			instance.options.state.isDestroyed = true;
			instance.options.loading.finished();
			return instance._error('destroy');
		},

		// Set pause value to false
		pause : function infscr_pause()
		{
			this._pausing('pause');
		},

		// Set pause value to false
		resume : function infscr_resume()
		{
			this._pausing('resume');
		},

		beginDataSource : function infscr_dataSource(opts)
		{
			var instance = this;
			opts.state.currPage++;

			// Manually control maximum page
			if (opts.maxPage != undefined && opts.state.currPage > opts.maxPage) {
				instance.destroy();
				return;
			}

			var successCallback = function(dataInfo)
			{
				opts.data = $.extend({}, opts.data, dataInfo.data);
				opts.state.params = $.extend(true, {}, opts.state.params, dataInfo.params);

				switch (opts.dataType) {
					case 'datasource':
						instance._debug('Using ' + (opts.dataType.toUpperCase()) + ' via custom ajax() method');
						instance._loadcallback(opts.data);
						break;
				}
			};

			var failureCallback = function(err)
			{
				opts.errorCallback(err);
			};

			opts.datasourceFn(opts.state.currPage, opts.state.params, successCallback, failureCallback);
			instance._debug('heading into datasource');

		},

		// Retrieve next set of content items
		retrieve : function infscr_retrieve(pageNum)
		{
			pageNum = pageNum || null;

			var instance = this, opts = instance.options;

			// if behavior is defined and this function is extended, call that
			// instead of default
			if (!!opts.behavior && instance['retrieve_' + opts.behavior] !== undefined) {
				instance['retrieve_' + opts.behavior].call(this, pageNum);
				return;
			}

			// for manual triggers, if destroyed, get out of here
			if (opts.state.isDestroyed) {
				instance._debug('Instance is destroyed');
				return false;
			}

			// we dont want to fire the ajax multiple times
			opts.state.isDuringAjax = true;

			opts.loading.start.call(instance.element[0], opts);
		},

		// Check to see next page is needed
		scroll : function infscr_scroll()
		{
			var instance = this, opts = instance.options, state = opts.state;

			// if behavior is defined and this function is extended, call that
			// instead of default
			if (!!opts.behavior && instance['scroll_' + opts.behavior] !== undefined) {
				instance['scroll_' + opts.behavior].call(instance);
				return;
			}

			if (state.isDuringAjax || state.isInvalidPage || state.isDone || state.isDestroyed || state.isPaused) {
				return;
			}

			if (!opts.scrollTop && !instance._nearbottom()) {
				return;
			} else if (opts.scrollTop && !instance._neartop()) {
				return;
			}

			instance.retrieve();
		},

		// Toggle pause value
		toggle : function infscr_toggle()
		{
			this._pausing();
		},

		// Unbind from scroll
		unbind : function infscr_unbind()
		{
			this._binding('unbind');
		},

		// update options
		update : function infscr_options(key)
		{
			if ($.isPlainObject(key)) {
				this.options = $.extend(true, this.options, key);
			}
		},

		// start scroll
		startScroll : function infscr_startScroll(initialParameters)
		{
			this.options.state.params = $.extend(true, {}, this.options.state.params, initialParameters);
		},

		// end scroll
		endScroll : function infscr_endScroll()
		{
			this._error('end');
		}
	};

	$.fn.infinitescroll = function infscr_init(options)
	{
		var thisCall = typeof options;

		switch (thisCall) {
			// method
			case 'string':
				var args = Array.prototype.slice.call(arguments, 1);

				this.each(function()
				{
					var instance = $.data(this, 'infinitescroll');

					if (!instance) {
						// not setup yet
						// return $.error('Method ' + options + ' cannot be
						// called until Infinite Scroll is setup');
						return false;
					}

					if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
						// return $.error('No such method ' + options + ' for
						// Infinite Scroll');
						return false;
					}

					// no errors!
					instance[options].apply(instance, args);
				});

				break;

			// creation
			case 'object':
				this.each(function()
				{
					var instance = $.data(this, 'infinitescroll');

					if (instance) {
						// update options of current instance
						instance.update(options);
					} else {
						// initialize new instance
						instance = new $.infinitescroll(options, this);

						// don't attach if instantiation failed
						if (!instance.failed) {
							$.data(this, 'infinitescroll', instance);
						}
					}
				});

				break;
		}

		return this;
	};

	var event = $.event, scrollTimeout;

	event.special.smartscroll = {
		setup : function()
		{
			$(this).bind("scroll", event.special.smartscroll.handler);
		},

		teardown : function()
		{
			$(this).unbind("scroll", event.special.smartscroll.handler);
		},

		handler : function(event, execAsap)
		{
			// Save the context
			var context = this, args = arguments;
			// set correct event type
			event.type = "smartscroll";

			if (scrollTimeout) {
				clearTimeout(scrollTimeout);
			}
			scrollTimeout = setTimeout(function()
			{
				$.event.dispatch.apply(context, args);
			}, execAsap === "execAsap" ? 0 : 10);
		}
	};
})(window, jQuery);
