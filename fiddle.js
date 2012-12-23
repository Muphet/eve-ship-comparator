

var ItemDB = require('./lib/db').ItemDB,
    ShipService = require('./lib/ship').ShipService,
    
    db   = new ItemDB('data/cutting-edge-current-db.sqlite'),
    ship = new ShipService(db);
    

ship.getByName('rorqual').then(function(ships) {
    console.log();
    console.log();
    console.log(ships[0]);
}, function(fail) {
    console.log(fail);
});
