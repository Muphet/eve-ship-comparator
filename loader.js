

var YUI = require('yui').YUI,
    path = require('path');


YUI({
    groups: {
        shared: {
            base: path.join(__dirname, './shared/model/'),
            modules: {
                'esc-ship-properties' : { path: 'ship-properties.js' },
                'esc-hp-pool'   : { path: 'hp-pool.js' },
                'esc-skill'     : { path: 'skill.js' },
                'esc-ship'      : { path: 'ship.js',
                    requires: [
                        'esc-hp-pool',
                        'esc-skill',
                        'esc-ship-properties'
                    ]
                }
            }
        }
    }
}).use('esc-hp-pool', function(Y) {
    console.log(Y.esc);
    
    var e = Y.esc;
    
    
});