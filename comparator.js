var express = require('express'),
    ship = require('./controllers/ship').shipController,
    app = express();
    
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/model'));

app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');

app.set('views', __dirname + '/views');

app.get('/', ship.index);

app.get('/compare?', ship.compare);

app.listen(8080);