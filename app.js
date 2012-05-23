
// Module dependencies

var express = require('express')
  , fs      = require('fs')
  , im      = require('imagemagick');

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

function loadImages(req, res) {
  var dir = './public/images';
  var imageMeta = {images: []};

  fs.readdir(dir, function(err, files) {
    if (err) throw err;
    var pending = files.length;

    files.forEach(function(f) {
      var path = dir + '/' + f;

      im.identify(path, function(err, features) {
        if (err) return pending--;

        im.readMetadata(path, function(err, meta) {
          if (err) throw err;
          if (meta.exif) {
            imageMeta.images.push({name: f, date: meta.exif.dateTimeOriginal});
            console.log(imageMeta);
          }
          --pending || sendImages(req, res, imageMeta);
        });
      });
    });
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
  loadImages(req, res);
});

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
