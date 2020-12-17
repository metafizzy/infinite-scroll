/* globals Masonry, imagesLoaded */

let msnry = new Masonry( '.grid', {
  itemSelector: '.grid-item',
  columnWidth: '.grid-sizer',
  percentPosition: true,
  stagger: 30,
  visibleStyle: { transform: 'translateY(0)', opacity: 1 },
  hiddenStyle: { transform: 'translateY(100px)', opacity: 0 },
} );

const clientId = '9ad80b14098bcead9c7de952435e937cc3723ae61084ba8e729adb642daf0251';

let infScroll = new InfiniteScroll( '.grid', {
  path: `https://api.unsplash.com/photos?client_id=${clientId}&page={{#}}`,
  responseBody: 'json',
  status: '.scroll-status',
  history: false,
} );

let proxyDiv = document.createElement('div');

infScroll.on( 'load', function( data ) {
  // convert data into HTML
  let itemsHTML = data.map( getItem ).join('');
  // get elements from HTML string
  proxyDiv.innerHTML = itemsHTML;
  let items = proxyDiv.querySelectorAll('.grid-item');
  // append items after imagesLoaded
  imagesLoaded( items, function() {
    infScroll.appendItems( items );
    msnry.appended( items );
  } );
} );

// load first page
infScroll.loadNextPage();

// ----- template ----- //

let itemTemplateSrc = document.querySelector('#item-template').innerHTML;

function getItem( photo ) {
  return microTemplate( itemTemplateSrc, photo );
}

// micro templating, sort-of
function microTemplate( src, data ) {
  // replace {{tags}} in source
  return src.replace( /\{\{([\w\-_.]+)\}\}/gi, function( match, key ) {
    // walk through objects to get value
    let value = data;
    key.split('.').forEach( ( part ) => {
      value = value[ part ];
    } );
    return value;
  } );
}
