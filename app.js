
// Module dependencies

var express = require('express')
  , fs      = require('fs')
  , im      = require('imagemagick')
  , redis   = require('redis-url').connect(process.env.REDISTOGO_URL)
  , dropbox = require('dropbox').DropboxClient;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.use(express.methodOverride());
  app.use('/', express.static(__dirname + '/views'));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

function loadParams(req, res) {
  var redisKeys = ['key', 'secret', 'username', 'password'];
  var pending = redisKeys.length
  var dropboxParams = [];

  redisKeys.forEach(function(key) {
    redis.get(key, function(err, value) {
      dropboxParams[key] = value;
      --pending || loadImages(req, res, dropboxParams);
    });
  });
}

function loadImages(req, res, params) {
  console.log(params);

  var path = '/MBG';
  var imageMeta = {images: []};
  var MBG = new dropbox(params.key, params.secret);
  
  MBG.getAccessToken(params.username, params.password, function (err, token, secret) {
    if (err) throw err;

    // MBG.getMetadata(path, function(err, metadata) {
    //   if (err) throw err;

    //   console.log(metadata);

    //   // var pending = files.length;

    //   // files.forEach(function(f) {
    //   //   var path = dir + '/' + f;

    //   //   im.identify(path, function(err, features) {
    //   //     if (err) return pending--;

    //   //     im.readMetadata(path, function(err, meta) {
    //   //       if (err) throw err;
    //   //       if (meta.exif && meta.exif.dateTimeOriginal) {
    //   //         imageMeta.images.push({name: f, date: meta.exif.dateTimeOriginal});
    //   //         // console.log(imageMeta);
    //   //       }
    //   //       --pending || sendImages(req, res, imageMeta);
    //   //     });
    //   //   });
    //   // });
    // });
  });
}

function sendImages(req, res, imageMeta) {
  imageMeta.images.sort(function(a,b) {
    return b.date - a.date;
  });

  res.send(JSON.stringify(imageMeta));
}

// Routes

app.get('/images', function(req, res) {
  loadParams(req, res);
});

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
