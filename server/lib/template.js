var micro = require('../../shared/micro').Micro,
    path = require('path'),
    fs = require('fs');


module.exports = function(path, data, callback) {
    fs.readFile(path, 'utf8', function(err, tmplString) {
        if(err) {
            callback(err);
        } else {
            callback(null, micro.render(tmplString, data));
        }
    });
};

module.exports.template = function(req, res) {
    var view = req.params.pop(0),
        viewPath = path.join(req.app.get('views'), view + '.html');

    if(view.indexOf('..') !== -1 || view.indexOf('~') !== -1) {
        res.send(500, { error: "Illegal access." });
    }

    fs.readFile(viewPath, 'utf8', function(err, tmplString) {
        if(err) {
            console.error(err);
            res.send(500, { error: err });
        } else {
            res.type('js');
            res.send([
                'window.templates = (window.templates || {});',
                'window.templates["' + view + '"] = Micro.revive(' + micro.precompile(tmplString) + ');'
            ].join('\n'));
        }
    });
};
