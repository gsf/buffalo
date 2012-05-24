
// Module dependencies

var express = require('express')
  , fs      = require('fs')
  , im      = require('imagemagick')
  , redis   = require('redis-url').connect(process.env.REDISTOGO_URL)
  , dropbox = require('dropbox').DropboxClient
  , oauth   = require('oauth-client');

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

app.get('/authorize', function(req, res) {
  var key = '0as9n56d4x5str5';
  var secret = 'j4b4h7274obs32r';
  var consumer = oauth.createConsumer(key, secret);
  var signer = oauth.createHmac(consumer);

  // get a Request Token from dropbox
  var request = {
      host: 'api.dropbox.com',
      path: '/1/1/oauth/request_token',
      oauth_consumer_key: key,
      oauth_signature_method: key,
      oauth_signature: signer,
      oauth_timestamp: key,
      oauth_nonce: key,
      method: 'POST',
      https: true,
      port: 443,
  }

  console.log(request);
  request = oauth.request(request, function(response) {
    if (err) throw err;

    console.log(response);
  });

  // redirect user to dropbox authorization with the Request Token

  // accept user back from their authorization on dropbox
  // request an Access Token from dropbox
  // store the Access Token in Redis
});

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
