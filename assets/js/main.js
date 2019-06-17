/* global navigator */
/* global location */
/* global $ */
/* global FontLoader */

var DEFAULT_DURATION = 400;

var LIGHTEST = 230;
var DARKEST = 0;
var GAMMA = .5;

/* FEATURE DETECTION */

if ( !('ontouchstart' in window) || !navigator.maxTouchPoints && !navigator.msMaxTouchPoints ) $('body').addClass('no-touch');

var ua = window.navigator.userAgent;
if (ua.indexOf('Edge/') === -1 && 
    ua.indexOf('Trident/') === -1 && 
    ua.indexOf('MSIE ') === -1 ){
   $('body').addClass('not-ie');
}

var transformProp = (function(){
  var testEl = document.createElement('div');
  if(testEl.style.transform == null) {
    var vendors = ['Webkit', 'Moz', 'ms'];
    for(var vendor in vendors) {
      if(testEl.style[ vendors[vendor] + 'Transform' ] !== undefined) {
        return vendors[vendor] + 'Transform';
      }
    }
  }
  return 'transform';
})();

/* TREE */

var $root = $('.root');
var $html = $('html');

function walk( $ul, fn, depth ) {
    
    if( !depth ) depth = 0;
    
    var $lis = $ul
        .children('.title, .content')
        .toArray()
        .map(function(li){ return $(li) });
    
    if ( $lis.length <= 1 ) return;
    
    var $title, $content, $next;
    
    for ( var i = 0; i < $lis.length; i += 2 ) {
        
        $title = $lis[ i ];
        $content = $lis[ i + 1 ];
        
        $next = $content.children().eq(0);
        
        if( $next.is('ul') ) walk( $next, fn, depth + 1 );
        
        fn( $title, $content, depth );
        
    }
    
}

function mapValue ( value, inMin, inMax, outMin, outMax ) {
    
    return outMin + ( outMax - outMin ) * ( value - inMin ) / ( inMax - inMin );
    
}

function show( $title, $content, follow ) {
    
    $title.addClass('active');
    
    $content.slideDown({
        duration: DEFAULT_DURATION,
        step: follow
            ? function () {
                
                var offset = $title.offset().top;
                
                var st = Math.min( Math.max( window.pageYOffset, offset - window.innerHeight ), offset );
                
                window.scrollTo( 0, st );
                
            }
            : function () {}
    }).removeClass('hidden');
    
    var $text = $content.children().eq(0).children().eq(0);
    
    if( $text.hasClass('text') ) {
        
        watchLength( $text, $title, $content );
        
        if ( !$text.hasClass('loaded') ) {
        
            $text.find('img').each(function(){
                
                var $this = $(this);
                
                if( !$this.attr('src') ) $this.attr('src', $this.data('src') );
                
            })
        
            $text.addClass('loaded');
        
        }
        
    }
}

function hide( $title, $content, duration ) {
    
    if( duration === undefined ) duration = DEFAULT_DURATION;
    
    $title.removeClass('active');
    
    $content.slideUp( duration ).addClass('hidden');
    
}

function isHidden( $content ) {
    
    return $content.hasClass('hidden');
    
}

function close( $title, $content ) {
    
    walk( $content.children(), function( $otherTitle, $otherContent ) {
        
        hide( $otherTitle, $otherContent );
        
    });
    
    hide( $title, $content );
    
    style();
    
    var top = $title.offset().top;
    
    $html.animate( { scrollTop: top } );
    
}

function open( $title, $content ) {
    
    walk( $root, function( $otherTitle, $otherContent ){
        
        if ( $otherContent.is( $content ) ) {
            
            // target
            
            show( $otherTitle, $otherContent, true );
            
        } else if ( $otherContent.find( $content ).length ) {
            
            // parent of target
            
            show( $otherTitle, $otherContent );
            
        } else {
            
            hide( $otherTitle, $otherContent );
            
        }
        
    })
    
    style();
    
}

var depthSorted = [ $root ];

walk( $root, function( $title, $content, depth ){
    
    var idx = depth + 1;
    
    var $ul = $content.children();
    
    if( !depthSorted[ idx ] ) {
        
        depthSorted[ idx ] = $ul;
        
    } else {
        
        depthSorted[ idx ] = depthSorted[ idx ].add( $ul );
        
    }
    
})

function rgb ( r, g, b ) {
    
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    
}

function rgbGrey ( value ) {
    
    return rgb( value, value, value );
    
}

function gammaCorrect( color, gamma ) {
    
    return Math.round( Math.pow( color / 255, gamma ) * 255 );
    
}

function style () {
    
    var maxDepth = 0;
    
    walk( $root, function( $title, $content, depth ) {
        
        if ( !isHidden( $content ) ) {
            
            maxDepth = Math.max( depth + 1, maxDepth );
            
        }
        
    });
    
    var colorStep = Math.round( ( LIGHTEST - DARKEST ) / ( depthSorted.length - 1 ) );
    
    var color = DARKEST + ( colorStep * maxDepth );
    
    var gammaCorrectedColor;
    
    for( var i = 0; i < depthSorted.length; i++ ) {
        
        console.log(rgbGrey( gammaCorrect( color, GAMMA ) ));
        
        depthSorted[i].css( 'color', rgbGrey( gammaCorrect( color, GAMMA ) ) );
        
        color -= colorStep;
        color = Math.max( color, 0 );
        
    }
    
}

walk( $root, function( $title, $content ) {
    
    hide( $title, $content, 0 );
    
    $title.on('click', function(){
        
        if( $content.hasClass('hidden') ) {
            
            window.location.hash = $title.data('url') || '';
            
            open( $title, $content );
            
        } else {
            
            if( $title.hasClass('main-title') ) {
                
                window.location.hash = $title.data('url') || '';
                
            } else {
                
                window.location.hash = $title.parent().parent().prev().data('url') || '';
                
            }
            
            close( $title, $content );
            
        }
        
    })
    
});

/* CURSOR */

var $cursor = $('#cursor');

$('.title').mouseenter(function(){
    $cursor.css('display', 'block');
}).mouseleave(function(){
    $cursor.css('display', 'none');
}).mousemove(function(e){
    var x = e.clientX;
    var y = e.clientY;
    $cursor.css( transformProp, 'translate3d(' + x + 'px,' + y + 'px,0)' );
    if( $(this).hasClass('active') ) {
        $cursor.attr('src', 'assets/images/arrow_nw.svg');
    } else {
        $cursor.attr('src', 'assets/images/arrow_se.svg');
    }
}).click(function(){
    if( $(this).hasClass('active') ) {
        $cursor.attr('src', 'assets/images/arrow_nw.svg');
    } else {
        $cursor.attr('src', 'assets/images/arrow_se.svg');
    }
})

/* CLOSE BUTTON */

var $window = $(window);
var $close = $('.close');

function watchLength ( $text, $title, $content ) {
    
    function apply () {
        
        var top = $text.offset().top;
        var bottom = top + $text.height();
        
        var on = top < window.pageYOffset && bottom > window.pageYOffset;
        
        $close.toggleClass('visible', on);
        
    }
    
    $close
        .off('click')
        .on('click', function () {
            close( $title, $content );
        })
    
    $window
        .off('scroll.longText resize.longText')
        .on('scroll.longText resize.longText', apply);

}

/* ROUTING */

function handleHash() {
    
    var hash = window.location.hash.replace('#', '');
    
    if( hash ) {
        
        var el = $(".title[data-url='" + hash + "']");
        
        if( el ) open( el, el.next() );
        
    }
    
}

$(window).on( 'hashchange', handleHash );

handleHash();

/* LINKS */

var reHostname = new RegExp(location.host);

$('a').each( function(){
    
    var $this = $(this);
    var href = $this.attr('href');
    
    if ( reHostname.test( href ) || href.charAt( 0 ) === '#' ) {
        
        $this.addClass('internal');
        
    }
    
})

$(function(){
    
    new FontLoader([
        'Cormorant Garamond:n4',
        'Cormorant Garamond:i4',
        'Cormorant Garamond:n6'
    ], {
        complete: function (e) {
            $('body').addClass('loaded');
        }
    }).loadFonts()
    
})

