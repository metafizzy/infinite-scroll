<?php

	/*
	 * infinite scrolling pattern applied to a PHP script
     * that generates content based on requested  page variable 
     * 
     * Please note that nextURL is only used for determining URL 
     * structure on first load, hence there is no need to generate 
     * new next URL on subsequent page loads.
     * 
     * installation : just create a test/infinite folder inside your DocumentRoot
     * and drop posts.php script there
     * 
     * To Test : access  http://<your-host>/test/infinite/posts.php in your browser
     * 
     * This script will add 25 boxes of random strings on page load.
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

	$page = isset($_REQUEST["page"]) ? $_REQUEST["page"] : 1 ;
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
	

?>

<!DOCTYPE html>
<html>

    <head>
	    <title> Naive PHP pagination with infinite scrolling plugin  </title>
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
    					printf("<h3> page %s - record %s </h3>",$page,$count);
    					printf($record);
    					printf("</div>");
    					$count++ ;
    				}
    			?>
    		</div>

    	</div>
    	<div id="scroll-loading"> </div>

    	<ul class="pager"> 
    		<li> <a rel="next" href="/test/infinite/posts.php?page=2">Next &rarr;</a> <li> 
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

                        loading : {
                            selector : "#scroll-loading",
                            msgText: "<em>Please wait. Loading more items...</em>",
                            finishedMsg : "<b> You have reached the end of this page </b>",
                            speed: "slow"

                        }

                    }
                );

            });

        </script>
    </body>
</html>
