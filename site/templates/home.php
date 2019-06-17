<?php snippet('header');

function walk( $page, $parent ) {
  
  echo '<ul>';
  
  if ( !$page -> introduction() -> empty() ) {
    echo '<li class="introduction">';
    echo str_replace( '<img src=', '<img data-src=', $page -> introduction() -> kirbytext() );
    echo '</li>';
  }
  
  $children = $page->children()->visible();
    
  if( $parent == 'Journal' ) {
    $children = $children -> sortBy('date', 'desc');
  }
  
  foreach( $children as $page ) {
    
    $title = $page->title();
    
    echo '<li class="title" data-url="/' . $page->uri() . '">';
      echo $title->html();
      if( $parent == 'Journal' ) {
        echo '<sup>(' . $page -> date('d&#8901;m&#8901;y') . ')</sup>';
      }
    echo '</li>';
    
    echo '<li class="content">';
    
    if ( $page -> children() -> count() > 0 ) {
      walk( $page, $page -> title() );
    } else {
      echo '<ul>';
        echo '<li class="text">';
          if ( !$page -> introduction() -> empty() ) {
            echo '<div class="introduction">';
            echo str_replace( '<img src=', '<img data-src=', $page -> introduction() -> kirbytext() );
            echo '</div>';
          }
          echo str_replace( '<img src=', '<img data-src=', $page -> text() -> kirbytext() );
        echo '</li>';
      echo '</ul>';
    }
    
    echo '</li>';
    
  }
  
  echo '</ul>';
  
}

?>
<ul class="root">
  <li class="title main-title" data-url="/">
    <strong><?= $site->title()->html() ?></strong><br>
    <?= $page->intro()->html() ?>
  </li>
  <li class="content hidden">
    <?php walk($site, '') ?>
  </li>
</ul>
<div class="close"></div>
<div class="loading">
  <div></div>
  <div></div>
  <div></div>
</div>
<?php snippet('footer') ?>