
// Module dependencies

var express = require('express')
  , awssum  = require('awssum')
  , url     = require('url')
  , https   = require('https');

var inspect = require('eyes').inspector();

var ExifImage = require('exif').ExifImage;

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
  var amazon = awssum.load('amazon/amazon');
  var S3 = awssum.load('amazon/s3').S3;
  var s3 = new S3({
    'accessKeyId' : process.env.ACCESS_KEY_ID,
    'secretAccessKey' : process.env.SECRET_ACCESS_KEY,
    'region' : amazon.US_EAST_1
  });
  var bucket = 'milesbuffalo';
  var path = 'https://s3.amazonaws.com/milesbuffalo/'

  var options = {
      BucketName : bucket,
  };

  var imageMeta = {images: []};
  s3.ListObjects(options, function(err, data) {
    var pending = data.Body.ListBucketResult.Contents.length;
    data.Body.ListBucketResult.Contents.forEach(function(item) {
      imageMeta.images.push({name: item.Key, date: 'May 25, 2011'});
      --pending || sendImages(req, res, imageMeta);
    });
  });
}

function sendImages(req, res, imageMeta) {
  imageMeta.images.sort(function(a,b) {
    return a.date - b.date;
  });

  res.send(JSON.stringify(imageMeta));
}

// Routes

app.get('/images', function(req, res) {
  loadImages(req, res);
});

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
