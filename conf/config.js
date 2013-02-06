/*jslint node:true, stupid:true */

"use strict";

var fs          = require('fs'),
    path        = require('path'),
    Y           = require('yui/oop'),
    appRoot     = '',
    configFile  = path.join(__dirname, 'config.json'),
    clone       = function(o) { return JSON.parse(JSON.stringify(o)); },
    NODE_ENV    = process.env.NODE_ENV,
    PORT        = process.env.PORT,

    isProd      = NODE_ENV === 'production',

    FILTER      = isProd ? 'min' : 'debug',
    
    config;
    
config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

config.port = isProd ? PORT : config.port;

Y.Object.each(config.dirs, function(dir, name, dirs) {
    dirs[name] = path.join(appRoot, dir);
});

Y.mix(config.server, {
    debug: !isProd,
    filter: FILTER,
    
    groups: {
        server: {
            base: path.join(appRoot, config.dirs.serverBase),
            filter: FILTER,
            modules: clone(config.yui.modules.server)
        },
        shared: {
            base: path.join(appRoot, config.dirs.sharedBase),
            filter: FILTER,
            modules: clone(config.yui.modules.shared)
        }
    }
}, true);

Y.mix(config.client, {
    debug: !isProd,
    filter: FILTER,
    
    groups: {
        client: {
            base: '/js/',
            filter: FILTER,
            modules: clone(config.yui.modules.client)
        },
        shared: {
            base: '/shared/',
            filter: FILTER,
            modules: clone(config.yui.modules.shared)
        }
    }
});


module.exports = config;