var Y = require('yui').getInstance();

function render(res, bodyTemplate, title, model) {
    res.render('layouts/main', {
        page: {
            template: bodyTemplate,
            title: title,
            model: model
        }
    });
}

exports.compare = function(req, res, next) {
    var shipService = req.app.get('shipService');

    var ships = Object.keys(req.query),
        i, l;
        
    if(ships.length) {
        shipService.search(ships).then(function(s) {
            render(res, 'compare', 'Compare Ships', { ships: s });
        });
    } else {
        res.send([]);
    }
    
};

exports.search = function(req, res, next) {
    var shipService = req.app.get('shipService');

    var ships = Object.keys(req.query),
        i, l;
        
    if(ships.length) {
        shipService.search(ships).then(function(s) {
            res.send(s);
        });
    } else {
        res.send([]);
    }
};
