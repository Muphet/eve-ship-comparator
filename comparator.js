/*jslint node:true, stupid: true */

"use strict";

var express = require('express'),
    expose  = require('express-expose'),
    fs      = require('fs'),
    YUI     = require('yui'),
    config  = require('./conf/config'),
    Y       = YUI.getInstance(),
    app     = express();

Y.applyConfig(config.server);

Y.use('esc-micro-template', 'esc-ship-service', 'esc-skill-service', function(Y) {
    var MicroTemplate = Y.esc.util.MicroTemplate;
    
    MicroTemplate.include = function(path, options) {
        return MicroTemplate.render(fs.readFileSync(__dirname + '/shared/views/' + path + '.html', 'utf8'), options);
    };
    
    app.engine('html', function(path, options, fn) {
        if(typeof options === 'function') {
            fn = options;
            options = {};
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
    
    
    app.set('db', Y.esc.util.Database.open(config.datasources.database));
    app.set('skillService', Y.esc.service.SkillService.retrieve(config.datasources.skilltree));
    app.set('shipService', new Y.esc.service.ShipService(app.get('db') /*, app.get('skillService') */));
    
});

app.set('name', config.name);
app.set('env',  config.env);
app.set('port', config.port);
app.expose(config.client, 'ESC_CONFIG');


app.use('/shared', express.static(__dirname + '/shared/'));
app.use(express.static(__dirname + '/client/'));

var utilController = require('./server/controllers/util.js'),
    shipController = require('./server/controllers/ship.js');

app.get('/js/templates.js',             utilController.tmpl);
app.get('/compare',                     shipController.compare);
app.get('/search',                      shipController.search);
app.get('/',                            shipController.index);

app.set('view engine', 'html');
app.set('views', config.dirs.views);


module.exports = app;