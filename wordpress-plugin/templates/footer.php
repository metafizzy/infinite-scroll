<?php
/**
 * Template to include on wp_footer front-end; passes plugin options to javascript function
 * @package Infinite_Scroll
 */
?>
<script type="text/javascript">
// Because the `wp_localize_script` method makes everything a string
infinite_scroll = jQuery.parseJSON(infinite_scroll);

jQuery( infinite_scroll.contentSelector ).infinitescroll( infinite_scroll, function(newElements, data, url) { eval(infinite_scroll.callback); });
</script>
