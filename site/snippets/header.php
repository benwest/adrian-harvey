<!doctype html>
<html lang="<?= site()->language() ? site()->language()->code() : 'en' ?>">
<head>

  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />

  <title><?= $site->title()->html() ?></title>
  <meta name="description" content="<?= $site->description()->html() ?>">
  <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1">

  <?= css('assets/css/index.css') ?>
  
  <!--<link href="https://fonts.googleapis.com/css?family=Cormorant+Garamond" rel="stylesheet">-->

</head>
<body>
  <img id="cursor"></div>

