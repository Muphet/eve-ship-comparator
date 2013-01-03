var DB           = new (require('../lib/db').ItemDB)('data/463858/database.sqlite'),
    ShipService  = new (require('../lib/ship-service').ShipService)(DB),
    SkillService = new (require('../lib/skill-service').SkillService)('https://api.eveonline.com/eve/SkillTree.xml.aspx');

var serviceMap = {
    'ship': {
        service: ShipService,
        methods: {
            'getByNameOrType': true
        }
    },
    'skill': {
        service: SkillService,
        methods: {
            'getTree': true
        }
    }
};


exports.index = function(req, res, next) {        
    var ships = Object.keys(req.query),
        i, l;
        
    if(ships.length) {
        ShipService.getByNameOrType(ships).then(function(s) {
            res.render('index', { ships: s });
        });
    } else {
        res.render('index', { ships: [] });
    }
};
    
exports.compare = function(req, res, next) {
    var ships = Object.keys(req.query),
        i, l;
        
    if(ships.length) {
        ShipService.getByNameOrType(ships).then(function(s) {
            res.render('compare', { ships: s });
        });
    } else {
        res.render('compare', { ships: [] });
    }
};

exports.data = function(req, res, next) {
    var p = req.params,
        svcCfg = serviceMap[req.params.resource],
        service = svcCfg.service,
        method  = (svcCfg.methods[p.method] && svcCfg.service[p.method]) ? svcCfg.service[p.method] : false;
    
    method.call(service, Object.keys(req.query)).then(function(f) {
        res.send(f);
    });
};
