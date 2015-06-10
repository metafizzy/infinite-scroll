// Calculate internal height (used for local scroll)
jQuery.extend(jQuery.infinitescroll.prototype, {
   _nearbottom_local: function infscr_nearbottom_local()
   {
       var opts   = this.options;
       var binder = $(opts.binder);

       return (binder.scrollTop() + binder.innerHeight() >= binder[0].scrollHeight - opts.bufferPx);
   }
});
