
var express = require('express'),
    expose  = require('express-expose'),
    fs      = require('fs'),
    YUI     = require('yui'),
    config  = require('./conf/config'),
    Y       = YUI.getInstance(),
    app     = express();

Y.applyConfig(config.server);

Y.use('esc-micro-template', 'esc-ship-service', 'esc-skill-service', function(Y) {
    var MicroTemplate = Y.esc.MicroTemplate;
    
    MicroTemplate.include = function(path, options) {
        return MicroTemplate.render(fs.readFileSync(__dirname + '/shared/views/' + path + '.html', 'utf8'), options);
    };
    
    app.engine('html', function(path, options, fn) {
        if(typeof options === 'function') {
            fn = options;
            options - {};
        }
        
        options.filename = path;
        
        fs.readFile(path, 'utf8', function(err, file) {
            if(err) {
                fn(err);
            } else {
                fn(null, MicroTemplate.render(file, options));
            }
        });
    });
    
    
    app.set('db', Y.esc.Database.open(config.datasources.database));
    app.set('skillService', Y.esc.SkillService.retrieve(config.datasources.skilltree));
    app.set('shipService', new Y.esc.ShipService(app.get('db') /*, app.get('skillService') */));
    
});

app.set('name', config.name);
app.set('env',  config.env);
app.set('port', config.port);
app.expose(config.client, 'ESC_CONFIG');


app.use('/shared', express.static(__dirname + '/shared/'));
app.use(express.static(__dirname + '/client/'));

app.get('/js/templates.js', require('./server/controllers/util.js').tmpl);
app.get('/compare', require('./server/controllers/ship.js').compare);
app.get('/search', require('./server/controllers/ship.js').search);
app.get('/', require('./server/controllers/ship.js').index);

// app.engine('html', require('./server/lib/micro-template'));

app.set('view engine', 'html');
app.set('views', config.dirs.views);


module.exports = app;