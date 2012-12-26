

var ItemDB = require('./lib/db').ItemDB,
    ShipService = require('./lib/ship').ShipService,
    
    db   = new ItemDB('data/463858/database.sqlite'),
    ship = new ShipService(db);
    

ship.getByName(process.argv[2] || "Punisher").then(function(ships) {
    console.log(JSON.stringify(ships, null, '\t'));    
}, function(fail) {
    console.log(fail);
});
