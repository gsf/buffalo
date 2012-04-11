
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
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

var images = [
    { id: 1, filename: '1.jpg' }
  , { id: 2, filename: '2.jpg' }
  , { id: 3, filename: '3.jpg' }
  , { id: 4, filename: '4.jpg' }
  , { id: 5, filename: '5.jpg' }
];

// Routes

app.get('/', function(req, res){
  res.render('index', { images: images })
});

app.get('/image/:id', function(req, res){
  res.render('image', { images: images })
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
