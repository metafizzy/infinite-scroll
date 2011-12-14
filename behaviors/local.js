// Calculate internal height (used for local scroll)
// this function is from the old localMode I think?
function infsrc_local_hiddenHeight(element) {
   var height = 0;
   $(element).children().each(function() {
     height = height + $(this).outerHeight(false);
   });
   return height;
}

$.extend($.infinitescroll.prototype,{
   _nearbottom_local: function infscr_nearbottom_local() {
       var opts = this.options, instance = this,
           pixelsFromWindowBottomToBottom = infsrc_local_hiddenHeight(opts.binder)
               - $(opts.binder).scrollTop() - $(opts.binder).height();

       if (opts.local_pixelsFromNavToBottom == undefined){
           opts.local_pixelsFromNavToBottom = infsrc_local_hiddenHeight(opts.binder) +
		 $(opts.binder).offset().top - $(opts.navSelector).offset().top;
       }
       instance._debug('local math:', pixelsFromWindowBottomToBottom,
opts.local_pixelsFromNavToBottom);

       return (pixelsFromWindowBottomToBottom - opts.bufferPx < opts.local_pixelsFromNavToBottom);
   }
});
