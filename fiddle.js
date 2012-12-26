

var ItemDB = require('./lib/db').ItemDB,
    ShipService = require('./lib/ship').ShipService,
    SkillService = require('./lib/skill').SkillService,
    
    db   = new ItemDB('data/463858/database.sqlite'),
    ship = new ShipService(db),
    skill = new SkillService('https://api.eveonline.com/eve/SkillTree.xml.aspx');


// ship.getByName(process.argv[2] || "Punisher").then(function(ships) {
//     console.log(JSON.stringify(ships, null, '\t'));    
// }, function(fail) {
//     console.log(fail);
// });


skill.get(33001).then(function(s) {
    console.log(s);

    console.log(s.requirements[0].skill);
    
}, function(e) {
    console.log(e);
})
