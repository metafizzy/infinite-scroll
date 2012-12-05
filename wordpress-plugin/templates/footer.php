<?php
/**
 * Template to include on wp_footer front-end; passes plugin options to javascript function
 * @package Infinite_Scroll
 */
?>
<script type="text/javascript">
// Because the `wp_localize_script` method makes everything a string
infinite_scroll.debug = "true" === infinite_scroll.debug;

jQuery( infinite_scroll.contentSelector ).infinitescroll( infinite_scroll, function(data) { eval(infinite_scroll.callback); });
</script>
