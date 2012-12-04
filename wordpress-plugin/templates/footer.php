<?php
/**
 * Template to include on wp_footer front-end; passes plugin options to javascript function
 * @package Infinite_Scroll
 */
?>
<script type="text/javascript">jQuery( infinite_scroll.contentSelector ).infinitescroll( infinite_scroll, function(data) { eval(infinite_scroll.callback); });</script>
