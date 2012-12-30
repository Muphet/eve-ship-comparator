var express = require('express'),
    ship = require('./controllers/ship'),
    util = require('./controllers/util'),
    app = express();
    
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/model'));

app.use(function(err, req, res, next) {
    // console.error(err);
    res.send(500, "Something bad happen!");
});

app.engine('html', require('./lib/micro-template'));

app.set('view engine', 'html');

app.set('views', __dirname + '/views');

app.get('/', ship.index);

app.get('/compare?', ship.compare);

app.get('/templates.js', util.tmpl);

app.listen(process.env.PORT || 8080);