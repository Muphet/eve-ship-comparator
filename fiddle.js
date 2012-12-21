
var ItemDB = require('./lib/db').ItemDB,
    ShipService = require('./lib/ship').ShipService,
    
    db   = new ItemDB('data/cutting-edge-current-db.sqlite'),
    ship = ShipService(db);
    

var q = [
    'SELECT typeID, typeName, categoryID, invGroups.groupID, invTypes.groupID',
    'FROM invTypes, invGroups',
    'AND invGroups.categoryID == 6',
    'AND invGroups.groupID == invTypes.groupID'
].join(' ');

db.all(q).then(function(result) {
    console.log(result);
    
    console.log(result.length);
}, function(fail) {
    console.log(fail);
});