/*jslint node:true */

"use strict";

var Y = require('yui').getInstance();

function render(res, bodyTemplate, title, model) {
    res.render('layouts/main', {
        page : {
            template : bodyTemplate,
            title    : title,
            model    : model
        }
    });
}

exports.index = function (req, res, next) {
    res.redirect('/compare?punisher&merlin&rifter&tristan');
};

exports.compare = function (req, res, next) {
    var shipService = req.app.get('shipService'),
        ships = Object.keys(req.query);

    if (ships.length) {
        shipService.search(ships).then(function (s) {
            render(res, 'compare', 'Compare Ships', { ships : s });
        }, function (err) {
            Y.log(err.stack, "error");
            render(res, 'compare', 'Compare Ships', { ships : [] });
        });
    } else {
        render(res, 'compare', 'Compare Ships', { ships : [] });
    }

};

exports.search = function (req, res, next) {
    var shipService = req.app.get('shipService'),
        ships = Object.keys(req.query),
        i, l;

    if (ships.length) {
        shipService.search(ships).then(function (s) {
            res.send(s);
        });
    } else {
        res.send([]);
    }
};

exports.fourAcross = function (req, res, next) {
    var shipService = req.app.get('shipService'),
        ships = [];

    if(req.params.ship1) { ships.push(req.params.ship1); }
    if(req.params.ship2) { ships.push(req.params.ship2); }
    if(req.params.ship3) { ships.push(req.params.ship3); }
    if(req.params.ship4) { ships.push(req.params.ship4); }

    if(ships.length) {
        shipService.search(ships).then(function(returnedShips) {
            var shipNames = returnedShips.map(function(ship) { return ship.name; }),
                lastShipName = shipNames.pop();

            render(res, 'fourAcross', 'Comparing ' + shipNames.join(', ') + ' and ' + lastShipName, {
                ships: returnedShips
            });
        });
    }

};
