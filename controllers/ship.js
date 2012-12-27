var DB           = new (require('../lib/db').ItemDB)('data/463858/database.sqlite'),
    ShipService  = new (require('../lib/ship-service').ShipService)(DB),
    SkillService = new (require('../lib/skill-service').SkillService)('https://api.eveonline.com/eve/SkillTree.xml.aspx');


exports.index = function(req, res, next) {        
    res.redirect('/compare');
};
    
exports.compare = function(req, res, next) {
    var ships = Object.keys(req.query),
        i, l;
        
        
    ShipService.getByName(ships).then(function(s) {
        
        res.render('compare', { ships: s });
    });
};
