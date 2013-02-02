var express = require('express'),
    ship = require('./server/controllers/ship'),
    util = require('./server/controllers/util'),
    app = express();
    
app.use(express.static(__dirname + '/shared/'));
app.use(express.static(__dirname + '/client/'));

app.get('/js/templates.js', util.tmpl);

// TODO: swap this for a composed function
app.engine('html', require('./server/lib/micro-template'));

app.set('view engine', 'html');
app.set('views', __dirname + '/shared/views');

app.get('/', ship.index);
app.get('/compare?', ship.compare);

app.get('/data/:resource/:method?', ship.data);

app.listen(process.env.PORT || 8080);