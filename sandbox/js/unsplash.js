var container = document.querySelector('.container');

var infScroll = new InfiniteScroll( '.container', {
  path: 'https://api.unsplash.com/photos?client_id=9ad80b14098bcead9c7de952435e937cc3723ae61084ba8e729adb642daf0251&page={{#}}',
  responseType: '',
  history: false,
});

infScroll.on( 'load', function( response ) {
  var data = JSON.parse( response );
  var itemsHTML = data.map( getItem ).join('');
  container.innerHTML += itemsHTML;
});

var itemTemplateSrc = document.querySelector('#item-template').innerHTML;

function getItem( photo ) {
  return microTemplate( itemTemplateSrc, photo );
}

// micro templating, sort-of
function microTemplate( src, data ) {
  return src.replace( /\{\{([\w\-\.]+)\}\}/gi, function( match, key ) {
    var parts = key.split('.');
    var value = data;
    for ( var i=0; i < parts.length; i++ ) {
      var part = parts[i];
      value = value[ part ];
    }
    return value;
  });
}

// load first page
infScroll.loadNextPage();
