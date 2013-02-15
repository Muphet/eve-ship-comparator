/*jslint node:true */

"use strict";

var Y = require('yui').getInstance();

function render(res, bodyTemplate, title, model) {
    res.render('layouts/main', {
        page : {
            view     : bodyTemplate, // todo: make this configurable
            template : bodyTemplate,
            title    : title,
            model    : model
        }
    });
}

exports.compare = function (req, res, next) {
    res.redirect('/' + (req._parsedUrl.search || '?') );
};

exports.index = function (req, res, next) {
    var shipService = req.app.get('shipService'),
        ships = Object.keys(req.query);

    if (ships.length) {
        shipService.search(ships).then(function (s) {
            render(res, 'index', 'Compare Ships', {
                ships : s,
                keywords: ships
            });
        }, function (err) {
            Y.log(err.stack, "error");
            render(res, 'index', 'Compare Ships', { ships : [], keywords: [] });
        });
    } else {
        render(res, 'index', 'Compare Ships', { ships : [], keywords: [] });
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
