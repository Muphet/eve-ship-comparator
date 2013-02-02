

var YUI = require('yui').YUI,
    path = require('path');


YUI({
    groups: {
        server: {
            base: path.join(__dirname, './server/'),
            modules: {
                // LIB:
                'esc-sqlite'        : { path: 'lib/sqlite.js',        requires: [ 'esc-promise', 'oop' ] },
                'esc-ship-service'  : { path: 'lib/ship-service.js',  requires: [ 'esc-promise', 'esc-sqlite' ] },
                'esc-skill-service' : { path: 'lib/skill-service.js', requires: [ 'esc-promise', 'esc-sqlite' ] }
            }
        },
        
        shared: {
            base: path.join(__dirname, './shared/'),
            modules: {
                // UTILS:
                'esc-micro-template'  : { path: 'utils/micro-template.js' },
                'esc-promise'         : { path: 'utils/promise.js' },

                // MODEL:
                'esc-ship-properties' : { path: 'model/ship-properties.js' },
                'esc-hp-pool'         : { path: 'model/hp-pool.js' },
                'esc-skill'           : { path: 'model/skill.js' },
                'esc-ship'            : { path: 'model/ship.js',
                    requires: [
                        'esc-hp-pool',
                        'esc-skill',
                        'esc-ship-properties'
                    ]
                }
            }
        }
    }
}).use('esc-sqlite', function(Y) {
    var db = Y.esc.Database,
        DBFILE = './server/data/database.sqlite',
    
        QUERY = [
            "select * from invTypes, invGroups",
            "where invGroups.groupName like '%titan%'",
            "and invTypes.groupID == invGroups.groupID",
            "and invGroups.categoryID == 6" ].join(' ');
    
    
    db.open(DBFILE).all(QUERY)
        .map(function(s) { return s.mass })
        .reduce(function(p,c,i,a) { return p + (c / a.length); }, 0).then(function(r) {
            console.log("Average mass: " + (r / 1000000).toFixed(2) + " million kilograms");
        });
    
    
});