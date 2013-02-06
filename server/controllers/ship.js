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
