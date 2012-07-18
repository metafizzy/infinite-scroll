// Calculate internal height (used for local scroll)
// this function is from the old localMode I think?
function infsrc_local_hiddenHeight(element) {
   var height = 0;
   jQuery(element).children().each(function() {
     height = height + jQuery(this).outerHeight(false);
   });
   return height;
}

jQuery.extend(jQuery.infinitescroll.prototype,{
   _nearbottom_local: function infscr_nearbottom_local() {
       var opts = this.options, instance = this,
           pixelsFromWindowBottomToBottom = infsrc_local_hiddenHeight(opts.binder)
               - jQuery(opts.binder).scrollTop() - jQuery(opts.binder).height();

       if (opts.local_pixelsFromNavToBottom == undefined){
           opts.local_pixelsFromNavToBottom = infsrc_local_hiddenHeight(opts.binder) +
		 jQuery(opts.binder).offset().top - jQuery(opts.navSelector).offset().top;
       }
       instance._debug('local math:', pixelsFromWindowBottomToBottom,
opts.local_pixelsFromNavToBottom);

       return (pixelsFromWindowBottomToBottom - opts.bufferPx < opts.local_pixelsFromNavToBottom);
   }
});
