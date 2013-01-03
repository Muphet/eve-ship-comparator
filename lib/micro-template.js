
var fs = require('fs'),
    MicroTemplate = require('../model/micro-template').MicroTemplate;


MicroTemplate.include = function(path, options) {
    return MicroTemplate.render(fs.readFileSync(__dirname + '/../' + path + '.html', 'utf8'), options);
};

module.exports = function(path, options, fn) {
    if(typeof options === 'function') {
        fn = options;
        options = {};
    }
    
    options.filename = path;
    
    fs.readFile(path, 'utf8', function(err, file) {
        if(err) {
            fn(err);
        } else {
            fn(null, MicroTemplate.render(file, options));
        }
    });
};