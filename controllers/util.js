
var fs = require('fs'),
    Q  = require('q'),
    MicroTemplate = require('../model/micro-template').MicroTemplate;


var TMPL_CACHE; // TODO: figure out somewhere better / some way better to do this

var TMPL_PATH = '/views/shared/';

function getTemplates() {
    var d = Q.defer();
    
    if(TMPL_CACHE && process.env !== 'development') {
        d.resolve(TMPL_CACHE);
    } else {
        TMPL_CACHE = {};
        fs.readdir('.' + TMPL_PATH, function(err, files) {
            if(err) {
                throw err;
            } else {            
                Q.all(files.map(function(f) { return getTemplate(f) })).then(function(tmpls) {
                    TMPL_CACHE = tmpls;

                    d.resolve(TMPL_CACHE);
                });
            }
        });
    }
    
    return d.promise;
}

function getTemplate(f) {
    var d = Q.defer();
    
    fs.readFile('.' + TMPL_PATH + f, 'utf8', function(err, file) {
        if(!err) {
            d.resolve({
                path: TMPL_PATH + f.split('.')[0],
                template: MicroTemplate.precompile(file)
            });
        } else {
            throw err;
        }
    });
    
    return d.promise;
}

exports.tmpl = function(req, res, next) {
    getTemplates().then(function(tmpls) {
        res.set('Content-Type', 'text/javascript');
        
        var out = [
            'window.esc = window.esc || {};',
            'window.esc.tmpl = {};'
        ];
        
        
        tmpls.forEach(function(t) {
            out.push('window.esc.tmpl["' + t.path + '"] = ' + t.template);
        });
        
        out.push([
            'window.esc.MicroTemplate.include = function(path, options) {',
            '\treturn window.esc.MicroTemplate.revive(window.esc.tmpl[path])(options);',
        '}'].join('\n'));
        
        res.send(out.join('\n'));
        
    }).fail(function() {
        console.log(arguments);
    });
};