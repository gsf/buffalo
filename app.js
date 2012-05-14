
// Module dependencies

var express = require('express')
  , fs      = require('fs')
  , im      = require('imagemagick')
  , _       = require('underscore');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', '_');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.register('._', {
  compile: function(str, options) {
    var template = _.template(str);

    return function(locals) {
      return template(locals);
    };
  }
});

// Route middleware

function loadImages(req, res, next){
  var dir = './public/images';

  fs.readdir(dir, function(err, files){
    if (err) throw err;
    
    var images = [];
    files.forEach(function(f){
      var path = dir + '/' + f;
      im.identify(path, function(err, features){
        if (features){
          images.push(f);
        }

        images.forEach(function(i){
          var path = dir + '/' + i;
          console.log(path);
          im.readMetadata(path, function(err, meta){
            if (meta.exif){
              console.log('Shot at '+ meta.exif.dateTimeOriginal);
            }
          });
        });
      });
    });

    req.images = JSON.stringify(images);
    // console.log(req.images);
  });

  next();
}

// Routes

app.get('/', function(req, res){
  res.render('index');
});

app.get('/images', loadImages, function(req, res){
  res.send(req.images);
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
