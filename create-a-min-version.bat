ECHO Title: JS Minify Script
ECHO 
ECHO Author: Paul Irish
ECHO Date: 09/03/2008
ECHO 
ECHO This batch file will minify using YUI compressor
ECHO Download here: http://developer.yahoo.com/yui/compressor/

del jquery.infinitescroll.min.js

java -jar yuicompressor-2.3.4.jar -v jquery.infinitescroll.js -o jquery.infinitescroll.min.js