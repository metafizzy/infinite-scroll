<?php
/**
 * Provides interface to store and retrieve plugin and user options
 * @subpackage Infinite_Scroll_Options
 * @package Infinite_Scroll
 */
class Infinite_Scroll_Options {

	//default scope for options when called directly,
	//choices: site, user, or global (user option across sites)
	public $defaults = array();
	private $parent;

	/**
	 * Stores parent class as static
	 * @param class $parent (reference) the parent class
	 */
	function __construct( &$parent ) {

		$this->parent = &$parent;

		add_action( 'admin_init', array( &$this, 'options_init' ) );
		add_filter( $this->parent->prefix . 'options', array( &$this, 'default_options_filter' ), 20 );
		add_filter( $this->parent->prefix . 'js_options', array( &$this, 'db_version_filter' ) );

	}


	/**
	 * Tells WP that we're using a custom settings field
	 */
	function options_init() {

		register_setting( $this->parent->slug_, $this->parent->slug_, array( &$this, 'validate' ) );

	}


	/**
	 * Runs options through filter prior to saving
	 * @param array $options the options array
	 * @return array sanitized options array
	 */
	function validate( $options ) {

		//add slashes to JS selectors
		$js = array ( 'nextSelector', 'navSelector', 'itemSelector', 'contentSelector' );
		foreach ( $js as $field ) {

			if ( !isset( $options[$field] ) )
				continue;

			$options[$field] = addslashes( $options[ $field ] );

		}

		//force post-style kses on messages
		foreach ( array( 'finishedMsg', 'msgText' ) as $field ) {

			if ( !isset( $options['loading'][$field] ) )
				continue;

			// wp_filter_post_kses will add slashes to something like "you've" -> "you\'ve" but not added slashes to other slashes
			// Escaping the slashes and then stripping them, gets past this problem and allows preservation of intentionally inserted slashes
			$options['loading'][$field] = stripslashes(wp_filter_post_kses( addslashes($options['loading'][$field] )));
		}
		
		//handle image resets
		if ( isset( $_POST[ 'reset_default_image'] ) )
			$options["loading"]['img'] = $this->defaults["loading"]['img'];
		
		//pull existing image if none is given
		if ( empty( $options["loading"]['img'] ) )
			$options["loading"]['img']  = $this->loading["img"];

		// force `debug` to be a bool
		$options["debug"] = (bool)$options["debug"];

		return apply_filters( $this->parent->prefix . 'options_validate', $options );

	}


	/**
	 * Allows overloading to get option value
	 * Usage: $value = $object->{option name}
	 * @param string $name the option name
	 * @return mixed the option value
	 */
	function __get( $name ) {

		return $this->get_option( $name );

	}


	/**
	 * Allows overloading to set option value
	 * Usage: $object->{option name} = $value
	 * @param string $name unique option key
	 * @param mixed $value the value to store
	 * @return bool success/fail
	 */
	function __set( $name, $value ) {

		return $this->set_option( $name, $value );

	}


	/**
	 * Retreive the options array
	 * @return array the options
	 */
	function get_options( ) {

		if ( !$options = wp_cache_get( 'options', $this->parent->slug ) ) {
			$options = get_option( $this->parent->slug_ );
			wp_cache_set( 'options', $options, $this->parent->slug );
		}

		return apply_filters( $this->parent->prefix . 'options', $options );
	}


	/**
	 * If any options are not set, merge with defaults
	 * @param array $options the saved options
	 * @return array the merged options with defaults
	 */
	function default_options_filter( $options ) {

		$options = wp_parse_args( $options,  $this->defaults );
		wp_cache_set( 'options', $options, $this->parent->slug );
		return $options;

	}


	/**
	 * Retreives a specific option
	 * @param string $option the unique option key
	 * @return mixed the value
	 */
	function get_option( $option ) {
		$options = $this->get_options( );
		$value = ( isset( $options[ $option ] ) ) ? $options[ $option ] : false;
		return apply_filters( $this->parent->prefix . $option, $value );
	}


	/**
	 * Sets a specific option
	 * @return bool success/fail
	 * @param string $key the unique option key
	 * @param mixed $value the value
	 */
	function set_option( $key, $value ) {
		$options = array( $key => $value );
		$this->set_options( $options );
	}


	/**
	 * Sets all plugin options
	 * @param array $options the options array
	 * @param bool $merge (optional) whether or not to merge options arrays or overwrite
	 * @return bool success/fail
	 */
	function set_options( $options, $merge = true ) {

		if ( $merge ) {
			$defaults = $this->get_options();
			$options = wp_parse_args( $options, $defaults );
		}

		wp_cache_set( 'options', $options, $this->parent->slug );

		return update_option( $this->parent->slug_, $options );

	}
	
	/**
	 * Don't output db_version to front end when passing args to javascript function
	 */
	function db_version_filter( $options ) {
		unset( $options['db_version'] );
		return $options;
	}

}
