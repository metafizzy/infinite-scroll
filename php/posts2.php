<?php

	/*
	 * infinite scrolling pattern applied to a PHP script
     * that generates content based on 
     * 
     * 1) current page number (gpage)
     * 2) last record id on previous page (gpa)
     *  
     * 
     * Please note that pathParse function is used to return the URL for page #2.
     * for page #2 - we just return the URL inside next selector.
     * 
     * on subsequent fetch (page #3 onwards) we overwrite the plugin options.path variable 
     * with the URL in next selector of page.
     * 
     * This example illustrates updating nextURL from next page content.
     * The plugin assumption that only current page number is changing for 
     * next URL is very restrictive.
     * 
     * 
     * 
     * installation : just create a test/infinite folder inside your DocumentRoot
     * and drop posts2.php script there
     * 
     * To Test : access  http://<your-host>/test/infinite/posts2.php in your browser
     * 
     * This script will add 25 boxes of random strings on page load with gpage (current page number)
     * and gpa (last_record_id) variable
     * 
	 * @author Rajeev Jha (https://github.com/rjha)
     * 
     * 
	 */
	
	function getRandomString($length = 8) {
	    $characters = '123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	    $string = '';

	    for ($i = 0; $i < $length; $i++) {
	        $string .= $characters[mt_rand(0, strlen($characters) - 1)];
	    }

	    return $string;
	}

	$page = isset($_REQUEST["gpage"]) ? $_REQUEST["gpage"] : 1 ;
    $gpa = 0 ;

    if($page > 1 ) {
         if(!isset($_REQUEST["gpa"])) {
            trigger_error("required parameter gpa is missing");
         } else {
            $gpa = $_REQUEST["gpa"];
         }
    }

	$records = array();
	$count = 0 ;

	
	while($count < 25) {

		$record = "" ;
		$words = 10*mt_rand(1,6); 

		while($words > 0 ) {
			$record .= " ".getRandomString();
			$words-- ;
		}

		$records[] = $record ;
		$count++ ;

	} 

    $gpa = $gpa + $count ;
    $nextUrl = "/test/infinite/posts2.php?gpage=".($page+1)."&gpa=".$gpa ;

	

?>

<!DOCTYPE html>
<html>

    <head>
	    <title> infinite scrolling applied to PHP pagination with performance  </title>
	    <meta charset="utf-8">

	    <style type="text/css">

	    	.box {
	    		overflow : hidden;
	    		width:600px;
	    		padding:20px;
	    		margin-top:20px;
	    		border:1px solid black;
	    		text-align:justify;
	    	}

	    </style>

    </head>
    <body>
    	<div class="container">
    		<div id="boxes">
    			<?php 
    				$count = 1 ;
    				foreach($records as $record) {
    					printf("<div class=\"box\">");
    					printf("<h3> page %s - gpa - %s - record %s </h3>",$page,$gpa,$count);
    					printf($record);
    					printf("</div>");
    					$count++ ;
    				}
    			?>
    		</div>

    	</div>
    	<div id="scroll-loading"> </div>

    	<ul class="pager"> 
    		<li> <a rel="next" href="<?php echo $nextUrl; ?>">Next &rarr;</a> <li> 
    	</ul>
        
    	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
    	<script type="text/javascript" src="https://raw.github.com/paulirish/infinite-scroll/master/jquery.infinitescroll.js"></script>


        <script type="text/javascript">
            
            $(function(){

                var $container = $('#boxes');

                $container.infinitescroll(
                    {
                        navSelector  	: '.pager',
                        nextSelector 	: '.pager a[rel="next"]',
                        itemSelector : '.box',
                        bufferPx : 80,
                        behavior : "webgloo",
                        pathParse : function (path,number) {
                            console.log("pathParse received : " + path);
                            return path ;
                        },

                        loading : {
                            selector : "#scroll-loading",
                            msgText: "<em>Please wait. Loading more items...</em>",
                            finishedMsg : "<b> You have reached the end of this page </b>",
                            speed: "slow"

                        }

                    }
                );

                $.extend($.infinitescroll.prototype,{

                    retrieve_webgloo : function infscr_retrieve_webgloo(pageNum) {

                        var opts = this.options,
                        instance = this,
                        box,
                        desturl,
                        condition ;

                        // if we're dealing with a table we can't use DIVs
                        box = $(opts.contentSelector).is('table') ? $('<tbody/>') : $('<div/>');
                        desturl = opts.path;

                        instance._debug('heading into ajax', desturl);
                        console.log("destination url => "+ desturl);

                        /*
                         * Earlier the plugin was using jQuery load() method on box to retrieve page fragments
                         * (using url+space+selector trick and itemSelector filtering on returned document)
                         * box.load(url,callback) method was adding the page fragment as first child of box.
                         *
                         * so we also "simulate" that behavior. we find the nextUrl from page and then
                         * use append the page fragment inside box.
                         *
                         *
                         */

                        $.ajax({
                            // params
                            url: desturl,
                            dataType: opts.dataType,
                            complete: function infscr_ajax_callback(jqXHR, textStatus) {
                                condition = (typeof (jqXHR.isResolved) !== 'undefined') ? (jqXHR.isResolved()) : (textStatus === "success" || textStatus === "notmodified");
                                if(condition) {
                                    response = '<div>' + jqXHR.responseText  + '</div>' ;
                                    instance.options.path = $(response).find(opts.nextSelector).attr("href");
                                    data = $(response).find(opts.itemSelector);
                                    //Do the equivalent of box.load here
                                    $(box).append(data);
                                    instance._loadcallback(box,data) ;
                                } else {
                                    instance._error('end');
                                }
                            }
                        });


                        // for manual triggers, if destroyed, get out of here
                        if (opts.state.isDestroyed) {
                            instance._debug('Instance is destroyed');
                            return false;
                        };

                        // we dont want to fire the ajax multiple times
                        opts.state.isDuringAjax = true;
                        opts.loading.start.call($(opts.contentSelector)[0],opts);


                    } //end:retrieve


                });

            });

        </script>
    </body>
</html>
