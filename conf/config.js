
var fs          = require('fs'),
    path        = require('path'),
    Y           = require('yui/oop'),
    appRoot     = '',
    configFile  = path.join(__dirname, 'config.json'),
    clone       = function(o) { return JSON.parse(JSON.stringify(o)); },
    mix         = function(o1, o2) { return Y.mix(o1, o2, true, null, 0, true); },

    NODE_ENV    = process.env.NODE_ENV,
    PORT        = process.env.PORT,
    FILTER      = NODE_ENV === 'production' ? 'min' : 'debug',
    
    config;
    
config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

Y.Object.each(config.dirs, function(dir, name, dirs) {
    dirs[name] = path.join(appRoot, dir);
});

Y.mix(config.server, {
    debug: NODE_ENV !== 'production',
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
    debug: NODE_ENV !== 'production',
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