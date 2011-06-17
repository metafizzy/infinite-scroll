/*
	--------------------------------
	Infinite Scroll Behavior
	Masonry Integration
	--------------------------------
	+ https://github.com/paulirish/infinitescroll/
	+ version 2.0b2.110617
	+ Copyright 2011 Paul Irish & Luke Shumard
	+ Licensed under the MIT license
	
	+ Documentation: http://infinite-scroll.com/
	
*/

$.extend($.infinitescroll.prototype,{
	
	_setup_masonry: function infscr_setup_masonry () {
		
		var opts = this.options,
			instance = this;
			
		this._binding('bind');
		
	},
	
	_loadcallback_masonry: function infscr_loadcallback_masonry (box,data) {
		
		var opts = this.options,
    		callback = this.options.callback,
    		result = (opts.isDone) ? 'done' : 'append',
    		frag;

        switch (result) {

            case 'done':

                this._showdonemsg();
                return false;

                break;

            case 'append':

                var children = box.children();

                // if it didn't return anything
                if (children.length == 0) {
                    return this._error('end');
                }


                // use a documentFragment because it works when content is going into a table or UL
                frag = document.createDocumentFragment();
                while (box[0].firstChild) {
                    frag.appendChild(box[0].firstChild);
                }

                this._debug('contentSelector', $(opts.contentSelector)[0])
                
				// instead of the standard append, we use masonry's appended method
				$(opts.contentSelector)[0].masonry('appended',frag);
                
                data = children.get();


                break;

        }

        // loadingEnd function
		opts.loadingEnd.call($(opts.contentSelector)[0],opts)
        

        // smooth scroll to ease in the new content
        if (opts.animate) {
            var scrollTo = $(window).scrollTop() + $('#infscr-loading').height() + opts.extraScrollPx + 'px';
            $('html,body').animate({ scrollTop: scrollTo }, 800, function () { opts.isDuringAjax = false; });
        }

        if (!opts.animate) opts.isDuringAjax = false; // once the call is done, we can allow it again.

        callback.call($(opts.contentSelector)[0], data);
	}
	
});