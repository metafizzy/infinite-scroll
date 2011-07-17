=== Plugin Name ===
Contributors: paul.irish, dirkhaim, beaver6813
Donate link: http://www.infinite-scroll.com
Tags: ajax, pagination, scrolling, scroll, endless, reading
Requires at least: 2.6
Tested up to: 3.2
Stable tag: 2.0b

Automatically append the next page of posts (via AJAX) to your page when a user scrolls to the bottom. 

== Description ==

Infinite Scroll adds the following functionality to your wordpress installation: **When a user scrolls towards the bottom of the page, the next page of posts is automatically retrieved and appended**. This means they never need to click "Next Page", which *dramatically increases stickiness*.

Features:

*   Fully embraces progressive enhancement: RSS readers and js-off folks will be happy.
*   Fully customizable by text, css, and images.
*   Works on 80% of wordpress themes, with little or no configuration.
*   Hackable source code to modify the behavior.
*   Tested back to 2.6, but probably works on earlier versions.
*   Requires no (hopefully) template hacking, only a knowledge of CSS selectors.

Full information on [infinite-scroll.com](http://www.infinite-scroll.com)


== Installation ==

1. Download the plugin.
1. Install it to your /wp-content/plugins/ directory
1. Activate the plugin in your Wordpress Admin UI.
1. Visit the Settings / Infinite Scroll page to [set up the css selectors](http://www.infinite-scroll.com/installation/).
1. The plugin will now work for a logged in Admin, but will be disabled for all other users; you can change this.


== Frequently Asked Questions ==

= Can I change the number of posts loaded? = 

Yup. But that's a Wordpress thing. Go to Settings / Reading 

= Why is this FAQ so short? = 

Because it is. Go to [infinite-scroll.com](http://www.infinite-scroll.com) for more.

== Screenshots ==

1. Loading the next set of posts

== Changelog ==
= 2.0b2.110713 = 
* Fixed multiple jQuery loaded conflicts.
* Now uses standard Wordpress javascript insertion.
* Loads locally stored jQuery 1.6.2 if current version is < 1.6
  this can only be detected through Wordpress now, hence the fix
  for multiple versions conflicting (some naughty themes don't
  use Wordpress's javascript loading).

= 2.0b2.110709 = 
* FIX: Default options not being recursively copied.
* Updated to new options layout.
* Callback fix.

= 2.0b2.110706 = 
* HTTPS loading image fix.
* Better debug support (switches between minified and non).

= 2.0b2.110629 = 
* Callback (custom javascript) fix.
* IE9 binding bug fix.

= 2.0b2.110628 = 
* Modified the method used to determine the link paths (bug fix)

= 2.0b2.110617 = 
* Updated core javascript to version 2.0b2.110617 (full revamp).
* General cleanup/tidy of plugin itself.
* Fixed bugs with numerical sub-domains (now uses site_url to determine path).
* Supports archives, tags, searches.
* Wider theme support.
* Simplified plugin options page, added loading image upload ability, added option for debug mode.
* Removed annoying reminder that showed on all admin pages.
* Forces 404 header when no more posts are available.


= 1.5.100504 =
* New appending technique using document fragments.
* Callback receives the contentSelector elem as its first argument,
    and an array of the new elements as the second argument

= 1.4.100210 =
Fixed small bug that jQuery 1.4 introduced.

= 1.4 =
Proper wordpress method (enqueue_script) removed because it just breaks too often
JS updated with some custom method action.

= 1.3 =
Use proper Wordpress function to register the javascript
Use plugins_url to determine plugin url

= 1.2 = 
* 2009 August 4th
* getoption(’siteurl’) fix made.
* jQuery plugin version updated. many more options available.
* Release backwards compatible

= 1.1 =
* 2008 September 25
* JavaScript rewritten as a proper jQuery plugin.
* Added animation

= 1.0 =
* June 29 - 1.0 release.

