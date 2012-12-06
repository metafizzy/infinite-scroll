<?php
/*
Plugin Name: Infinite Scroll
Description: Automatically loads the next page of posts into the bottom of the initial page.
Version: 2.6
Author: Beaver6813, dirkhaim, Paul Irish, benbalter, Glenn Nelson
Author URI:
License: GPL3
*/

/*  Copyright 2008-2012 Beaver6813, dirkhaim, Paul Irish, Benjamin J. Balter, Glenn Nelson
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *  @copyright 2008-2012
 *  @license GPL v3
 *  @version 2.6
 *  @package Infinite Scroll
 *  @author Beaver6813, dirkhaim, Paul Irish, Benjamin J. Balter, Glenn Nelson
 */

require_once dirname( __FILE__ ) . '/includes/options.php';
require_once dirname( __FILE__ ) . '/includes/admin.php';
require_once dirname( __FILE__ ) . '/includes/presets.php';
require_once dirname( __FILE__ ) . '/includes/submit.php';

class Infinite_Scroll {

	static $instance;
	public $options;
	public $admin;
	public $submit;
	public $name      = 'Infinite Scroll'; //Human-readable name of plugin
	public $slug      = 'infinite-scroll'; //plugin slug, generally base filename and in url on wordpress.org
	public $slug_     = 'infinite_scroll'; //slug with underscores (PHP/JS safe)
	public $prefix    = 'infinite_scroll_'; //prefix to append to all options, API calls, etc. w/ trailing underscore
	public $file      = null;
	public $version   = '2.6';

	/**
	 * Construct the primary class and auto-load all child classes
	 */
	function __construct() {

		self::$instance = &$this;
		$this->file    = __FILE__;
		$this->admin   = new Infinite_Scroll_Admin( $this );
		$this->options = new Infinite_Scroll_Options( $this );
		$this->presets = new Infinite_Scroll_Presets( $this );
		$this->submit = new Infinite_Scroll_Submit( $this );

		//upgrade db
		add_action( 'admin_init', array( &$this, 'upgrade_check' ) );

		//i18n
		add_action( 'init', array( &$this, 'i18n' ) );

		//default options
		add_action( 'init', array( &$this, 'init_defaults' ) );

		//js
		add_action( 'wp_enqueue_scripts', array( &$this, 'enqueue_js' ) );
		add_action( 'wp_footer', array( &$this, 'footer' ), 100 ); //low priority will load after i18n and script loads

		//preset cron
		register_activation_hook( __FILE__, array( &$this->presets, 'schedule' ) );
		register_deactivation_hook( __FILE__, array( &$this->presets, 'unschedule' ) );

		//404 fix
		add_action( 'wp', array( &$this, 'paged_404_fix' ) );

	}


	/**
	 * Init default options
	 */
	function init_defaults() {

		//option keys map to javascript options and are passed directly via wp_localize_script
		$this->options->defaults = array(
			'loading' => array(
				'msgText'         => __( '<em>Loading...</em>', 'infinite-scroll' ),
				'finishedMsg'     => __( '<em>No additional posts.</em>', 'infinite-scroll' ),
				'img'             => plugins_url( 'img/ajax-loader.gif', __FILE__ )
			),
			'nextSelector'    => '#nav-below a:first',
			'navSelector'     => '#nav-below',
			'itemSelector'    => '.post',
			'contentSelector' => '#content',
			'debug'           => WP_DEBUG,
		);

	}


	/**
	 * Enqueue front-end JS and pass options to json_encoded array
	 */
	function enqueue_js() {

		//no need to show on singular pages
		if ( is_singular() )
			return;

		$suffix = ( WP_DEBUG ) ? '.dev' : '';

		$file = "/js/front-end/jquery.infinitescroll{$suffix}.js";
		wp_enqueue_script( $this->slug, plugins_url( $file, __FILE__ ), array( 'jquery' ), $this->version, true );

		$options = apply_filters( $this->prefix . 'js_options', $this->options->get_options() );
		wp_localize_script( $this->slug, $this->slug_, $options );

		// Output a behavior script if needed
		if ($options["behavior"]) {
			$scripts["twitter"] = "manual-trigger.js";
			$scripts["local"] = "local.js";
			$scripts["cufon"] = "cufon.js";
			$scripts["masonry"] = "masonry-isotope.js";

			$behaviorFile = $scripts[$options["behavior"]];

			if ($behaviorFile) {
				$behaviorFile = "/behaviors/" . $behaviorFile;
				wp_enqueue_script($this->slug . "-behavior", plugins_url($behaviorFile, __FILE__),
					array("jquery", $this->slug), $this->version, true);
			}
		}
	}

	/**
	 * Load footer template to pass options array to JS
	 */
	function footer() {
		require dirname( __FILE__ ) . '/templates/footer.php';
	}


	/**
	 * Init i18n files
	 */
	function i18n() {
		load_plugin_textdomain( $this->slug, false, plugin_basename( dirname( __FILE__ ) ) . '/languages/' );
	}


	/**
	 * Upgrades DB
	 * Fires on admin init to support SVN
	 */
	function upgrade_check() {

		if ( $this->options->db_version == $this->version )
			return;

		$this->upgrade( $this->options->db_version, $this->version );

		do_action( $this->prefix . 'upgrade', $this->version, $this->options->db_version );

		$this->options->db_version = $this->version;

	}


	/**
	 * Upgrade DB to latest version
	 * @param int $from version coming from
	 * @param int $to version going to
	 */
	function upgrade( $from , $to ) {
		if ($from == 2.5) {
			$old = get_option("infinite_scroll");
			$new = $old;

			$new["loading"]["img"] = $old["img"];
			unset($new["img"]);

			$this->options->set_options($new);

		} else if ($from < 2.5) {
			//array of option conversions in the form of from => to
			$map = array(
				'js_calls' => 'callback',
				'image' => 'img',
				'text' => 'msgText',
				'donetext' => 'finishedMsg',
				'content_selector' => 'contentSelector',
				'post_selector' => 'itemSelector',
				'nav_selector' => 'navSelector',
				'next_selector' => 'nextSelector',
				'behavior' => 'behavior',
				'debug' => 'debug',
			);

			$old = get_option( 'infscr_options' );
			$new = array();

			//really old legacy options storage
			//each option is stored as its own option in the options table
			if ( !$old ) {
				//loop through options and attempt to find
				foreach ( array_keys( $map ) as $option ) {
					$legacy = get_option( 'infscr_' . $option );

					if ( !$legacy )
						continue;

					//move to new option array and delete old
					$new[ $map[ $option ] ] = $legacy;
					delete_option( 'infscr_' . $option );
				}
			}

			//pre 2.5 options storage
			//all stuffed in a single array, but not properly keyed
			foreach ( $map as $from => $to ) {

				if ( !$old || !isset( $old[ 'infscr_' . $from ] ) )
					continue;

				$new[ $to ] = $old[ 'infscr_' . $from ];

			}

			//regardless of which upgrade we did, move loading string to array
			$new['loading'] = array( );

			foreach ( array( 'finishedMsg', 'msgText', "img" ) as $field ) {
				if ( isset( $new[$field] ) ) {
					$new['loading'][$field] = $new[$field];
					unset( $new[$field] );
				}
			}

			//if the user is still using the default ajax-loader.gif then update the location
			if( isset($new["loading"]['img']) && !strstr($new["loading"]["img"], "/img/ajax-loader.gif") )
				$new["loading"]['img'] = str_replace("/ajax-loader.gif",
					"/img/ajax-loader.gif",
					$new["loading"]['img']);

			//regardless of which upgrade, ensure that debug is now set to boolean string rather than int
			//if it wasn't originally on then just set it to the plugin default
			if( isset($new['debug']) && $new['debug'] == 1 )
				$new['debug'] = "true";
			else
				unset( $new['debug'] );

			//don't pass an empty array so the default filter can properly set defaults
			if ( empty( $new['loading'] ) )
				unset( $new['loading'] );

			$this->options->set_options( $new );
			delete_option( 'infscr_options' );

			//migrate presets
			if ( $from < 2.5 )
				$this->presets->migrate();
		}
	}


	/**
	 * If we go beyond the last page and request a page that doesn't exist,
	 * force WordPress to return a 404.
	 * See http://core.trac.wordpress.org/ticket/15770
	 */
	function paged_404_fix( ) {
		global $wp_query;

		if ( is_404() || !is_paged() || 0 != count( $wp_query->posts ) )
			return;

		$wp_query->set_404();
		status_header( 404 );
		nocache_headers();

	}


}


$infinite_scroll = new Infinite_Scroll();
