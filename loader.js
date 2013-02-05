

var YUI = require('yui').YUI,
    path = require('path');


YUI({
    groups: {
        server: {
            base: path.join(__dirname, './server/'),
            modules: {
                // LIB:
                'esc-sqlite'        : { path: 'lib/sqlite.js',        requires: [ 'esc-promise', 'oop' ] },
                'esc-select'        : { path: 'lib/select.js',        requires: [] },
                'esc-ship-service'  : { path: 'lib/ship-service.js', 
                    requires: [
                        'esc-sqlite',
                        'esc-select',
                        'esc-ship'
                    ]
                },
                'esc-skill-service' : { path: 'lib/skill-service.js',
                    requires: [
                        'esc-promise',
                        'esc-skill',
                        'oop'
                    ]
                }
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
}).use('esc-skill-service', 'esc-ship-service', function(Y) {
    var db = Y.esc.Database.open('./server/data/database.sqlite')
        skillService = Y.esc.SkillService.retrieve('https://api.eveonline.com/eve/SkillTree.xml.aspx'),
        shipService  = new Y.esc.ShipService(db, skillService);
    
    
    shipService.search('Oracle').then(function(ships) {

       console.log(JSON.stringify(ships, null, '  '));

    });

});