<?php
/**
 * Prompt to display when we want user to submit CSS Selectors to community database
 * @package Infinite_Scroll
 */
?>
<tr id="submit" valign="top">
	<th>&nbsp;</th>
	<td>
		<p class="description"><?php echo sprintf( __( 'Please consider <a href="%s">submitting your theme\'s CSS selectors</a> to the global CSS selector database to make installation and configuration easier for other users', 'infinite-scroll'), esc_url( add_query_arg( 'submit', true ) ) ); ?>
		
		<span style="font-size: 10px;">
			(<a href="#" id="hide-submit"><?php _e( 'hide this message', 'infinite-scroll' ); ?></a>)
		</span>
		</p>
		<?php wp_nonce_field( $this->parent->slug_ . '_hide_submit' , '_ajax_nonce-' . $this->parent->slug . '-hide-submit' ); ?>
		
		<?php $data = array( 'action' => $this->parent->slug_ . '_hide_submit', 'nonce' => '_ajax_nonce-' . $this->parent->slug . '-hide-submit' ); ?>
		
		<script>var submit = <?php echo json_encode( $data ); ?>;</script>
		
	</td>
</div>	 